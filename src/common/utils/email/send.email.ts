import nodemailer from "nodemailer";
import { APP_EMAIL, APP_NAME, APP_PASSWORD } from "../../../config.js";
import { BadRequestException } from "../../exception/domain.exception.js";
import { EmailSubjectEnum } from "../../enum/email.enum.js";

//3shan bnst5dmha f kza 7ta signup w confirm ka key string yt5zn f redis  
export const userEmailKey = ({email,subject}:{email:string,subject:EmailSubjectEnum}):string =>{
    return `User::${email}::${subject}:OTP`
}

//howa howa bs lltrails bta3t resend email
export const userEmailTrailsKey = ({email,subject}:{email:string,subject:EmailSubjectEnum}):string => {
    return `${userEmailKey({email,subject})}::trails`
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
});

export const sendEmail = async ({ 
    to, 
    cc, 
    bcc, 
    subject, 
    text, 
    html, 
    attachments=[] 
}:{ 
    to?:string[], 
    cc?:string[], 
    bcc?:string[], 
    subject:string, 
    text?:string, 
    html?:string, 
    attachments?:any[] 
}) => {
try {
    if(!to?.length && !cc?.length && !bcc?.length){
        throw new BadRequestException("missing email subject or recipient")
    }
    if(!text?.length && !html?.length && !attachments?.length){
        throw new BadRequestException("missing email content")
    }
    const info = await transporter.sendMail({
        from: `"${APP_NAME}" <${APP_EMAIL}>`,
        to, 
        cc,
        bcc,
        subject, 
        text, 
        html, 
        attachments, 
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
    console.error("Error while sending mail:", err);
    throw err
    }
}