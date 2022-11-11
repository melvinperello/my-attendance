import { getMoment, momentInstance } from "../fun";
const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();

const supervisorRoute = async (sup: any, opts: any) => {
  sup.get("/reports", async (request: any, reply: any) => {
    const token = request.query.token;
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
      return reply.view("/templates/supervisor-reports.ejs", {
        start,
        end,
        pStart,
        pEnd,
        token,
      });
    } else if (today > 15) {
      // 16 - last PERIOD 2
      const start = getMoment().format("YYYY-MM-16");
      const end = getMoment().endOf("month").format("YYYY-MM-DD");

      // previous period
      const pStart = getMoment().format("YYYY-MM-01");
      const pEnd = getMoment().format("YYYY-MM-15");
      return reply.view("/templates/supervisor-reports.ejs", {
        start,
        end,
        pStart,
        pEnd,
        token,
      });
    }
  });

  sup.get("/reports/generate", async (request: any, reply: any) => {
    const { start, end } = request.query;
    const momentStart = getMoment(start);
    const momentEnd = getMoment(end);
    const range = momentInstance.range(momentStart, momentEnd);
    const tableHeaders = [];
    for (const day of range.by("day")) {
      tableHeaders.push({
        number: day.format("DD"),
        name: day.format("ddd"),
        color: ["Sat", "Sun"].includes(day.format("ddd"))
          ? "bg-light"
          : "bg-white",
      });
      const queryReference = firestore.collection(
        "/attendance/2022-11-11/core"
      );
      const queryData = await queryReference.get();
      const data = queryData.docs.map((d: any) => {
        const currenData = d.data();
        return currenData;
      });

      break;
    }

    return reply.view("/templates/supervisor-reports-generate.ejs", {
      tableHeaders,
    });
  });
};

export default supervisorRoute;
