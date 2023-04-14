import { createYoga } from "graphql-yoga";
import cors from "cors";
import express from "express";
import { context } from "./context";
import { schema } from "./schema";
import bodyParser from "body-parser";
import { handler as razorpayCapture } from "./webhook/capture";
import { uploader as imageUpload } from "./cloudinary/upload";

import { config } from "./cloudinary/config";
const { upload } = config;
// import "./test.ts";
import { useDepthLimit } from "@envelop/depth-limit";
const port = Number(process.env.API_PORT) || 4000;
const yoga = createYoga({
  context,
  schema,
  plugins: [useDepthLimit({ maxDepth: 6 })], //max depth allowed to avoid infinite nested queries
});

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello Incridea");
});

app.use("/graphql", yoga);
app.post("/webhook/capture", razorpayCapture);
app.post("/cloudinary/upload/:eventName", upload.single("image"), imageUpload);

app.listen(port, () => {
  console.log(`🚀 Server ready at: http://localhost:4000/graphql`);
});
