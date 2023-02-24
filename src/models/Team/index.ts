import { builder } from "../../builder";
import "./mutation";
import "./query";

builder.prismaObject("Team", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    event: t.relation("Event"),
    rounds: t.relation("Round"),
    members: t.relation("TeamMembers"),
    confirmed: t.exposeBoolean("confirmed"),
    attended: t.exposeBoolean("attended"),
  }),
});

builder.prismaObject("TeamMember", {
  fields: (t) => ({
    user: t.relation("User"),
    team: t.relation("Team"),
  }),
});
