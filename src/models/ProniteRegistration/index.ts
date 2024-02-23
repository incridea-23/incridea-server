import { builder } from "../../builder";
import "./mutation";
builder.prismaObject("ProniteRegistration", {
  fields: (t) => ({
    userId: t.exposeID("userId"),
    proniteDay: t.exposeString("proniteDay"),
    user: t.relation("User"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
