import { builder } from "../../builder";
import "./mutation";
import "./query";

builder.prismaObject("College", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
  }),
});
