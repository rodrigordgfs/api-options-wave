import fastify from "fastify";
import cors from '@fastify/cors'
import { createUser } from "../routes";

const app = fastify();

app.register(cors, {
  origin: '*'
})

app.register(createUser);

app.listen({ port: 3456 }).then(() => {
  console.log("Server is running on port 3456");
});
