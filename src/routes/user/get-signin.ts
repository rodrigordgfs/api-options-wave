import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { comparePassword } from "../../utils/crypto";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserRequestQuery {
  email: string;
  password: string;
}

const createUserBodySchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function signIn(app: FastifyInstance) {
  app.get("/user", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = createUserBodySchema.parse(
        request.query as CreateUserRequestQuery
      );

      const user = await findUserByEmail(email);

      if (!user) {
        return reply
          .status(StatusCodes.NOT_FOUND)
          .send({ message: "User not found" });
      }

      const passwordMatch = await comparePassword(password, user.password);

      if (!passwordMatch) {
        return reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: "Invalid email or password" });
      }

      return reply.status(StatusCodes.OK).send({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map((err) => err.message);
        return reply
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "Validation error", errors: errorMessage });
      }
      console.error("Error finding user:", error);
      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Error finding user" });
    }
  });
}
