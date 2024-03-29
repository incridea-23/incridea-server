import { Request, Response } from "express";
import { prisma } from "../utils/db/prisma";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

export async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only POST requests allowed" });
  }
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
  const webhookSignature = req.headers["x-razorpay-signature"] as string;
  if (
    !validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      webhookSecret
    )
  ) {
    return res.status(400).send({ message: "Invalid request" });
  }
  try {
    const order_id = req.body?.payload?.payment?.entity?.order_id as string;
    const status = req.body?.payload?.payment?.entity?.status as string;
    if (!order_id || !status) {
      return res.status(400).send({ message: "Invalid request" });
    }
    if (status === "captured") {
      // find payment order from two tables
      const paymentOrder = await prisma.paymentOrder.findUnique({
        where: {
          orderId: order_id,
        },
      });

      if (paymentOrder) {
        const updatedPaymentOrder = await prisma.paymentOrder.update({
          where: {
            orderId: order_id,
          },
          data: {
            status: "SUCCESS",
            paymentData: req.body.payload.payment.entity.paymentData,
          },
        });
        const updatedUser = await prisma.user.update({
          where: {
            id: paymentOrder.userId,
          },
          data: {
            role: "PARTICIPANT",
          },
        });

        return res.status(200).json(updatedPaymentOrder);
      } else {
        const updatedPaymentOrder = await prisma.eventPaymentOrder.update({
          where: {
            orderId: order_id,
          },
          data: {
            status: "SUCCESS",
            paymentData: req.body.payload.payment.entity.paymentData,
          },
        });
        const updateTeam = await prisma.team.update({
          where: {
            id: updatedPaymentOrder.teamId,
          },
          data: {
            confirmed: true,
          },
        });
        return res.status(200).json(updatedPaymentOrder);
      }
    } else {
      await prisma.paymentOrder.update({
        where: {
          orderId: order_id,
        },
        data: {
          status: "FAILED",
          paymentData: req.body.payload.payment.entity.paymentData,
        },
      });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
