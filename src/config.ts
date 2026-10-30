import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV:string = process.env.NODE_ENV ?? 'development'
config({ path: resolve(`.env.${NODE_ENV}`) })
export const PORT:number = parseInt(process.env.PORT ?? "9000")

export const DB_URI:string = process.env.DB_URI as string
export const REDIS_URI:string = process.env.REDIS_URI as string

export const ENC_KEY:string = process.env.ENC_KEY as string
export const IV_LENGTH:number = parseInt(process.env.IV_LENGTH ?? "16") as number //3shan yt2ri num msh string

export const ACCESS_ADMIN_TOKEN_SIGNATURE:string = process.env.ACCESS_ADMIN_TOKEN_SIGNATURE as string
export const ACCESS_USER_TOKEN_SIGNATURE:string = process.env.ACCESS_USER_TOKEN_SIGNATURE as string
export const ACCESS_TOKEN_EXPIRES_IN:number = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1800") as number

export const REFRESH_ADMIN_TOKEN_SIGNATURE:string = process.env.REFRESH_ADMIN_TOKEN_SIGNATURE as string
export const REFRESH_USER_TOKEN_SIGNATURE:string = process.env.REFRESH_USER_TOKEN_SIGNATURE as string
export const REFRESH_TOKEN_EXPIRES_IN:number = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "31536000") as number

export const WEB_CLIENT_IDS:string = process.env.WEB_CLIENT_IDS as string

export const APP_EMAIL:string = process.env.APP_EMAIL as string
export const APP_PASSWORD:string = process.env.APP_PASSWORD as string
export const APP_NAME:string = process.env.APP_NAME as string

