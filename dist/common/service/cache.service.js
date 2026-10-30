"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = require("redis");
const config_1 = require("../../config");
class CacheService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({ url: config_1.REDIS_URI });
        this.connect();
    }
    async connect() {
        try {
            await this.client.connect();
            console.log(`REDIS CONNECTED`);
        }
        catch (error) {
            console.log(`Fail to connect REDIS`);
        }
    }
    async set({ key, value, ttl = undefined }) {
        if (typeof value == "object") {
            value = JSON.stringify(value);
        }
        return await this.client.set(key, value, { ...(ttl ? { EX: ttl } : {}) });
    }
    ;
    async get({ key }) {
        let value = await this.client.get(key);
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return value;
        }
    }
    ;
    async exist({ key }) {
        return await this.client.exists(key);
    }
    ;
    async update({ key, value, ttl = undefined }) {
        if (!(await this.exist({ key }))) {
            return 0;
        }
        return await this.set({ key, value, ttl });
    }
    ;
    async del({ key }) {
        return await this.client.del(key);
    }
    ;
    async keys({ prefix }) {
        return await this.client.keys(`${prefix}*`);
    }
    ;
    async ttl({ key }) {
        return await this.client.ttl(key);
    }
    ;
    async expire({ key, ttl }) {
        return await this.client.expire(key, ttl);
    }
    ;
    async incrBy({ key, value = 1 }) {
        return await this.client.incrBy(key, value);
    }
    ;
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
