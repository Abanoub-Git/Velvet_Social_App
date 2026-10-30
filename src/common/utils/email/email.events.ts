import { EventEmitter } from "node:events";
import { sendEmail } from "./send.email";
import { verifyEmailTemplate } from "./email.template";
import { EmailSubjectEnum } from "../../enum";

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({
    subject = EmailSubjectEnum.CONFIRM_EMAIL,
    recipients,
    data
}: {
    subject?: EmailSubjectEnum,
    recipients: { to?: string[], cc?: string[], bcc?: string[] },
    data: any
}) => {
    try {
        await sendEmail({ ...recipients, subject, html: verifyEmailTemplate({ subject, title: subject, code: data.code }) });

    } catch (error) {
        console.log(error);
    }
})