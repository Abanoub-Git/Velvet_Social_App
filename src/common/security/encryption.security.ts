import crypto from "node:crypto";
import { ENC_KEY, IV_LENGTH } from "../../config.js";

export const encryption = async (plaintext:string):Promise<string> => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv);
    let encryptData = cipher.update(plaintext, "utf-8", "hex");
    encryptData += cipher.final("hex");
    // console.log({ cipher, encryptData });/
    return `${iv.toString("hex")}:::${encryptData}`; //da kda m3na klmt bebo encrypted
};


export const decryption = async (cipherText:string):Promise<string> => {
    const [iv, encryptedData] = cipherText.split(":::") as [string | Buffer,string];
    const iv_vector = Buffer.from(iv as string, "hex");
    const decipherVector = crypto.createDecipheriv("aes-256-cbc",ENC_KEY,iv_vector);
    let plaintext = decipherVector.update(encryptedData,"hex","utf8");
    plaintext += decipherVector.final("utf8");
    return plaintext;
}