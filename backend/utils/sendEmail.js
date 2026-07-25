import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
    try {
        const isConfigured =
            process.env.EMAIL_USER &&
            process.env.EMAIL_USER !== "youremail@gmail.com" &&
            process.env.EMAIL_PASS &&
            process.env.EMAIL_PASS !== "your_16_char_app_password";

        let transporter;

        if (isConfigured) {
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.ethereal.email",
                port: Number(process.env.SMTP_PORT) || 587,
                auth: {
                    user: process.env.SMTP_USER || "test",
                    pass: process.env.SMTP_PASS || "test",
                },
            });
        }

        const info = await transporter.sendMail({
            from: `"HackSphere Platform" <${process.env.EMAIL_USER || "noreply@hacksphere.com"}>`,
            to,
            subject,
            html,
        });

        console.log(`Email dispatched to ${to}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Nodemailer Delivery Notice:", error.message);
        return false;
    }
};