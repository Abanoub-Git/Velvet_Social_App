import mongoose from "mongoose";
import { IPost } from "../../common/interface";

const postSchema = new mongoose.Schema<IPost>({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    attachments: [String],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
});

export const PostModel = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);
