import { builder } from "../../builder";
import "./query";
import "./mutation";

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    message: t.relation("messages"),
    role: t.exposeString("role"),
    isVerified: t.exposeBoolean("isVerified"),
    createdAt: t.expose("createdAt", { type: "Date" }),
  }),
});
