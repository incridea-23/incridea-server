import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: "dc7z01tdd",
  api_key: "724493754643247",
  api_secret: "cnyL5_Qx8b69unJv63vXhrPikPU",
  secure: true,
});

const params = {
  folder: "Events",
  allowed_formats: ["jpeg", "jpg", "png"],
  public_id: (req: any, file: any) => {
    let { eventName } = req?.params;
    if (eventName && eventName.length) {
      const regex = /[/\\\s]/g;
      eventName = eventName.replace(regex, "_");

      return `${eventName}_${Date.now()}`;
    } else {
      return `${Date.now()}`;
    }
  },
};

const storage = new CloudinaryStorage({
  cloudinary,
  params,
});
export const config = { cloudinary, upload: multer({ storage }) };
