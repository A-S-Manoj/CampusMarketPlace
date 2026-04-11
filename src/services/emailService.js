const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

exports.sendOTP = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
            to: toEmail,
            subject: "CampusMarketPlace - Password Reset OTP",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #4CAF50;">Password Reset Request</h2>
                <p>You requested to reset your password. Use the following OTP to proceed:</p>
                <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; text-align: center; font-weight: bold; margin: 20px 0; border-radius: 5px;">
                    ${otp}
                </div>
                <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                <p>Thank you,<br>CampusMarketPlace Team</p>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent: " + info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email.");
    }
};
