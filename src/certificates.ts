import { prisma } from "./utils/db/prisma";
// async function sendParticipationCertificate() {
//   const participation = await prisma.team.findMany({
//     where: {
//       attended: true,
//     },
//     include: {
//       TeamMembers: {
//         include: {
//           User: {
//             include: {
//               College: true,
//             },
//           },
//         },
//       },
//       Event: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });
//   //  participationData  ={
//   //   name: "Participant Name";
//   //   eventName: "Event Name";
//   //   email: "Participant Email";
//   //   college: "Participant College";
//   // }[]
//   const participationData = participation.map((team) => {
//     return team.TeamMembers.map((member) => {
//       return {
//         name: member.User.name,
//         eventName: team.Event.name,
//         email: member.User.email,
//         college: member.User.College?.name,
//       };
//     });
//   });
//   // reduce the array of arrays to a single array
//   const flattenedParticipationData = participationData.reduce(
//     (acc, val) => acc.concat(val),
//     []
//   );
//   fs.writeFileSync(
//     "./participation.json",
//     JSON.stringify(flattenedParticipationData)
//   );
//   const otherParticipation = participation
//     .map((team) => {
//       return team.TeamMembers.map((member) => {
//         return {
//           name: member.User.name,
//           eventName: team.Event.name,
//           email: member.User.email,
//           teamId: team.id,
//           teamName: team.name,
//           college: member.User.College?.name,
//         };
//       });
//     })
//     .reduce((acc, val) => acc.concat(val), [])
//     .filter((member) => member.college === "Other");
//   fs.writeFileSync(
//     "./otherParticipation.json",
//     JSON.stringify(otherParticipation)
//   );
// }
// sendParticipationCertificate().then(() => {
//   console.log("done");
// });

// async function totalReg() {
//   const totalParticipation = await prisma.user.count({
//     where: {
//       role: {
//         in: ["ORGANIZER", "BRANCH_REP", "PARTICIPANT"],
//       },
//     },
//   });
//   console.log(totalParticipation);
//   const nmamit = await prisma.user.count({
//     where: {
//       role: {
//         in: ["ORGANIZER", "BRANCH_REP", "PARTICIPANT"],
//       },
//       email: {
//         endsWith: "@nmamit.in",
//       },
//     },
//   });
//   console.log(nmamit);
//   console.log(totalParticipation - nmamit);
// }

// async function aluminiInfo() {
//   const ids = [1510, 1614, 1615, 1310, 1373, 1321, 1488, 1486, 1360];
//   const users = await prisma.user.findMany({
//     where: {
//       id: {
//         in: ids,
//       },
//     },
//     include: {
//       College: true,
//       PaymentOrders: true,
//     },
//   });
//   console.log(users.map((user) => user.PaymentOrders));
//   const filterdData = users.map((user) => {
//     return {
//       pid: `INC23-${user.id}`,
//       name: user.name,
//       email: user.email,
//       college: user.College?.name,
//       phoneNo: user.phoneNumber,
//       orderID: user.PaymentOrders[0].orderId,
//       amount: user.PaymentOrders[0].amount / 100,
//       status: user.PaymentOrders[0].status,
//       date: new Date(user.PaymentOrders[0].updatedAt).toLocaleDateString(
//         "en-IN"
//       ),
//     };
//   });
//   console.log(filterdData);
//   fs.writeFileSync("./refund.json", JSON.stringify(filterdData));
// }
// aluminiInfo().then(() => {
//   console.log("done");
// });
import * as fs from "fs";
import * as path from "path";
import * as nodemailer from "nodemailer";
import htmlToImage from "node-html-to-image";
import { getCount, getUser, updateCount } from "./utils/email";

let certificateSentSuccess = 1094;
let certificateSentError = 0;

