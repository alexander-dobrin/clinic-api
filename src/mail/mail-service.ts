import { transporter } from './nodemailer.config';

export class MailService {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private constructor() {}

	public static async sendActivationMail(to, link) {
		await transporter.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject: 'Accaunt activation on ' + process.env.API_URL,
			text: '',
			html: `
                <div>
                    <h1>Activation link</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
		});
	}
}
