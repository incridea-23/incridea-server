import { PrismaClient } from "@prisma/client";
import fs from 'fs'

const db = new PrismaClient();

const main = async () => {
  let x = 'Type, Event Unique Registrations\n'

  const users = await db.user.findMany({
    where: {
      TeamMembers: {
        some: {
          Team: {
            confirmed: true
          }
        }
      }
    },
    select: {
      id: true,
      collegeId: true,
      email: true
    }
  })

  const table = {
    external: 0,
    internal: {
      first: 0,
      second: 0,
      second_lateral: 0,
      third: 0,
      third_lateral: 0,
      fourth: 0,
      fourth_lateral: 0,
    }
  }

  for (const user of users) {
    if (user.collegeId !== 1) {
      table.external++
    } else {
      const userEmail = user.email.toLowerCase()

      const firstYear = new RegExp("^nnm24..(?!(4|5)..)...@nmamit.in$")
      const secondYear = new RegExp("^nnm23..(?!(4|5)..)...@nmamit.in$")
      const secondYearLateral = new RegExp("^nnm24..(4|5)..@nmamit.in$")
      const thirdYear = new RegExp("^nnm22..(?!(4|5)..)...@nmamit.in$")
      const thirdYearLateral = new RegExp("^nnm23..(4|5)..@nmamit.in$")
      const fourthYear = new RegExp("^4nm21..(?!(4|5)..)...@nmamit.in$")
      const fourthYearLateral = new RegExp("^4nm22..(4|5)..@nmamit.in$")

      if (firstYear.test(userEmail)) {
        table.internal.first++
      } else if (secondYear.test(userEmail)) {
        table.internal.second++
      } else if (secondYearLateral.test(userEmail)) {
        table.internal.second_lateral++
      } else if (thirdYear.test(userEmail)) {
        table.internal.third++
      } else if (thirdYearLateral.test(userEmail)) {
        table.internal.third_lateral++
      } else if (fourthYear.test(userEmail)) {
        table.internal.fourth++
      } else if (fourthYearLateral.test(userEmail)) {
        table.internal.fourth_lateral++
      } else {
        console.log(userEmail)
      }
    }
  }

  x += `External,${table.external}\n`
  x += `Internal First Years,${table.internal.first}\n`
  x += `Internal Second Years,${table.internal.second}\n`
  x += `Internal Second Year Lateral,${table.internal.second_lateral}\n`
  x += `Internal Third Years,${table.internal.third}\n`
  x += `Internal Third Year Lateral,${table.internal.third_lateral}\n`
  x += `Internal Fourth Years,${table.internal.fourth}\n`
  x += `Internal Fourth Year Lateral,${table.internal.fourth_lateral}\n`

  fs.writeFileSync('unique-event-registrations.csv', x)
}

await main();
