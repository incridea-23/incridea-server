import { builder } from "../../builder";
builder.prismaObject("Organizer", {
  fields: (t) => ({
    eventId: t.exposeID("eventId"),
    userId: t.exposeID("userId"),
  }),
});
