import mongoose, { AnyKeys, CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult } from "mongoose";
import { IPaginate } from "../interface";

export abstract class DatabaseRepository<TRawDocType> {
    constructor(protected model: Model<TRawDocType>) {
    }

    //CREATE - CREATE ONE
    async create({ data }: { data: AnyKeys<TRawDocType> }): Promise<HydratedDocument<TRawDocType>>;
    async create({ data, options }: { data: AnyKeys<TRawDocType>[]; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType>[]>;
    async create({ data, options }: { data: AnyKeys<TRawDocType> | AnyKeys<TRawDocType>[]; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType> | HydratedDocument<TRawDocType>[]> {
        return await this.model.create(data as any, options)//any hna leha 2ema 3shan ana msh 3arf aldata ali rag3a di array wla object
    }
    async createOne({ data, options = {} }: { data: AnyKeys<TRawDocType>; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType>> {
        const [doc] = await this.create({ data: [data], options })
        return doc as HydratedDocument<TRawDocType>
    }


    //FIND ONE
    //3shan msh kol mra a7otlo IUser aw HUser w howa yfhm 3latol 3la 7sb ali da5l (3shan kda ana 3aml aktr mn type) 
    //TrawDocType mkanha byt7t almodel ali ana hsht8l 3leh bdl kol mra akrr alcode lkol model
    async findOne({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType> & { lean: true } | null | undefined
    }): Promise<FlattenMaps<TRawDocType> | undefined | null>
    
    
    async findOne({
    filter,
    projection,
    options
    }: {
        filter: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType> & { lean?: false } | null | undefined
    }): Promise<HydratedDocument<TRawDocType> | undefined | null>


    async findOne({
    filter = {},
    projection,
    options
    }: {
        filter: QueryFilter<TRawDocType>;
        projection?: ProjectionType<TRawDocType> | null | undefined;
        options?: QueryOptions<TRawDocType> &{lean?: boolean } | null | undefined;
    }): Promise<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null> {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[])
        }
        if (options?.lean) {
            doc.lean(options.lean)
        }
        return await doc.exec()
    }


    //FIND BY ID
    async findById({
        id,
        projection,
        options
    }: {
        id:mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType> & { lean: true } | null | undefined
    }): Promise<FlattenMaps<TRawDocType> | undefined | null>
    
    
    async findById({
    id,
    projection,
    options
    }: {
        id:mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType> & { lean?: false } | null | undefined
    }): Promise<HydratedDocument<TRawDocType> | undefined | null>


    async findById({
    id,
    projection,
    options
    }: {
        id:mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocType> | null | undefined;
        options?: QueryOptions<TRawDocType> &{lean?: boolean } | null | undefined;
    }): Promise<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null> {
        const doc = this.model.findById(id, projection);
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[])
        }
        if (options?.lean) {
            doc.lean(options.lean)
        }
        return await doc.exec()
    }


    //FIND
    async find({
        filter = {},
        options = {}
    }: {
        filter?: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType>
    }):Promise<HydratedDocument<TRawDocType>[]>{
        const doc = this.model.find(filter);
        if (options.select) {
            doc.select(options.select);
        }
        if (options.populate) {
            doc.populate(options.populate as PopulateOptions[]);
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
    
    
    //COUNT
    async countDocuments({
        filter = {},
    }: {
        filter?: QueryFilter<TRawDocType>,
    }): Promise<number> {
        return await this.model.countDocuments(filter)
    }

    
    //PAGINATE
    async paginate({
        filter = {},
        options = {},
        page = 1,
        limit = 5,
    }: {
        filter?: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType>,
        page: number,
        limit: number,
    }):Promise<IPaginate<HydratedDocument<TRawDocType>>> {
        const skip = (page - 1) * limit;
        const count = await this.countDocuments({ filter })
        const pages = Math.ceil(count / limit)

        const docs = await this.find({
            filter,
            options: {
                skip,
                limit,
                ...options
            }
        })
        return { count, limit, pages, currentPage: page, docs } //3shan m7tag a3rf type ali rag3 mn kol da fa h3ml interface
    }


    //UPDATE ONE
    async updateOne(
    {
        filter = {},
        update,
        options
    }: {
            filter: QueryFilter<TRawDocType>,
            update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
            options?: MongooseUpdateQueryOptions<TRawDocType> | null
        }
    ): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(filter, update, options)
    }


    //UPDATE MANY
    async updateMany(
    {
        filter = {},
        update,
        options
    }: {
            filter: QueryFilter<TRawDocType>,
            update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
            options?: MongooseUpdateQueryOptions<TRawDocType> | null
        }
    ): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(filter, update, options)
    }


    //DELETE ONE
    async deleteOne(
        {
            filter = {},
        }: {
            filter: QueryFilter<TRawDocType>,
        }
    ): Promise<DeleteResult> {
        return await this.model.deleteOne(filter)
    }



    //DELETE MANY
    async deleteMany(
        {
            filter = {},
        }: {
            filter: QueryFilter<TRawDocType>,
        }
    ): Promise<DeleteResult> {
        return await this.model.deleteMany(filter)
    }


    //FIND ONE AND UPDATE
    async findOneAndUpdate(
        {
            filter = {},
            update,
            options
        }: {
            filter?: QueryFilter<TRawDocType>,
            update?: UpdateQuery<TRawDocType>,
            options?: QueryOptions<TRawDocType> | null
        }
    ): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findOneAndUpdate(filter, update, {
            returnDocument: 'after',
            ...options
        })
    }


    //FIND BY ID AND UPDATE
    async findByIdAndUpdate(
        {
            id,
            update,
            options
        }: {
            id: mongoose.Types.ObjectId,
            update?: UpdateQuery<TRawDocType>,
            options?: QueryOptions<TRawDocType> | null
        }
    ): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findByIdAndUpdate(id, update, {
            returnDocument: 'after',
            ...options
        })
    }


    //FIND ONE AND DELETE
    async findOneAndDelete(
        {
            filter = {},
        }: {
            filter?: QueryFilter<TRawDocType>,
        }
    ): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findOneAndDelete(filter)
    }


    //FIND BY ID AND DELETE
    async findByIdAndDelete(
        {
            id,
        }: {
            id: mongoose.Types.ObjectId,
        }
    ): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findByIdAndDelete(id)
    }


}



