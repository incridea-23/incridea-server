import { builder } from "../../builder";
import "./mutation";
import "./query";
builder.prismaObject("Round", {
  fields: (t) => ({
    eventId: t.exposeID("eventId"),
    roundNo: t.exposeInt("roundNo"),
    completed: t.exposeBoolean("completed"),
    event: t.relation("Event"),
    teams: t.relation("Teams"),
    date: t.expose("date", {
      type: "DateTime",
      nullable: true,
    }),
    judges: t.relation("Judges"),
  }),
});
