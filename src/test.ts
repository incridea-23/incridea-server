import { prisma } from "./utils/db/prisma";
import fs from "fs";
async function updateRegisteredStatus() {
  const users = fs.readFileSync("./src/certificate.json", "utf-8");
  const usersData = JSON.parse(users);
  const keys = Object.keys(usersData);
  let updated = {} as any;
  for (const key of keys) {
    const users = usersData[key];
    if (key == "CORE") {
      updated[key] = users;
      continue;
    }
    let newUsers = [] as any;
    for (const user of users) {
      if (!user.USN) {
        newUsers.push({
          ...user,
          registered: false,
        });
        continue;
      }
      const registered = await prisma.user.findFirst({
        where: {
          email: `${user.USN.trim().toLowerCase()}@nmamit.in`,
          role: {
            in: ["PARTICIPANT", "BRANCH_REP", "ORGANIZER"],
          },
        },
      });
      newUsers.push({
        ...user,
        registered: registered ? true : false,
      });
    }
    updated[key] = newUsers;
  }
  fs.writeFileSync("./new_certificate1.json", JSON.stringify(updated));
}

updateRegisteredStatus().then(() => {
  console.log("done");
});
