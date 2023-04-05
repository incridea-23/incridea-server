import { builder } from "../../builder";
import "./mutation";

builder.prismaObject("PaymentOrder", {
  fields: (t) => ({
    id: t.exposeID("id"),
    amount: t.exposeInt("amount"),
    status: t.exposeString("status"),
    orderId: t.exposeID("orderId"),
    user: t.relation("User"),
  }),
});

builder.prismaObject("EventPaymentOrder", {
  fields: (t) => ({
    id: t.exposeID("id"),
    amount: t.exposeInt("amount"),
    status: t.exposeString("status"),
    orderId: t.exposeID("orderId"),
    Team: t.relation("Team"),
  }),
});
