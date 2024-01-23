import { builder } from "../../builder";
import "./mutation";
import "./query";

builder.prismaObject("UserInHotel", {
  fields: (t) => ({
    id: t.exposeID("id"),
    gender: t.exposeString("gender"),
    room:t.exposeString("room",{
        nullable:true
    }),
    status:t.exposeString("status"),
    ac:t.exposeBoolean("AC"),
    hotel: t.relation("Hotel"), 
    user: t.relation("User"), //Check if this can be included
    checkIn: t.expose("checkIn", {
        type: "DateTime",
        nullable: true,
      }),
      checkOut: t.expose("checkOut", {
        type: "DateTime",
        nullable: true,
      }),
    createdAt :t.expose("createdAt", {
        type: "DateTime",
        nullable: true,
      }),
    updatedAt :t.expose("updatedAt", {
            type: "DateTime",
            nullable: true,
        }),
  }),
  
});
