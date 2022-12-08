import { createReportSelector, generateReport } from "../fun";

const supervisorRoute = async (sup: any, opts: any) => {
  sup.addHook("onRequest", async (request: any, reply: any) => {
    const { role } = request.user;
    if (role !== "supervisor") {
      return reply.code(401).send({
        code: 401,
        message: "required_role_supervisor",
        data: null,
      });
    }
  });

  sup.get("/reports", async (request: any, reply: any) => {
    const data = await createReportSelector();
    return reply.view("/templates/supervisor-reports.ejs", {
      ...data?.data,
    });
  });

  sup.get("/reports/generate", async (request: any, reply: any) => {
    const { group } = request.user;
    const { start, end } = request.query;
    const data = await generateReport(start, end, group);
    if (data.code !== 200) {
      return reply.code(data.code).send(data);
    }
    return reply.view("/templates/supervisor-reports-generate.ejs", {
      ...data.data,
      start,
      end,
    });
  });
};

export default supervisorRoute;
