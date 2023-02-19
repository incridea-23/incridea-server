import { builder } from "../../builder";

builder.prismaObject("BranchRep", {
  fields: (t) => ({
    userId: t.exposeID("userId"),
    branchId: t.exposeID("branchId"),
  }),
});
