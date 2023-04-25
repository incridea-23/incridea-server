import "./mutation";
import "./query";
import { builder } from "../../builder";

builder.prismaObject("Judge", {
  fields: (t) => ({
    user: t.relation("User"),
    round: t.relation("Round"),
  }),
});
