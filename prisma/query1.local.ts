import { PrismaClient } from "@prisma/client";
import fs from 'fs'

const db = new PrismaClient();

const main = async () => {
  let x = 'Event Name,Team Reg,Team Part,External Reg,External Part,1st Reg,1st Part,2nd Reg,2nd Part,2nd Lateral Reg,2nd Lateral Part,3rd Reg,3rd Part,3rd Lateral Reg,3rd Lateral Part,4th Reg,4th Part,4th Lateral Reg,4th Lateral Part\n'

  const events = await db.event.findMany({
    select: {
      id: true,
    }
  })

  for (const event of events) {
    const e = await db.event.findUnique({
      where: {
        id: event.id
      },
      select: {
        name: true,
        Teams: {
          select: {
            TeamMembers: {
              select: {
                User: true
              }
            },
            attended: true
          }
        }
      }
    })

    const table = {
      reg: 0,
      part: 0,
      external: {
        reg: 0,
        part: 0
      },
      internal: {
        first: {
          reg: 0,
          part: 0
        },
        second: {
          reg: 0,
          part: 0
        },
        second_lateral: {
          reg: 0,
          part: 0
        },
        third: {
          reg: 0,
          part: 0
        },
        third_lateral: {
          reg: 0,
          part: 0
        },
        fourth: {
          reg: 0,
          part: 0
        },
        fourth_lateral: {
          reg: 0,
          part: 0
        },
      }
    }

    if (!e) {
      console.log('Event not found: ', event.id)
      continue
    }

    for (const team of e.Teams) {
      table.reg++
      if (team.attended)
        table.part++
      for (const teamMember of team.TeamMembers) {
        if (teamMember.User.collegeId !== 1) {
          table.external.reg++
          if (team.attended)
            table.external.part++
        } else {
          const userEmail = teamMember.User.email.toLowerCase()

          const firstYear = new RegExp("^nnm24..(?!(4|5)..)...@nmamit.in$")
          const secondYear = new RegExp("^nnm23..(?!(4|5)..)...@nmamit.in$")
          const secondYearLateral = new RegExp("^nnm24..(4|5)..@nmamit.in$")
          const thirdYear = new RegExp("^nnm22..(?!(4|5)..)...@nmamit.in$")
          const thirdYearLateral = new RegExp("^nnm23..(4|5)..@nmamit.in$")
          const fourthYear = new RegExp("^4nm21..(?!(4|5)..)...@nmamit.in$")
          const fourthYearLateral = new RegExp("^4nm22..(4|5)..@nmamit.in$")

          if (firstYear.test(userEmail)) {
            table.internal.first.reg++
            if (team.attended)
              table.internal.first.part++
          } else if (secondYear.test(userEmail)) {
            table.internal.second.reg++
            if (team.attended)
              table.internal.second.part++
          } else if (secondYearLateral.test(userEmail)) {
            table.internal.second_lateral.reg++
            if (team.attended)
              table.internal.second_lateral.part++
          } else if (thirdYear.test(userEmail)) {
            table.internal.third.reg++
            if (team.attended)
              table.internal.third.part++
          } else if (thirdYearLateral.test(userEmail)) {
            table.internal.third_lateral.reg++
            if (team.attended)
              table.internal.third_lateral.part++
          } else if (fourthYear.test(userEmail)) {
            table.internal.fourth.reg++
            if (team.attended)
              table.internal.fourth.part++
          } else if (fourthYearLateral.test(userEmail)) {
            table.internal.fourth_lateral.reg++
            if (team.attended)
              table.internal.fourth_lateral.part++
          } else {
            console.log(userEmail)
          }
        }
      }
    }

    x += `${e.name},${table.reg},${table.part},${table.external.reg},${table.external.part},${table.internal.first.reg},${table.internal.first.part},${table.internal.second.reg},${table.internal.second.part},${table.internal.second_lateral.reg},${table.internal.second_lateral.part},${table.internal.third.reg},${table.internal.third.part},${table.internal.third_lateral.reg},${table.internal.third_lateral.part},${table.internal.fourth.reg},${table.internal.fourth.part},${table.internal.fourth_lateral.reg},${table.internal.fourth_lateral.part}\n`
  }


  fs.writeFileSync('emc.csv', x)
}

await main();
