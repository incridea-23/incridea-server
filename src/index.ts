import { createYoga } from "graphql-yoga";
import express from "express";
import { context } from "./context";
import { schema } from "./schema";
const port = Number(process.env.API_PORT) || 4000;
const yoga = createYoga({
  graphqlEndpoint: "/graphql",
  context,
  schema,
});

const app = express();

app.use("/", yoga);

app.listen(port, () => {
  console.log(`🚀 Server ready at: http://localhost:4000/graphql`);
});
