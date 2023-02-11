import { Request, Response } from "express";

export function handler({ req, res }: { req: Request; res: Response }) {
  const body = req.body;
  console.log(body);
  res.status(200).send("OK");
}
