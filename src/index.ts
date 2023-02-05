import { createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { context } from "./context";

const port = Number(process.env.API_PORT) || 4000;
const yoga = createYoga({
  graphqlEndpoint: "/graphql",
  context,
});

const server = createServer(yoga);

server.listen(port, () => {
  console.log(`🚀 Server ready at: http://localhost:4000/graphql`);
});
