import { builder } from "../../builder";
builder.prismaObject("Branch", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
  }),
});
