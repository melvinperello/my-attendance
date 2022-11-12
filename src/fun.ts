import { authenticator } from "otplib";
import QRCode from "qrcode";
import moment from "moment-timezone";
import { extendMoment } from "moment-range";
const { MA_TIMEZONE } = process.env;
const { Firestore, Timestamp } = require("@google-cloud/firestore");
const firestore = new Firestore();
// @ts-expect-error this is an extension of moment
const momentInstance = extendMoment(moment);

// ----------------------------------------------------
// Firestore Document Paths.
// ----------------------------------------------------
const getAuthorizationPath = (username: string) => {
  return `authorization/${username}`;
};

const getGroupCurrentAttendancePath = (group: string) => {
  return `${getTodayAttendancePath()}/${group}`;
};

const getCurrentAttendancePath = (group: string, username: string) => {
  return `${getGroupCurrentAttendancePath(group)}/${username}`;
};

const getTodayAttendancePath = () => {
  return `attendance/${getMoment().format("YYYY-MM-DD")}`;
};

// ----------------------------------------------------
// Utility Functions.
// ----------------------------------------------------
export const getMoment = (time?: string) => {
  if (time) {
    return moment(time).tz(MA_TIMEZONE as string);
  }
  return moment().tz(MA_TIMEZONE as string);
};

const getDoc = async (name: string) => {
  const document = firestore.doc(name);
  const doc = await document.get();
  if (doc.exists) {
    return doc;
  } else {
    return null;
  }
};

const getAuthDoc = async (username: string) => {
  const doc = await getDoc(getAuthorizationPath(username));
  return doc;
};

const updateAuthDoc = async (username: string, data: any) => {
  const document = firestore.doc(getAuthorizationPath(username));
  await document.update(data);
};

// ----------------------------------------------------
// Service Functions.
// ----------------------------------------------------
export const logAttendance = async (
  username: string,
  group: string,
  status: string
) => {
  const timein = getMoment().format("HH:mm");
  const docName = getCurrentAttendancePath(group, username);

  const doc = await getDoc(docName);
  if (doc) {
    return {
      code: 400,
      message: "already_logged",
      data: doc.data(),
    };
  }

  // ---------------------------------
  // check if the master path is existing.
  const masterPath = getTodayAttendancePath();
  const masterDoc = await getDoc(masterPath);
  if (!masterDoc) {
    // if not existing create and add an expiration.
    const masterDocUpdate = firestore.doc(masterPath);
    await masterDocUpdate.set({
      expireIn: Timestamp.fromDate(getMoment().add(40, "days").toDate()),
    });
  }
  // ---------------------------------

  const document = firestore.doc(docName);
  const data = await document.set({
    status: status,
    timein: timein,
  });

  return {
    code: 201,
    message: "created",
    data: data,
  };
};

export const checkAttendance = async (username: string, group: string) => {
  const doc = await getDoc(getCurrentAttendancePath(group, username));
  if (doc) {
    return {
      code: 200,
      message: "already_logged",
      data: {
        ...doc.data(),
        label: getCurrentAttendancePath(group, username),
      },
    };
  } else {
    return {
      code: 404,
      message: "no_attendance",
      data: null,
    };
  }
};

export const groupie = async (group: string) => {
  const collectionReference = firestore.collection(
    getGroupCurrentAttendancePath(group)
  );
  const attendances = await collectionReference.orderBy("timein").get();
  const attendancesData = attendances.docs.map((d: any) => {
    const thisDocData = d.data();
    let label = "";
    if (thisDocData.status === "PRESENT") {
      label = "success";
    } else if (thisDocData.status === "SICK_LEAVE") {
      label = "dark";
    } else if (thisDocData.status === "EMERGENCY_LEAVE") {
      label = "danger";
    }
    return {
      ...thisDocData,
      name: d.id,
      label: label,
    };
  });
  return {
    code: 200,
    message: "ok",
    data: attendancesData,
  };
};

