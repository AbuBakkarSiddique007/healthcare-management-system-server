import nodemailer from "nodemailer";
import { envVars } from "../../config/env";
import AppError from "../errorHelper/AppError";
import { StatusCodes } from "http-status-codes";
import path from "path";
import ejs from "ejs";


const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASSWORD
    },
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
})

interface ISendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[]
}

export const sendEmail = async ({ to, subject, templateName, templateData, attachments }: ISendEmailOptions) => {



    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`)

        const html = await ejs.renderFile(templatePath, templateData)
        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        })

        console.log(`Email sent: ${info.messageId} to ${to} with subject: ${subject}`)

    } catch (error) {
        console.error("Error sending email:", (error as Error).message);
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to send email")
    }
}