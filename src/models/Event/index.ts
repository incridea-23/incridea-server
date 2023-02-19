import { builder } from "../../builder";
import "./mutation";
import "./query";

builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    fees: t.exposeInt("fees"),
    description: t.exposeString("description"),
    branch: t.relation("Branch"),
    organizer: t.relation("Organizer"),
    eventDate: t.expose("eventDate", {
      type: "Date",
      nullable: true,
    }),
  }),
});
