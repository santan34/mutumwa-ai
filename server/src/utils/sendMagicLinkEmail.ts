import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(email: string, link: string) {
  const { data, error } = await resend.emails.send({
  from: 'Mutumwa AI<sales@afrainity.com>',
  to: email,
  subject: 'Your login link',
  html: `<p>Click <a href="${link}">here</a> to log in. This link expires in 15 minutes.</p>`,
  });

if (error) {
  console.log(`Failed to send email: ${error.message}`);
}
}