export const login = async (username: string, code: string) => {
  const doc = await getAuthDoc(username);
  if (!doc) {
    return {
      code: 404,
      message: "user_does_not_exists",
      data: null,
    };
  }
  const { secret, verified, group, role } = doc.data();
  if (!verified) {
    return {
      code: 401,
      message: "user_not_verified",
      data: null,
    };
  }
  const validated = authenticator.check(code, secret);
  if (!validated) {
    return {
      code: 401,
      message: "wrong_code",
      data: null,
    };
  }
  return {
    code: 200,
    message: "ok",
    data: {
      group,
      role,
    },
  };
};

export const register = async (username: string, code: string) => {
  const doc = await getAuthDoc(username);
  if (!doc) {
    return {
      code: 404,
      message: "user_does_not_exists",
      data: null,
    };
  }
  const { secret, verified } = doc.data();
  if (verified) {
    return {
      code: 400,
      message: "user_already_associated",
      data: null,
    };
  }
  const validated = authenticator.check(code, secret);
  if (!validated) {
    return {
      code: 401,
      message: "wrong_code",
      data: null,
    };
  }
  // --------------------------------------
  // Verfied Updated
  // --------------------------------------
  await updateAuthDoc(username, {
    verified: true,
  });
  // --------------------------------------
  return {
    code: 200,
    message: "ok",
    data: {
      username,
    },
  };
};

export const check = async (username: string) => {
  const doc = await getAuthDoc(username);
  if (!doc) {
    return {
      code: 404,
      message: "user_does_not_exists",
      data: null,
    };
  }
  const { verified } = doc.data();
  if (verified) {
    return {
      code: 400,
      message: "user_already_associated",
      data: {
        username,
      },
    };
  }
  return {
    code: 200,
    message: "ok",
    data: {
      username,
    },
  };
};

export const preRegister = async (username: string) => {
  const doc = await getAuthDoc(username);
  if (!doc) {
    return {
      code: 404,
      message: "user_does_not_exists",
      data: null,
    };
  }
  const { verified } = doc.data();
  if (verified) {
    return {
      code: 400,
      message: "user_already_associated",
      data: null,
    };
  }
  //
  const secret = authenticator.generateSecret(); // base32 encoded hex secret key
  await updateAuthDoc(username, {
    secret: secret,
    verified: false,
  });
  const otpauth = authenticator.keyuri(username, "ur-attendance", secret);
  const qrCode = await QRCode.toDataURL(otpauth, {
    errorCorrectionLevel: "H",
    width: 200,
    scale: 10,
    margin: 2,
  });
  return {
    code: 200,
    message: "ok",
    data: {
      secretString: secret,
      secretImageString: qrCode,
    },
  };
};

