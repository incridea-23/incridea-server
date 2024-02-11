const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: typeof import("@prisma/client").PrismaClient;
};
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.event.findMany({
    where: {
      published: true,
    },
    select: {
      name: true,
      Branch: {
        select: {
          name: true,
        },
      },
      Teams: {
        select: {
          attended: true,
          _count: true,
          confirmed: true,
          TeamMembers: {
            include: {
              User: {
                include: {
                  College: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  let eventData = [];
  for (const event of events) {
    eventData.push({
      name: event.name,
      branch: event.Branch.name,
      participation: event.Teams.reduce((acc, team) => {
        return acc + (team.attended ? team._count.TeamMembers : 0);
      }, 0),
    });
  }
  console.log(eventData.reduce((acc, event) => acc + event.participation, 0));
  console.log(eventData);
}
// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

(async () => {
  await prisma.mCQSubmission.deleteMany();
})();
