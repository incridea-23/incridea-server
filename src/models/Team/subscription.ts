import { resolve } from "path";
import { builder } from "../../builder";

builder.queryField("teams", (t) =>
  t.prismaField({
    type: ["Team"],
    smartSubscription: true,
    subscribe: (subscription, root, args, ctx, info) => {
      subscription.register("teams-added");
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.team.findMany({
        ...query,
      });
    },
  })
);

builder.prismaObject("test", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
  }),
});
builder.queryField("tests", (t) =>
  t.prismaField({
    type: ["test"],
    smartSubscription: true,
    subscribe: (subscription, root, args, ctx, info) => {
      console.log(args, info, root);
      subscription.register("test-event");
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.test.findMany({
        ...query,
      });
    },
  })
);

builder.mutationField("addTest", (t) =>
  t.prismaField({
    type: "test",
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const data = await ctx.prisma.test.create({
        data: {
          name: args.name,
        },
      });
      ctx.pubsub.publish("test-event", { testEvent: { name: args.name } });
      return data;
    },
  })
);
