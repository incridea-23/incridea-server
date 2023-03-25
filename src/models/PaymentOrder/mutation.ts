import { builder } from "../../builder";
import Razorpay from "razorpay";
import { v4 as uuidv4 } from "uuid";

enum OrderTypeEnum {
  FEST_REGISTRATION = "FEST_REGISTRATION",
  EVENT_REGISTRATION = "EVENT_REGISTRATION",
}

const OrderType = builder.enumType(OrderTypeEnum, {
  name: "OrderType",
});

builder.mutationField("createPaymentOrder", (t) =>
  t.prismaField({
    type: "PaymentOrder",
    args: {
      type: t.arg({
        type: OrderType,
        required: true,
      }),
      eventId: t.arg({
        type: "ID",
        required: false,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY as string,
        key_secret: process.env.RAZORPAY_SECRET as string,
      });
      if (args.type === OrderTypeEnum.EVENT_REGISTRATION) {
        // EVENT_REGISTRATION
        if (!args.eventId) {
          throw new Error("Event Id not provided");
        }
        const event = await ctx.prisma.event.findUnique({
          where: {
            id: Number(args.eventId),
          },
        });
        if (!event) {
          throw new Error("Event not found");
        }
        const payment_capture = 1;
        const amount = event.fees;
        const currency = "INR";
        const options = {
          amount: (amount * 100).toString(),
          currency,
          payment_capture,
          recept: uuidv4(),
        };
        const response = await razorpay.orders.create(options);
        return ctx.prisma.paymentOrder.create({
          data: {
            amount: Number(response.amount),
            status: "PENDING",
            type: args.type,
            User: {
              connect: {
                id: user.id,
              },
            },
            orderId: response.id as string,
          },
        });
      }
      // FEST_REGISTRATION
      //check if user already has a pending order for FEST_REGISTRATION
      const existingOrder = await ctx.prisma.paymentOrder.findFirst({
        where: {
          User: {
            id: user.id
          },
          type: args.type,
          status: "PENDING"
        }
      });
      if (existingOrder) {
        return existingOrder;
      }
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
        ...query,
        data: {
          amount: Number(response.amount),
          status: "PENDING",
          type: args.type,
          User: {
            connect: {
              id: user.id,
            },
          },
          orderId: response.id as string,
        },
      });
    },
  })
);
