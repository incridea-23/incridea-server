import SchemaBuilder from "@pothos/core";
import { DateResolver, DateTimeResolver } from "graphql-scalars";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import ErrorsPlugin from "@pothos/plugin-errors";
import RelayPlugin from "@pothos/plugin-relay";
import { prisma } from "./utils/db/prisma";
import { context } from "./context";
import SmartSubscriptionsPlugin, {
  subscribeOptionsFromIterator,
} from "@pothos/plugin-smart-subscriptions";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime";
export const builder = new SchemaBuilder<{
  Scalars: {
    Date: { Input: Date; Output: Date };
    DateTime: { Input: Date; Output: Date };
  };
  PrismaTypes: PrismaTypes;
  Context: ReturnType<typeof context>;
}>({
  plugins: [ErrorsPlugin, PrismaPlugin, RelayPlugin, SmartSubscriptionsPlugin],
  relayOptions: {
    clientMutationId: "omit",
    cursorType: "String",
  },
  smartSubscriptions: {
    ...subscribeOptionsFromIterator((name, ctx) => {
      return ctx.pubsub.asyncIterator(name);
    }),
  },
  prisma: {
    client: prisma,
  },
  errorOptions: {
    defaultTypes: [],
  },
});

builder.addScalarType("Date", DateResolver, {});
builder.addScalarType("DateTime", DateTimeResolver, {});
builder.queryType({});
builder.mutationType({});
builder.subscriptionType({});

builder.objectType(Error, {
  name: "Error",
  fields: (t) => ({
    message: t.string({
      resolve: (root) => {
        if (root.name === "Error") {
          return root.message;
        }
        console.log(root);
        return "Something went wrong";
      },
    }),
  }),
});

// builder.objectType(Error, {
//   name: "Error",
//   fields: (t) => ({
//     message: t.exposeString("message"),
//   })
// })
