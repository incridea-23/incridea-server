import { createYoga } from "graphql-yoga";
import { createServer } from "node:http";

const port = Number(process.env.API_PORT) || 4000;
const yoga = createYoga({
  graphqlEndpoint: "/graphql",
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log(`🚀 Server ready at: http://localhost:4000/graphql`);
});
