const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: typeof import("@prisma/client").PrismaClient;
};
const fs = require("fs");
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

async function getRoadies() {
  const data = await prisma.event.findMany({
    where: {
      id: 26,
    },
    include: {
      Teams: {
        select: {
          roundNo: true,
          attended: true,
          confirmed: true,
          TeamMembers: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });
  console.log(data);

  let filteredRound2 = data.filter((team) => team.Teams[0].roundNo === 2);
  fs.writeFileSync("data.json", JSON.stringify(filteredRound2, null, 2));
}

getRoadies().finally(() => {
  console.log("done");
});

async function getEventsParticipants() {
  let id = 67;
  let event = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      Teams: {
        select: {
          id: true,
          attended: true,
          confirmed: true,
          TeamMembers: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!event) {
    console.log("Event not found");
    return;
  }
  let csvready = event.Teams.map((team) => {
    return team.TeamMembers.map((member) => {
      return {
        Name: member.User.name,
        Email: member.User.email,
        teamId: team.id,
        "User Id": member.User.id,
        attended: team.attended,
        confirmed: team.confirmed,
      };
    });
  });
}

async function totalReg() {
  const roadiesParticipants = await prisma.team.findMany({
    where: {
      eventId: 70,
    },
    include: {
      TeamMembers: {
        include: {
          User: true,
        },
      },
    },
  });

  let colValues = "teamId,teamName,userId,userName,email,phoneNumber";
  roadiesParticipants.map((team) => {
    team.TeamMembers.map((user, idx) => {
      if (idx === 0) {
        const line = `${team.id},${team.name},${`INC24-${user.User.id
          .toString()
          .padStart(4, "0")
          .toString()}`}, ${user.User.name}, ${user.User.email}, ${
          user.User.phoneNumber
        }`;
        colValues += "\n" + line;
      } else {
        const line = `,,${`INC24-${user.User.id
          .toString()
          .padStart(4, "0")
          .toString()}`}, ${user.User.name}, ${user.User.email}, ${
          user.User.phoneNumber
        }`;
        colValues += "\n" + line;
      }
    });
  });
  fs.writeFileSync("bgmi.csv", colValues);
}

totalReg().finally(() => {
  console.log("done");
});

async function g() {}
