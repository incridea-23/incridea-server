import { builder } from "../../builder";
import "./mutation";
import "./query";
import "./subscription";

builder.prismaObject("Team", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    event: t.relation("Event"),
    roundNo: t.exposeInt("roundNo"),
    members: t.relation("TeamMembers"),
    confirmed: t.exposeBoolean("confirmed"),
    attended: t.exposeBoolean("attended"),
    leaderId: t.exposeInt("leaderId", {
      nullable: true,
    }),
  }),
});

builder.prismaObject("TeamMember", {
  fields: (t) => ({
    user: t.relation("User"),
    team: t.relation("Team"),
  }),
});
