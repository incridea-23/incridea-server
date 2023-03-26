import { builder } from "../../builder";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
} from "../../services/user.services";
import {
  generatePasswordResetToken,
  generateTokens,
  generateVerificationToken,
  secrets,
} from "../../utils/auth/jwt";
import {
  addVerificationTokenToWhitelist,
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  findRefreshTokenById,
  findVerificationTokenByID,
  deleteVerificationToken,
  addPasswordResetTokenToWhitelist,
  deletePasswordResetToken,
  findPasswordResetTokenByID,
} from "../../services/auth.service";
import { hashToken } from "../../utils/auth/hashToken";
import { sendEmail } from "../../utils/email";

// register user
const UserCreateInput = builder.inputType("UserCreateInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    phoneNumber: t.string({ required: true }),
    collegeId: t.int({ required: true }),
  }),
});

builder.mutationField("signUp", (t) =>
  t.prismaField({
    type: "User",
    args: {
      data: t.arg({
        type: UserCreateInput,
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      // if user already exists throw error
      const existingUser = await findUserByEmail(args.data.email);
      if (existingUser) {
        throw new Error("User already exists please login");
      }
      const user = await createUserByEmailAndPassword(args.data);
      // const jti = uuidv4();
      // const { accessToken, refreshToken } = generateTokens(user, jti);
      // await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
      return user;
    },
  })
);

// User Login
const UserLoginInput = builder.inputType("UserLoginInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

class Token {
  accessToken: string;
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

const UserLoginPayload = builder.objectType(Token, {
  name: "UserLoginPayload",
  fields: (t) => ({
    accessToken: t.exposeString("accessToken"),
    refreshToken: t.exposeString("refreshToken"),
  }),
});

builder.mutationField("login", (t) =>
  t.field({
    type: UserLoginPayload,
    errors: {
      types: [Error],
    },
    args: {
      data: t.arg({
        type: UserLoginInput,
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const existingUser = await findUserByEmail(args.data.email);
      if (!existingUser) {
        throw new Error("No user found");
      }
      const validPassword = await bcrypt.compare(
        args.data.password,
        existingUser.password
      );
      if (!validPassword) {
        throw new Error("Invalid password");
      }
      if (!existingUser.isVerified) {
        throw new Error("Please verify your email");
      }

      const jti = uuidv4();
      //delete old refresh token if exists
      const oldRefreshToken = await ctx.prisma.refreshToken.findFirst({
        where: {
          userId: existingUser.id,
          },
        });
      if (oldRefreshToken) {
        await deleteRefreshToken(oldRefreshToken.id);
      }
      //give new refresh token
      const { accessToken, refreshToken } = generateTokens(existingUser, jti);
      await addRefreshTokenToWhitelist({
        jti,
        refreshToken,
        userId: existingUser.id,
      });

      return {
        accessToken,
        refreshToken,
      };
    },
  })
);

// refresh token
builder.mutationField("refreshToken", (t) =>
  t.field({
    description: "Refreshes the access token",
    type: UserLoginPayload,
    errors: {
      types: [Error],
    },
    args: {
      refreshToken: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const payload = jwt.verify(
        args.refreshToken,
        secrets.JWT_REFRESH_SECRET as string
      ) as any;
      const savedRefreshToken = await findRefreshTokenById(
        payload?.jti as string
      );
      if (!savedRefreshToken || savedRefreshToken.revoked === true) {
        throw new Error("Unauthorized");
      }
      const hashedToken = hashToken(args.refreshToken);
      if (hashedToken !== savedRefreshToken.hashedToken) {
        throw new Error("Unauthorized");
      }
      const user = await findUserById(payload.userId);
      if (!user) {
        throw new Error("Unauthorized");
      }
      await deleteRefreshToken(savedRefreshToken.id);
      const jti = uuidv4();
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user,
        jti
      );
      await addRefreshTokenToWhitelist({
        jti,
        refreshToken: newRefreshToken,
        userId: user.id,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    },
  })
);

builder.mutationField("sendEmailVerification", (t) =>
  t.field({
    type: "String",
    errors: {
      types: [Error],
    },
    args: {
      email: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const existingUser = await findUserByEmail(args.email);
      if (!existingUser) {
        throw new Error("No user found");
      }
      //delete old verification token if exists
      const oldVerificationToken = await ctx.prisma.verificationToken.findFirst({
        where: {
          userId: existingUser.id,
          type: "EMAIL_VERIFICATION",
        },
      });
      if (oldVerificationToken) {
        await deleteVerificationToken(oldVerificationToken.id);
      }
      const { id: token } = await addVerificationTokenToWhitelist({
        userId: existingUser.id,
      });
      const verificationToken = generateVerificationToken(existingUser, token);
      const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
      await sendEmail(
        existingUser.email,
        `Verify Email <a href="${url}">Click Here to verifiy Email</a>`,
        "Incridea Verify Email"
      );
      return "Email sent";
    },
  })
);

builder.mutationField("verifyEmail", (t) =>
  t.prismaField({
    type: "User",

    errors: {
      types: [Error],
    },
    args: {
      token: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const payload = jwt.verify(
        args.token,
        secrets.JWT_VERIFICATION_SECRET as string
      ) as any;
      const savedToken = await findVerificationTokenByID(
        payload?.jti as string
      );
      if (!savedToken || savedToken.revoked === true) {
        throw new Error("Invalid token");
      }
      const user = await findUserById(payload.userId);
      if (!user) {
        throw new Error("Invalid token");
      }
      const verified_user = await ctx.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
      await deleteVerificationToken(savedToken.id);

      return verified_user;
    },
  })
);

// send password reset email
builder.mutationField("sendPasswordResetEmail", (t) =>
  t.field({
    type: "String",
    errors: {
      types: [Error],
    },
    args: {
      email: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const existingUser = await findUserByEmail(args.email);
      if (!existingUser) {
        throw new Error("You do not have an account here. Please sign Up");
      }
      //delete old password reset token if exists
      const oldPasswordResetToken = await ctx.prisma.verificationToken.findFirst(
        {
          where: {
            userId: existingUser.id,
            type: "RESET_PASSWORD",
          },
        }
      );
      if (oldPasswordResetToken) {
        await deleteVerificationToken(oldPasswordResetToken.id);
      }
      const { id: token } = await addPasswordResetTokenToWhitelist({
        userId: existingUser.id,
      });
      const passwordResetToken = generatePasswordResetToken(
        existingUser,
        token
      );
      const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${passwordResetToken}`;
      await sendEmail(
        existingUser.email,
        `Reset Password <a href="${url}" > Click here to reset password </a>`,
        "Incridea Rest password"
      );
      return "Email sent";
    },
  })
);

// reset password
builder.mutationField("resetPassword", (t) =>
  t.prismaField({
    type: "User",
    errors: {
      types: [Error],
    },
    args: {
      token: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const payload = jwt.verify(
        args.token,
        secrets.JWT_PASSWORD_RESET_SECRET as string
      ) as any;
      const savedToken = await findPasswordResetTokenByID(
        payload?.jti as string
      );
      if (!savedToken || savedToken.revoked === true) {
        throw new Error("Invalid token");
      }
      const user = await findUserById(payload.userId);
      if (!user) {
        throw new Error("Invalid token");
      }
      const hashedPassword = await bcrypt.hash(args.password, 12);
      const updated_user = await ctx.prisma.user.update({
        ...query,
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      await deletePasswordResetToken(savedToken.id);

      return updated_user;
    },
  })
);
