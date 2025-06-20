import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(email: string, link: string, purpose: 'login' | 'signup') {
  const actionText = purpose === 'signup' ? 'complete your registration' : 'log in';
  const subject = purpose === 'signup' ? 'Complete your registration' : 'Your login link';
  const html = `<p>Click <a href="${link}">here</a> to ${actionText}. This link expires in ${purpose === 'signup' ? '24 hours' : '15 minutes'}.</p>`;

  const { data, error } = await resend.emails.send({
    from: 'Mutumwa AI<sales@afrainity.com>',
    to: email,
    subject,
    html,
  });

  if (error) {
    console.log(`Failed to send email: ${error.message}`);
  } else {
    console.log(`Magic link sent to ${email}`);
  }
}