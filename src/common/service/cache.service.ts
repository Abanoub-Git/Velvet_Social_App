import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config";

export class CacheService {

    private readonly client: RedisClientType;
    constructor() {
        this.client = createClient({ url: REDIS_URI })
        this.connect()
    }

    async connect() {
        try {
            await this.client.connect();
            console.log(`REDIS CONNECTED`);

        } catch (error) {
            console.log(`Fail to connect REDIS`);

        }
    }


    async set ({ key, value, ttl = undefined } : { key:string, value:any, ttl?:number | undefined }){
        if (typeof value == "object") {
            value = JSON.stringify(value);
        }
        return await this.client.set(key, value, { ...(ttl ? {EX: ttl} :{} ) });
    };

    async get ({ key } : {key:string}){
        let value = await this.client.get(key);
        try {
            return JSON.parse(value as string);
        } catch (error) {
            return value;
        }
    };

    async exist ({ key } : {key:string}){
        return await this.client.exists(key);
    };


    async update ({ key, value, ttl = undefined } : { key:string, value:any, ttl?:number }){
        if (!(await this.exist({ key }))) {
            return 0;
        }
        return await this.set({ key, value, ttl });
    };


    async del ({ key } : {key:string | string[]}){
        return await this.client.del(key);
    };


    async keys ({ prefix } : {prefix:string}){
        return await this.client.keys(`${prefix}*`);
    };


    async ttl ({ key } : {key:string}){
        return await this.client.ttl(key);
    };


    async expire ({ key , ttl } : {key:string,ttl:number}){
        return await this.client.expire(key , ttl);
    };


    async incrBy ({ key , value=1 }: {key:string,value?:number}){
        return await this.client.incrBy(key , value);
    };


}

export const  cacheService = new CacheService() //3shan admn en m7dsh yft7 aktr mn connection fa est8let alsingle tone w a5dt mno instance 