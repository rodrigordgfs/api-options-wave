import fastify from "fastify";
import cors from "@fastify/cors";
import { signIn, signUp, helthCheck, updateUser } from "../routes";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.register(signIn);
app.register(signUp);
app.register(helthCheck);
app.register(updateUser);

app.listen({ port: 3456 }).then(() => {
  console.log("Server is running on port 3456");
});
