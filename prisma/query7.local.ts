import { PrismaClient } from "@prisma/client";
import fs from 'fs'

const db = new PrismaClient();

const main = async () => {
  let x = 'PID, User name, College Name, No. of events attended\n'

  const externalUsers = await db.user.findMany({
    where: {
      AND: [
        {
          collegeId: {
            not: undefined
          }
        },
        {
          collegeId: {
            not: 1
          }
        }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      College: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          TeamMembers: {
            where: {
              Team: {
                attended: true
              }
            }
          }
        }
      }
    }
  })


  for (const externalUser of externalUsers)
    x += `INC25-${externalUser.id.toString().padStart(4, "0").toString()}, ${externalUser.name}, ${externalUser.College.name.replaceAll(",", " ")}, ${externalUser._count.TeamMembers}\n`

  fs.writeFileSync('external-students.csv', x)
}

await main();