// ----------------------------------------------------
// Reporting Functions.
// ----------------------------------------------------
export const generateReport = async (
  start: string,
  end: string,
  group: string
) => {
  // create the report range.
  const momentStart = getMoment(start);
  const momentEnd = getMoment(end);
  // -----------------------------------------------
  // Request Filters
  // -----------------------------------------------
  if (momentStart.isAfter(momentEnd)) {
    return {
      code: 400,
      message: "invalid_range_start_after_end",
      data: null,
    };
  }
  if (momentEnd.diff(momentStart, "days") >= 18) {
    return {
      code: 400,
      message: "invalid_range_ge18d",
      data: null,
    };
  }
  if (getMoment().diff(momentStart, "days") >= 35) {
    return {
      code: 400,
      message: "invalid_range_2farfromnow",
      data: null,
    };
  }

  // -----------------------------------------------
  // check if Saved
  // -----------------------------------------------
  const savedReport = await getDoc(`reports/${start}-${end}-${group}`);
  if (savedReport) {
    console.log(
      "[Important] Accessing saved reports for: " +
        `reports/${start}-${end}-${group}`
    );
    const { attendance, tableHeaders, created } = savedReport.data();
    return {
      code: 200,
      message: "ok",
      data: {
        attendance,
        tableHeaders,
        created: getMoment(created.toDate()).format("MMM DD, YYYY h:mm a"),
      },
    };
  }

  // -----------------------------------------------
  // Report Values
  // -----------------------------------------------
  const range = momentInstance.range(momentStart, momentEnd);
  const tableHeaders = [];
  const attendance: any = {};
  const dbthrottlevalue = 20;
  let dbthrottlecount = 0;

  // Iterate the range.
  for (const day of range.by("day")) {
    if (dbthrottlecount > dbthrottlevalue) {
      return {
        code: 429,
        message: "invalid_range_2many",
        data: null,
      };
    }
    // -----------------------------------------------
    // Create Report Headers
    // -----------------------------------------------
    tableHeaders.push({
      number: day.format("DD"),
      name: day.format("ddd"),
      color: ["Sat", "Sun"].includes(day.format("ddd")) ? "secondary" : "light",
    });

    // -----------------------------------------------
    // Do not read future dates in database.
    // -----------------------------------------------
    if (getMoment().isBefore(day)) {
      // do not query future dates
      continue;
    }

    // -----------------------------------------------
    // Query the DB for values.
    // -----------------------------------------------
    const queryReference = firestore.collection(
      `/attendance/${day.format("YYYY-MM-DD")}/core`
    );
    // get the results.
    const queryData = await queryReference.get();
    // iterate the results and construct the members value.
    queryData.docs.forEach((d: any) => {
      if (!attendance[d.id]) {
        attendance[d.id] = {};
      }
      attendance[d.id][day.format("DD")] = d.data();
    });
    // db throttle
    dbthrottlecount++;
  }

  // -----------------------------------------------
  // Fill missing data.
  // -----------------------------------------------
  for (const day of range.by("day")) {
    const today = day.format("DD");
    for (const name in attendance) {
      const currentMember = attendance[name];
      if (!currentMember[today]) {
        currentMember[today] = {};
      }
      const currentStatus = currentMember[today]["status"];

      // -----------------------------------------------
      // Remap Status
      // -----------------------------------------------
      let replacementStatus = "";
      let statusColor = "";
      if (currentStatus === "PRESENT") {
        replacementStatus = "P";
        statusColor = "success";
      } else if (currentStatus === "SICK_LEAVE") {
        replacementStatus = "S";
        statusColor = "dark";
      } else if (currentStatus === "EMERGENCY_LEAVE") {
        replacementStatus = "E";
        statusColor = "danger";
      } else {
        replacementStatus = "X";
        statusColor = "secondary";
      }
      // -----------------------------------------------
      //  Weekend Colors
      // -----------------------------------------------
      if (["Sat", "Sun"].includes(day.format("ddd"))) {
        if (!currentStatus) {
          statusColor = "light";
        }
      }
      currentMember[today] = {
        status: replacementStatus,
        color: statusColor,
      };
    }
  }

  // ---------------------------------------------------
  // Save Report
  // ---------------------------------------------------

  const document = firestore.doc(`reports/${start}-${end}-${group}`);
  await document.set({
    tableHeaders,
    attendance,
    created: Timestamp.fromDate(new Date()),
  });

  console.log(
    "[Important] Reports Created for: " + `reports/${start}-${end}-${group}`
  );

  return {
    code: 200,
    message: "ok",
    data: { tableHeaders, attendance, created: "Now" },
  };
};

export const createReportSelector = async (token: string) => {
  const today: number = parseInt(getMoment().format("D"));
  if (today <= 15) {
    // 1-15 PERIOD 1
    const start = getMoment().startOf("month").format("YYYY-MM-DD");
    const end = getMoment().format("YYYY-MM-15");

    // previous period
    const pStart = getMoment().subtract(1, "month").format("YYYY-MM-16");
    const pEnd = getMoment()
      .subtract(1, "month")
      .endOf("month")
      .format("YYYY-MM-DD");

    return {
      code: 200,
      message: "ok",
      data: { start, end, pStart, pEnd, token },
    };
  } else if (today > 15) {
    // 16 - last PERIOD 2
    const start = getMoment().format("YYYY-MM-16");
    const end = getMoment().endOf("month").format("YYYY-MM-DD");

    // previous period
    const pStart = getMoment().format("YYYY-MM-01");
    const pEnd = getMoment().format("YYYY-MM-15");
    return {
      code: 200,
      message: "ok",
      data: { start, end, pStart, pEnd, token },
    };
  }
};
