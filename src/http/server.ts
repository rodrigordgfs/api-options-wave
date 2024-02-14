import fastify from "fastify";
import cors from '@fastify/cors'
import { createUser, helthCheck } from "../routes";

const app = fastify();

app.register(cors, {
  origin: '*'
})

app.register(createUser);
app.register(helthCheck);

app.listen({ port: 3456 }).then(() => {
  console.log("Server is running on port 3456");
});
