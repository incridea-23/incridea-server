import { builder } from "../../builder";

builder.prismaObject("ProniteRegistration", {
  fields: (t) => ({
    userId: t.exposeID("userId"),
    proniteDay: t.exposeString("proniteDay"),
    user: t.relation("User"),
  }),
});
