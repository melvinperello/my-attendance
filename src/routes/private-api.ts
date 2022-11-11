import { logAttendance } from "../fun";

const privateApi = async (pri: any, opts: any) => {
  pri.post("/attendance", async (request: any, reply: any) => {
    const { selected } = request.body;
    const { username, group } = request.user;
    const data = await logAttendance(username, group, selected);
    return reply.code(data.code).send(data);
  });
};

export default privateApi;
