import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import { CONSTANT } from "~/constants";

const db = new PrismaClient();

const main = async () => {
  let x = 'College,Total Points,,Diamond,Gold,Silver,Bronze,,Core,Technical,Non Technical,Special\n'

  const data = {} as {
    [key: string]: {
      TOTAL: number,
      DIAMOND: number,
      GOLD: number,
      SILVER: number,
      BRONZE: number,
      CORE: number,
      TECHNICAL: number,
      NON_TECHNICAL: number,
      SPECIAL: number
    }
  }

  const colleges = await db.college.findMany({
    select: {
      name: true,
      championshipPoints: true,
    }
  })

  for (const college of colleges)
    data[college.name.replaceAll(",", "_")] = {
      TOTAL: college.championshipPoints,
      DIAMOND: 0,
      GOLD: 0,
      SILVER: 0,
      BRONZE: 0,
      CORE: 0,
      TECHNICAL: 0,
      NON_TECHNICAL: 0,
      SPECIAL: 0
    }

  const winners = await db.winners.findMany({
    select: {
      type: true,
      Event: {
        select: {
          category: true,
          tier: true
        }
      },
      Team: {
        select: {
          TeamMembers: {
            select: {
              User: {
                select: {
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
  })

  for (const winner of winners) {
    const point = CONSTANT.WINNER_POINTS.COLLEGE[winner.Event.tier][winner.type]
    if (winner.Team.TeamMembers[0] && data[winner.Team.TeamMembers[0]?.User.College.name.replaceAll(",", "_")]) {
      data[winner.Team.TeamMembers[0]!.User.College.name.replaceAll(",", "_")]![winner.Event.tier] += point
      data[winner.Team.TeamMembers[0]!.User.College.name.replaceAll(",", "_")]![winner.Event.category] += point
    }
  }

  Object.keys(data).sort((a, b) => data[b]!.TOTAL - data[a]!.TOTAL).map((collegeName) => {
    const college = data[collegeName]!
    x += `${collegeName},${college.TOTAL},,${college.DIAMOND},${college.GOLD},${college.SILVER},${college.BRONZE},,${college.CORE},${college.TECHNICAL},${college.NON_TECHNICAL},${college.SPECIAL}\n`
  })

  fs.writeFileSync('championship-points-v2.csv', x)
}

await main();
