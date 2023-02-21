import { builder } from "../../builder";
import "./query";
import "./mutation";

builder.prismaObject("BranchRep", {
  fields: (t) => ({
    userId: t.exposeID("userId"),
    branchId: t.exposeID("branchId"),
  }),
});
