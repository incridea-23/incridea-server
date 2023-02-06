import SchemaBuilder from "@pothos/core";
import { DateResolver } from "graphql-scalars";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import ErrorsPlugin from "@pothos/plugin-errors";

import { prisma } from "./context";
import { context } from "./context";
export const builder = new SchemaBuilder<{
  Scalars: {
    Date: { Input: Date; Output: Date };
  };
  PrismaTypes: PrismaTypes;
  Context: ReturnType<typeof context>;
}>({
  plugins: [PrismaPlugin, ErrorsPlugin],
  prisma: {
    client: prisma,
  },
  errorOptions: {
    defaultTypes: [],
  },
});

builder.addScalarType("Date", DateResolver, {});
builder.queryType({});
builder.mutationType({});

builder.objectType(Error, {
  name: "Error",
  fields: (t) => ({
    message: t.exposeString("message"),
  }),
});
