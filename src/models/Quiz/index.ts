import { builder } from "../../builder";
import "./query"
import "./mutations"

builder.prismaObject("Quiz", {
  fields: (t) => ({
    id: t.exposeID("id"),
    roundNo: t.exposeInt("roundId"),
    eventId: t.exposeID("eventId"),
    password: t.expose("password", {
      type: "String",
      nullable: true,
    }),
    name: t.expose("name", {
      type: "String",
      nullable: false,
    }),
    description: t.expose("description", {
      type: "String",
      nullable: true,
    }),
    startTime: t.expose("startTime", {
      type: "DateTime",
      nullable: false,
    }),
    endTime: t.expose("endTime", {
      type: "DateTime",
      nullable: false,
    }),
    questions: t.relation("Questions", { nullable: true }),
  }),
});
