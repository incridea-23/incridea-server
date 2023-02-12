const mailgun = require("mailgun-js");
const DOMAIN = process.env.MAILGUN_DOMAIN as string;
const api_key = process.env.MAILGUN_API_KEY as string;
export const mg = mailgun({ apiKey: api_key, domain: DOMAIN });
const data = {
  from: "swasthikshetty10902@gmail.com",
  to: "swasthikshetty10902@gmail.com",
  subject: "Hello",
  text: "Testing some Mailgun awesomness!",
};
mg.messages().send(data, function (error: any, body: any) {
  console.log(body);
});
