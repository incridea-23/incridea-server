import checkIfAccommodationMember from "../../accommodationMembers/checkIfAccommodationMembers";
import { builder } from "../../builder";

builder.mutationField("createHotel", (t) =>
  t.prismaField({
    type: "Hotel",
    args: {
      name: t.arg({ type: "String", required: true }),
      details: t.arg({ type: "String", required: true }),
      price: t.arg({ type: "Float", required: true }),
      isAC: t.arg({ type: "Boolean", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      const isAllowed = checkIfAccommodationMember(user.id)
      if(!isAllowed) throw new Error("Not allowed to perform this action")

      //check if hotel already exists
      const isHotel = await ctx.prisma.hotel.findMany({
        where: {
          name: args.name,
        },
      });
      if (isHotel) {
        throw new Error("Hotel already exists");
      }

      //create hotel
      try {
        const data = await ctx.prisma.hotel.create({
          data: {
            name: args.name,
            details: args.details,
            price: args.price,
            AC: args.isAC,
          },
        });
        return data;
      } catch (err) {
		  console.log(err)
        throw new Error("Something went wrong");
      }
    },
  }),
);
