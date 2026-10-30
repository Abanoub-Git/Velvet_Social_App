"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options = {} }) {
        const [doc] = await this.create({ data: [data], options });
        return doc;
    }
    async findOne({ filter = {}, projection, options }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async findById({ id, projection, options }) {
        const doc = this.model.findById(id, projection);
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async find({ filter = {}, options = {} }) {
        const doc = this.model.find(filter);
        if (options.select) {
            doc.select(options.select);
        }
        if (options.populate) {
            doc.populate(options.populate);
        }
        if (options.skip) {
            doc.skip(options.skip);
        }
        if (options.limit) {
            doc.limit(options.limit);
        }
        if (options.sort) {
            doc.sort(options.sort);
        }
        if (options.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async countDocuments({ filter = {}, }) {
        return await this.model.countDocuments(filter);
    }
    async paginate({ filter = {}, options = {}, page = 1, limit = 5, }) {
        const skip = (page - 1) * limit;
        const count = await this.countDocuments({ filter });
        const pages = Math.ceil(count / limit);
        const docs = await this.find({
            filter,
            options: {
                skip,
                limit,
                ...options
            }
        });
        return { count, limit, pages, currentPage: page, docs };
    }
    async updateOne({ filter = {}, update, options }) {
        return await this.model.updateOne(filter, update, options);
    }
    async updateMany({ filter = {}, update, options }) {
        return await this.model.updateMany(filter, update, options);
    }
    async deleteOne({ filter = {}, }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter = {}, }) {
        return await this.model.deleteMany(filter);
    }
    async findOneAndUpdate({ filter = {}, update, options }) {
        return await this.model.findOneAndUpdate(filter, update, {
            returnDocument: 'after',
            ...options
        });
    }
    async findByIdAndUpdate({ id, update, options }) {
        return await this.model.findByIdAndUpdate(id, update, {
            returnDocument: 'after',
            ...options
        });
    }
    async findOneAndDelete({ filter = {}, }) {
        return await this.model.findOneAndDelete(filter);
    }
    async findByIdAndDelete({ id, }) {
        return await this.model.findByIdAndDelete(id);
    }
}
exports.DatabaseRepository = DatabaseRepository;
