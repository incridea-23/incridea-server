import { builder } from "../../builder";
import "./query";
import "./mutation";

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    role: t.exposeString("role"),
    isVerified: t.exposeBoolean("isVerified"),
    createdAt: t.expose("createdAt", { type: "Date" }),
    phoneNumber: t.exposeString("phoneNumber", {
      nullable: true,
    }),
    college: t.relation("College", {
      nullable: true,
    }),
    xp: t.relation("XP",{
      nullable: true,
    })
  }),
});
