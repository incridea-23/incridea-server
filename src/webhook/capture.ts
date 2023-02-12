import { Request, Response } from "express";
import { prisma } from "../utils/db/prisma";

export async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only POST requests allowed" });
  }
  try {
    if (req.body.payload.payment.entity.status !== "captured") {
      return res.status(400).send({ message: "Payment not captured" });
    }
    const order_id = req.body?.payload?.payment?.entity?.order_id as string;
    const paymentOrder = await prisma.paymentOrder.update({
      where: {
        orderId: order_id,
      },
      data: {
        status: "SUCCESS",
        paymentData: JSON.stringify(req.body.payload.payment.entity),
      },
    });

    if (paymentOrder.type === "FEST_REGISTRATION") {
      await prisma.user.update({
        where: {
          id: paymentOrder.userId,
        },
        data: {
          role: "PARTICIPANT",
        },
      });
      return res.status(200).json({ status: "OK" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
