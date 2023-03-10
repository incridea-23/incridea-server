import { Request, Response } from "express";
import { prisma } from "../utils/db/prisma";

export async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only POST requests allowed" });
  }
  try {
    const order_id = req.body?.payload?.payment?.entity?.order_id as string;
    const status = req.body?.payload?.payment?.entity?.status as string;
    if (!order_id || !status) {
      return res.status(400).send({ message: "Invalid request" });
    }
    console.log(req.body.payload.payment.entity);
    if (status === "captured") {
      const paymentOrder = await prisma.paymentOrder.update({
        where: {
          orderId: order_id,
        },
        data: {
          status: "SUCCESS",
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
    console.log(err);
    return res.status(400).json(err);
  }
}
