"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailTemplate = exports.templates = void 0;
const email_enum_js_1 = require("../../enum/email.enum.js");
exports.templates = {
    [email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL]: (data) => {
        return `
        <!DOCTYPE html>
        <html>
        <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
        <style type="text/css">body{background-color:#f5f5f5;margin:0;}</style>
        </head>
        <body style="margin:0;">
        <table border="0" width="50%" style="margin:auto;padding:30px;background-color:#fff;border:1px solid #D4A84F;border-radius:8px;">
        <tr><td>
        <table border="0" width="100%">
        <tr><td><h1 style="margin:0;color:#111;"><img width="100px" src="https://res.cloudinary.com/dtgbzmpca/image/upload/v1642367682/fire.png"></h1></td><td><p style="text-align:right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration:none;color:#D4A84F;font-weight:bold;">View In Website</a></p></td></tr>
        </table>
        </td></tr>
        <tr><td>
        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color:#111;border-radius:8px;padding:30px 20px;">
        <tr><td><h2 style="margin:0;color:#D4A84F;font-size:26px;">${data.title}</h2><p style="color:#fff;font-size:16px;margin-top:15px;">Your verification code is</p><div style="display:inline-block;background-color:#D4A84F;color:#111;padding:15px 30px;border-radius:6px;font-size:28px;font-weight:bold;letter-spacing:5px;margin-top:10px;">${data.code}</div></td></tr>
        </table>
        </td></tr>
        <tr><td>
        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;margin-top:20px;">
        <tr><td><h3 style="margin-top:10px;color:#111;">Stay in touch</h3></td></tr>
        <tr><td><div style="margin-top:20px;">
        <a href="http://www.facebook.com" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#111;color:#D4A84F;border-radius:50%;margin:0 5px;"><i class="fa fa-facebook"></i></span></a>
        <a href="http://www.instagram.com" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#111;color:#D4A84F;border-radius:50%;margin:0 5px;"><i class="fa fa-instagram"></i></span></a>
        <a href="http://www.twitter.com" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#111;color:#D4A84F;border-radius:50%;margin:0 5px;"><i class="fa fa-twitter"></i></span></a>
        </div></td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>`;
    },
    [email_enum_js_1.EmailSubjectEnum.FORGOT_PASSWORD]: (data) => {
        return `
        <!DOCTYPE html>
            <html>
            <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
            <style type="text/css">body{background-color:#f1f5f9;margin:0;}</style>
            </head>
            <body style="margin:0;">
            <table border="0" width="50%" style="margin:auto;padding:30px;background-color:#fff;border:1px solid #38BDF8;border-radius:8px;">
            <tr><td>
            <table border="0" width="100%">
            <tr><td><h1 style="margin:0;color:#172554;"><img width="100px" src="https://res.cloudinary.com/dtgbzmpca/image/upload/v1642367682/fire.png"></h1></td><td><p style="text-align:right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration:none;color:#0284C7;font-weight:bold;">View In Website</a></p></td></tr>
            </table>
            </td></tr>
            <tr><td>
            <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color:#172554;border-radius:8px;padding:30px 20px;">
            <tr><td><h2 style="margin:0;color:#38BDF8;font-size:26px;">${data.title}</h2><p style="color:#fff;font-size:16px;margin-top:15px;">Use the code below to reset your password</p><div style="display:inline-block;background-color:#38BDF8;color:#172554;padding:15px 30px;border-radius:6px;font-size:28px;font-weight:bold;letter-spacing:5px;margin-top:10px;">${data.code}</div></td></tr>
            </table>
            </td></tr>
            <tr><td>
            <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;margin-top:20px;">
            <tr><td><h3 style="margin-top:10px;color:#172554;">Stay in touch</h3></td></tr>
            <tr><td><div style="margin-top:20px;">
            <a href="${process.env.facebookLink}" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#172554;color:#38BDF8;border-radius:50%;margin:0 5px;"><i class="fa fa-facebook"></i></span></a>
            <a href="${process.env.instagram}" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#172554;color:#38BDF8;border-radius:50%;margin:0 5px;"><i class="fa fa-instagram"></i></span></a>
            <a href="${process.env.twitterLink}" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#172554;color:#38BDF8;border-radius:50%;margin:0 5px;"><i class="fa fa-twitter"></i></span></a>
            </div></td></tr>
            </table>
            </td></tr>
            </table>
            </body>
        </html>`;
    },
    [email_enum_js_1.EmailSubjectEnum.TWO_STEP_VERIFICATION]: (data) => {
        return `
        <!DOCTYPE html>
            <html>
            <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
            <style type="text/css">body{background-color:#f5f5f5;margin:0;}</style>
            </head>
            <body style="margin:0;font-family: Arial, sans-serif;">
            <table border="0" width="50%" style="margin:auto;padding:30px;background-color:#fff;border:1px solid #8D5B4C;border-radius:8px;">
            <tr><td>
            <table border="0" width="100%">
            <tr>
                <td><h1 style="margin:0;color:#111;"><img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icasyu.png"></h1></td>
                <td><p style="text-align:right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration:none;color:#8D5B4C;font-weight:bold;">View In Website</a></p></td>
            </tr>
            </table>
            </td></tr>
            <tr><td>
            <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color:#2E6F40;border-radius:8px;padding:30px 20px;">
            <tr><td>
                <h2 style="margin:0;color:#FFF;font-size:26px;">${data.title || 'Two-Step Verification'}</h2>
                <p style="color:#F3F4F6;font-size:16px;margin-top:15px;">Your verification code is</p>
                <div style="display:inline-block;background-color:#8D5B4C;color:#FFF;padding:15px 30px;border-radius:6px;font-size:28px;font-weight:bold;letter-spacing:5px;margin-top:10px;">${data.code}</div>
            </td></tr>
            </table>
            </td></tr>
            <tr><td>
            <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;margin-top:20px;">
            <tr><td><h3 style="margin-top:10px;color:#8D5B4C;">Stay in touch</h3></td></tr>
            <tr><td><div style="margin-top:20px;">
            <a href="http://www.facebook.com" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#8D5B4C;color:#FFF;border-radius:50%;margin:0 5px;"><i class="fa fa-facebook"></i></span></a>
            <a href="http://www.instagram.com" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#8D5B4C;color:#FFF;border-radius:50%;margin:0 5px;"><i class="fa fa-instagram"></i></span></a>
            <a href="http://www.twitter.com" style="text-decoration:none;"><span style="display:inline-block;padding:10px 9px;background-color:#8D5B4C;color:#FFF;border-radius:50%;margin:0 5px;"><i class="fa fa-twitter"></i></span></a>
            </div></td></tr>
            </table>
            </td></tr>
            </table>
            </body>
        </html>`;
    }
};
const verifyEmailTemplate = (data) => {
    return exports.templates[data.subject](data);
};
exports.verifyEmailTemplate = verifyEmailTemplate;
