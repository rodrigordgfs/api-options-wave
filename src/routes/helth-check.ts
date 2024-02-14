import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";


export async function helthCheck(app: FastifyInstance) {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(StatusCodes.CREATED).send({
        date: new Date(),
        status: "OK"
      });
  });
}
