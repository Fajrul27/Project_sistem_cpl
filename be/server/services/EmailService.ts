import nodemailer from 'nodemailer';

export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
            pass: process.env.SMTP_PASSWORD || 'your-app-password'
        }
    });

    static async sendResetCode(email: string, code: string, namaLengkap?: string) {
        const mailOptions = {
            from: `"Sistem CPL" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: 'Kode Reset Password - Sistem CPL',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">Permintaan Reset Password</h2>
                    <p>Halo ${namaLengkap || 'Sobat CPL'},</p>
                    <p>Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode verifikasi berikut untuk melanjutkan proses:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #1f2937; margin: 0; letter-spacing: 5px;">${code}</h1>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">Kode ini akan kadaluarsa dalam 10 menit.</p>
                    <p style="color: #6b7280; font-size: 14px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
                    
                    <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">Sistem Informasi Capaian Pembelajaran Lulusan</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${email}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Gagal mengirim email verifikasi');
        }
    }
}
