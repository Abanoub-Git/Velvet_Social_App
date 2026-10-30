
import { z } from "zod";
import { confirmEmail, resendConfirmEmail, resetPassword, signup } from "../authentication.validation";

//SignupDto { username: string; email: string; phone: string; password: string; confirmPassword: string; }
export type SignupDto = z.infer<ReturnType<typeof signup>>;
export type ConfirmEmailDto = z.infer<ReturnType<typeof confirmEmail>>['body'];
export type ResendConfirmEmailDto = z.infer<ReturnType<typeof resendConfirmEmail>>['body'];
export type ResetPasswordDto = z.infer<ReturnType<typeof resetPassword>>['body'];


