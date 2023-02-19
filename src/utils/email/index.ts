//Dev test service
import { request } from './mailjet';

export async function sendEmail(from: string, fromName: string, to: string, toName: string, subject: string, textPart: string, htmlPart: string) {
  request(from, fromName, to, toName, subject, textPart, htmlPart)
    .then((result: any) => {
      console.log(result.body);
    }).catch((err: any) => {
      console.log(err);
    });
}
