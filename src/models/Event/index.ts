import { builder } from "../../builder";
import "./mutation";
import "./query";

builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    fees: t.exposeInt("fees"),
    description: t.expose("description", {
      type: "String",
      nullable: true,
    }),
    venue: t.expose("venue", {
      type: "String",
      nullable: true,
    }),
    image: t.expose("image", {
      type: "String",
      nullable: true,
    }),
    branch: t.relation("Branch"),
    organizer: t.relation("Organizer"),
    eventDate: t.expose("eventDate", {
      type: "Date",
      nullable: true,
    }),
  }),
});
