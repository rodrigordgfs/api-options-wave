import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateUserRequestBody {
  name: string;
  image?: string;
}

interface UpdateUserRequestParams {
  id: string;
}

const updateUserBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
  image: z.string().optional(),
});

const updateUserParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid user ID" }),
});

export async function updateUser(app: FastifyInstance) {
  app.patch(
    "/user/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { name, image } = updateUserBodySchema.parse(
          request.body as UpdateUserRequestBody
        );

        const { id } = updateUserParamsSchema.parse(
          request.params as UpdateUserRequestParams
        );

        const user = await prisma.user.update({
          where: { id },
          data: {
            name,
            image,
          },
        });

        return reply.status(StatusCodes.OK).send({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        } as User);
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
    }
  );
}
