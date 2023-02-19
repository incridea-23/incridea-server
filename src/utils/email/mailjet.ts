const mailjet = require('node-mailjet').connect(
    process.env.MAILJET_API_KEY as string,
    process.env.MAILJET_API_SECRET as string
)

//TODO: Change template

export function request(from: string, fromName: string, to: string, toName: string, subject: string, textPart: string, htmlPart: string): any {
    return (mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: `${from}`,
                    Name: `${fromName}`,
                },
                To: [
                    {
                        Email: `${to}`,
                        Name: `${toName}`,
                    },
                ],
                Subject: `${subject}`,
                TextPart: `${textPart}`,
                HTMLPart: `${htmlPart}`,
            },
        ],
    }))
}