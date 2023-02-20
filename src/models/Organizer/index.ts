import { builder } from "../../builder";
import "./mutation";
import "./query";
builder.prismaObject("Organizer", {
  fields: (t) => ({
    eventId: t.exposeID("eventId"),
    userId: t.exposeID("userId"),
  }),
});
