import mongoose from "mongoose";
import { IComment } from "../../common/interface";

const commentSchema = new mongoose.Schema<IComment>({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    attachments: [String],
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
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

export const CommentModel = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
