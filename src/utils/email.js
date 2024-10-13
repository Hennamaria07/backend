import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
};

export const generateVerificationEmail = (token, id) => {
    const verificationLink = `${process.env.APP_URL}/verify-email?user=${id}`;
    return `
        <h1>Verify Your Email</h1>
        <p>Thank you for signing up! Please use the following 4-digit code to verify your email address:</p>
      <div>${token}</div>
       <div>This code is valid for 5 minutes.</div>
        <a href="${verificationLink}">Verify Email</a>
    `;
};

export const generatePasswordResetEmail = (token, id) => {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}?user=${id}`;
    return `
        <h1>Reset Your Password</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
    `;
};
