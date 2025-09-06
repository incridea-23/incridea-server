import { PrismaClient, WinnerType } from "@prisma/client";
import fs from 'fs'

const db = new PrismaClient();

const main = async () => {
  let x = 'Event, Position, Team Name, College Name, Leader Name, Leader Phone, Members\n'

  const events = await db.event.findMany({
    select: {
      name: true,
      Winner: {
        select: {
          type: true,
          Team: {
            select: {
              name: true,
              leaderId: true,
              TeamMembers: {
                select: {
                  User: {
                    select: {
                      id: true,
                      name: true,
                      phoneNumber: true,
                      College: {
                        select: {
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  const RANK = {
    WINNER: 1,
    RUNNER_UP: 2,
    SECOND_RUNNER_UP: 3
  }

  for (const event of events) {
    x += `${event.name},`
    const winners = event.Winner.sort((a, b) => RANK[a.type] - RANK[b.type])
    let outerFlag = false
    if (winners.length == 0)
      x += "\n"
    for (const winner of winners) {
      const leader = winner.Team.TeamMembers.find((member) => member.User.id === winner.Team.leaderId)?.User
      const members = winner.Team.TeamMembers.filter((member) => member.User.id != leader?.id)
      x += outerFlag ? "," : ""
      x += `${winner.type},${winner.Team.name},${leader?.College.name},`
      x += `${leader?.name},${leader?.phoneNumber},`
      for (const member of members) {
        x += `${member.User.name},`
      }
      x += "\n"
      outerFlag = true
    }
  }

  fs.writeFileSync('winner.csv', x)
}

await main();
