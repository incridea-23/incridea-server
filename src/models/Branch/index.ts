import { builder } from "../../builder";
import "./mutation";
import "./query";

builder.prismaObject("Branch", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    branchReps: t.relation("BranchReps"),
    events: t.relation("Event"),
  }),
});
