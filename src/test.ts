import { prisma } from "./utils/db/prisma";

async function revokeUnpaidParticipant() {
  //   const paid = await prisma.user.findMany({
  //     where: {
  //       OR: [
  //         {
  //           role: "BRANCH_REP",
  //         },
  //         {
  //           role: "PARTICIPANT",
  //         },
  //         {
  //           role: "ORGANIZER",
  //         },
  //       ],
  //       PaymentOrders: {
  //         some: {
  //           status: "SUCCESS",
  //         },
  //       },
  //       NOT: {

  //       }
  //     },

  //   });
  const golmal = await prisma.user.findMany({
    where: {
      OR: [
        {
          role: "BRANCH_REP",
        },
        {
          role: "PARTICIPANT",
        },
        {
          role: "ORGANIZER",
        },
      ],
      NOT: [
        {
          PaymentOrders: {
            some: {
              status: "SUCCESS",
            },
          },
        },
      ],
    },
    include: {
      PaymentOrders: true,
    },
  });
  console.log(golmal);
}
revokeUnpaidParticipant().then(() => {
  console.log("Done");
});
