import { builder } from "../../builder";
import "./query";
import "./mutation";

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    message: t.relation("messages"),
    role: t.exposeString("role"),
    isVerified: t.exposeBoolean("isVerified"),
  }),
});
