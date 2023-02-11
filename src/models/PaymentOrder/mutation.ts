import { builder } from "../../builder";
import Razorpay from "razorpay";
enum OrderType {
  FEST_REGISTRATION = "FEST_REGISTRATION",
  EVENT_REGISTRATION = "EVENT_REGISTRATION",
}

builder.mutationField("createPaymentOrder", (t) =>
  t.prismaField({
    type: "PaymentOrder",
    args: {
      type: t.arg({
        type: OrderType,
        required: true,
      }),
      eventId: t.arg({
        type: "String",
      }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("User not found");
      }
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
      });
      const payment_capture = 1;
      const amount = 250;
      const currency = "INR";
      const options = {
        amount: (amount * 100).toString(),
        currency,
        payment_capture,
      };
      const response = await razorpay.orders.create(options);
      return ctx.prisma.paymentOrder.create({
        data: {
          amount: 250,
          status: "PENDING",
          type: args.type,
          User: {
            connect: {
              id: user.id,
            },
          },
          orderId: response.id,
        },
      });
    },
  })
);
