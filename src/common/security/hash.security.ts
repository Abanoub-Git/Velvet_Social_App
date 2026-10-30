import bcrypt from "bcrypt";

export const hash = async (plaintext:string, rounds:number = 12, minor:'b'|'a' = "b"):Promise<string> => {
    const salt = bcrypt.genSaltSync(rounds, minor).toString();
    return await bcrypt.hash(plaintext, salt);
};

export const compare = async (plaintext:string, cipherText:string):Promise<boolean> => {
    return await bcrypt.compare(plaintext, cipherText);
};