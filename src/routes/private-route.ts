import { checkAttendance, getFeed, groupie } from "../fun";

const privateRoute = async (pri: any, opts: any) => {
  pri.get("/", async (request: any, reply: any) => {
    const { username, group, role } = request.user;
    const data = await checkAttendance(username, group);
    const feed = await getFeed();

    let feedData = [];

    if (feed.code === 200) {
      feedData = feed.data;
    }

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
        feed: feedData,
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
        feed: feedData,
      });
    }
  });
};

export default privateRoute;
