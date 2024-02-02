import { builder } from "../../builder";
import "./query";
import "./mutation";

export const avatarList = [
  {
    id: "1",
    name: "avatar1",
    url: "https://res.cloudinary.com/dh1bowbbe/image/upload/v1706813980/mario-removebg-preview_t2hziu.png",
  },
  {
    id: "1",
    name: "avatar2",
    url: "https://res.cloudinary.com/dh1bowbbe/image/upload/v1706813980/avatar2-removebg-preview_qw3yvu.png",
  },
  {
    id: "1",
    name: "avatar3",
    url: "https://res.cloudinary.com/dh1bowbbe/image/upload/v1706813980/avatar1-removebg-preview_t9nfqo.png",
  },
  {
    id: "1",
    name: "avatar4",
    url: "https://res.cloudinary.com/dh1bowbbe/image/upload/v1706813980/mario-removebg-preview_t2hziu.png",
  },
];
builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    role: t.exposeString("role"),
    isVerified: t.exposeBoolean("isVerified"),
    createdAt: t.expose("createdAt", { type: "Date" }),
    phoneNumber: t.exposeString("phoneNumber", {
      nullable: true,
    }),
    profileImage: t.exposeString("profileImage", {
      nullable: true,
    }),
    college: t.relation("College", {
      nullable: true,
    }),
    xp: t.relation("XP", {
      nullable: true,
    }),
    hotel: t.relation("UserInHotel", {
      nullable: true,
    }),
  }),
});
