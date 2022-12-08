import { checkAttendance, groupie } from "../fun";

const privateRoute = async (pri: any, opts: any) => {
  pri.get("/", async (request: any, reply: any) => {
    const { username, group, role } = request.user;
    const data = await checkAttendance(username, group);
    if (data.code === 200) {
      // get all attendance
      const myGroupie = await groupie(group);
      return reply.view("/templates/main.ejs", {
        code: data.code,
        status: data.data.status,
        timein: data.data.timein,
        label: data.data.label,
        role,
        username: username,
        tableData: myGroupie.data,
      });
    } else {
      return reply.view("/templates/main.ejs", {
        code: data.code,
        status: "",
        timein: "",
        label: "",
        role,
        username: username,
        tableData: [],
      });
    }
  });
};

export default privateRoute;
