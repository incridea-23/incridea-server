import { builder } from "../../builder";
import "./query";
import "./mutations";
import "./subscription";

builder.prismaObject("Quiz", {
  fields: (t) => ({
    id: t.exposeID("id"),
    roundNo: t.exposeInt("roundId"),
    eventId: t.exposeID("eventId"),
    password:t.exposeString("password", { nullable: true }),
    name: t.expose("name", {
      type: "String",
      nullable: true,
    }),
    allowAttempts: t.exposeBoolean("allowAttempts", {
      nullable: true,
    }),
    description: t.expose("description", {
      type: "String",
      nullable: true,
    }),
    duration:t.exposeInt("duration",{nullable:true}),
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
