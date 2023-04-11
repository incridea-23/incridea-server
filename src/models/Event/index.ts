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
    published: t.exposeBoolean("published"),
    minTeamSize: t.exposeInt("minTeamSize"),
    maxTeamSize: t.exposeInt("maxTeamSize"),
    maxTeams: t.exposeInt("maxTeams", {
      nullable: true,
    }),
    organizers: t.relation("Organizers"),
    eventType: t.exposeString("eventType"),
    teams: t.relation("Teams"),
    rounds: t.relation("Rounds"),
    category: t.exposeString("category", {
      nullable: true,
    }),
  }),
});
