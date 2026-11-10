import mongoose from "mongoose";

export interface IComment {
    _id?: mongoose.Types.ObjectId;
    content: string;
    attachments?: string[];
    postId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

