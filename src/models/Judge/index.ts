import { builder } from "../../builder";
import "./mutation";

builder.prismaObject("Judge", {
    fields: (t) => ({
        userId: t.exposeID("userId"),
        eventId: t.exposeID("eventId"),
        roundNo: t.exposeInt("roundNo"),
    }),
  });