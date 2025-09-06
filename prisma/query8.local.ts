import { PrismaClient } from "@prisma/client";
import fs from 'fs'

const db = new PrismaClient();

const main = async () => {
  const externalColleges = await db.college.findMany({
    where: {
      id: {
        not: 1
      }
    },
    select: {
      name: true,
      Users: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
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
      }
    }
  })

  for (const externalCollege of externalColleges) {
    let x = 'PID, User name, College Name, No. of events attended\n'

    for (const externalUser of externalCollege.Users)
      x += `INC25-${externalUser.id.toString().padStart(4, "0").toString()}, ${externalUser.name}, ${externalCollege.name.replaceAll(",", " ")}, ${externalUser._count.TeamMembers}\n`

    fs.writeFileSync(`external-colleges/${externalCollege.name.replaceAll(",", "_").replaceAll(" ", "_").replaceAll("__", "_")}.csv`, x)
  }
}

await main();
