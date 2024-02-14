import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { hashPassword } from "../../utils/crypto";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
interface CreateUserRequestBody {
  name: string;
  email: string;
  password: string;
}

const createUserBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function signUp(app: FastifyInstance) {
  app.post("/user", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, email, password } = createUserBodySchema.parse(
        request.body as CreateUserRequestBody
      );

      const existingUser = await findUserByEmail(email);

      if (existingUser) {
        return reply
          .status(StatusCodes.CONFLICT)
          .send({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return reply.status(StatusCodes.CREATED).send({
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
      console.error("Error creating user:", error);
      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Error creating user" });
    }
  });
}