async function generateCertificate(
  participantName: string,
  college: string,
  eventName: string
): Promise<string> {
  try {
    const templatePath = path.join(__dirname, "certificate.html");
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace {{name}} with participant name
    if (college == "OTHER") {
      html = html.replace("{{college}}", " ").replace("<span> OF</span>", "");
    }
    html = html
      .replace("{{name}}", participantName)
      .replace("{{college}}", college)
      .replace("{{event}}", eventName);

    // Generate image from HTML

    const imageBuffer = await htmlToImage({
      html,
    });

    // Save the image file(s)
    let imagePaths: string[] = [];
    if (Array.isArray(imageBuffer)) {
      imagePaths = imageBuffer.map((buffer, index) => {
        const imagePath = path.join(__dirname, `certificate_${index}.png`);
        fs.writeFileSync(imagePath, buffer);
        return imagePath;
      });
    } else {
      const imagePath = path.join(__dirname, "certificate.png");
      fs.writeFileSync(imagePath, imageBuffer);
      imagePaths.push(imagePath);
    }

    return imagePaths[0]; // Returning the first image path for simplicity
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
}

async function sendEmailWithAttachment(
  participantEmail: string,
  attachmentPath: string,
  subject: string,
  text: string
): Promise<void> {
  try {
    // Create a nodemailer transporter
    const count = await getCount();
    const user = getUser(count);
    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      auth: {
        user: user,
        pass: process.env.EMAIL_SERVER_PASSWORD as string,
      },
    });

    // Compose the email
    const mailOptions = {
      from: user,
      to: participantEmail,
      subject: subject,
      text: text,
      attachments: [{ path: attachmentPath, filename: `certificate.png` }],
    };
    await transporter.sendMail(mailOptions);
    await updateCount(count);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

const sendCertificate = async (
  participantName: string,
  college: string,
  eventName: string,
  participantEmail: string
) => {
  const emailText = `Hi  ${participantName},

Thank you for your active participation in Incridea, held during April 26th-29th at NMAMIT, Nitte.

Your captivating performance aligned perfectly with our theme: 'Tides Of Change', creating ripples of inspiration and change. Let's continue to ignite the creativity and imagination through Incridea in the years to come.❤️
  
Please find your Participation Certificate attached herewith.
  
Warm Regards,
Team Incridea
  
Check out the Official Aftermovie '23 down below 👇
https://youtu.be/8Veb3u0xEoE
  
Find more updates and highlights of the fest on our Instagram page @incridea 👇
https://instagram.com/incridea
 `;
  const emailSubject = `Incridea Participation Certificate (${eventName})`;
  const certificatePath = await generateCertificate(
    participantName,
    college,
    eventName
  );
  await sendEmailWithAttachment(
    participantEmail,
    certificatePath,
    emailSubject,
    emailText
  );
};

async function sendParticipationCertificate() {
  const participation = await prisma.team.findMany({
    where: {
      attended: true,
    },
    include: {
      TeamMembers: {
        include: {
          User: {
            include: {
              College: true,
            },
          },
        },
      },
      Event: {
        select: {
          name: true,
        },
      },
    },
  });
  //  participationData  ={
  //   name: "Participant Name";
  //   eventName: "Event Name";
  //   email: "Participant Email";
  //   college: "Participant College";
  // }[]
  const participationData = participation.map((team) => {
    return team.TeamMembers.map((member) => {
      return {
        userId: member.userId,
        eventId: team.eventId,
        name: member.User.name,
        eventName: team.Event.name,
        email: member.User.email,
        college: member.User.College?.name,
      };
    });
  });
  // reduce the array of arrays to a single array
  const flattenedParticipationData = participationData.reduce(
    (acc, val) => acc.concat(val),
    []
  );
  for (let i = 1094; i < flattenedParticipationData.length; i++) {
    const participant = flattenedParticipationData[i];
    try {
      await sendCertificate(
        participant.name,
        participant.college || "OTHER",
        participant.eventName,
        participant.email
      );
      certificateSentSuccess++;
      await prisma.certificateIssue.create({
        data: {
          EventId: participant.eventId,
          userId: participant.userId,
          issued: true,
        },
      });
    } catch (err) {
      certificateSentError++;
      await prisma.certificateIssue.create({
        data: {
          EventId: participant.eventId,
          userId: participant.userId,
          issued: false,
        },
      });
    }
    console.log(
      `Sent ${certificateSentSuccess} certificates and ${certificateSentError} failed`
    );
  }

  // await fs.writeFileSync(
  //   "./participation.json",
  //   JSON.stringify(flattenedParticipationData)
  // );
}

sendParticipationCertificate()
  .then(() => {
    console.log("done");
  })
  .catch((err) => {
    console.log(err);
  });
