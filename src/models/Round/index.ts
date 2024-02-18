import { builder } from "../../builder";
import "./mutation";
import "./query";
import "./subscription";

builder.prismaObject("Round", {
  fields: (t) => ({
    eventId: t.exposeID("eventId"),
    roundNo: t.exposeInt("roundNo"),
    Quiz: t.relation("Quiz", { nullable: true }),
    completed: t.exposeBoolean("completed"),
    event: t.relation("Event"),
    date: t.expose("date", {
      type: "DateTime",
      nullable: true,
    }),
    criteria: t.relation("Criteria", {
      nullable: true,
    }),
    judges: t.relation("Judges"),
    selectStatus: t.exposeBoolean("selectStatus"),
  }),
});
