import mongoose, { HydratedDocument } from "mongoose";
import { BadRequestException, ForbiddenException, NotfoundException } from "../../common/exception";
import { IComment, IPost } from "../../common/interface";
import { CommentRepository, PostRepository } from "../../common/repository";
import { toObjectId } from "../../common/utils";
import { HUser } from "../../DB/model";

export class CommentService {
    private readonly commentRepository: CommentRepository;
    private readonly postRepository: PostRepository;

    constructor() {
        this.commentRepository = new CommentRepository();
        this.postRepository = new PostRepository();
    }

    private async findPostOrThrow(postId: string | mongoose.Types.ObjectId): Promise<HydratedDocument<IPost>> {
        const id = typeof postId === "string" ? toObjectId(postId) : postId;
        const post = await this.postRepository.findById({ id });
        if (!post) {
            throw new NotfoundException("Post not found");
        }
        return post;
    }

    async createComment(
        { postId }: { postId: string },
        { content }: { content: string },
        user: HUser,
        files?: Express.Multer.File[]
    ): Promise<HydratedDocument<IComment>> {
        const post = await this.findPostOrThrow(postId);
        const attachments = files?.map((file) => file.path) ?? [];
        const comment = await this.commentRepository.createOne({
            data: {
                content,
                attachments,
                postId: post._id,
                userId: user._id,
            },
        });
        return comment;
    }

    async getPostComments({ postId }: { postId: string }): Promise<HydratedDocument<IComment>[]> {
        const post = await this.findPostOrThrow(postId);
        const comments = await this.commentRepository.find({
            filter: { postId: post._id },
            options: { sort: { createdAt: -1 } },
        });
        return comments;
    }

    async getSingleComment({ commentId }: { commentId: string }): Promise<HydratedDocument<IComment>> {
        const comment = await this.commentRepository.findById({
            id: toObjectId(commentId),
        });
        if (!comment) {
            throw new NotfoundException("Comment not found");
        }
        return comment;
    }

    async updateComment(
        { commentId }: { commentId: string },
        { content }: { content?: string | undefined },
        user: HUser,
        files?: Express.Multer.File[]
    ): Promise<HydratedDocument<IComment>> {
        const comment = await this.getSingleComment({ commentId });
        if (comment.userId.toString() !== user._id.toString()) {
            throw new ForbiddenException("You are not allowed to update this comment");
        }

        const newAttachments = files?.map((file) => file.path) ?? [];
        if (content === undefined && newAttachments.length === 0) {
            throw new BadRequestException("At least content or attachments must be provided");
        }

        if (content !== undefined) {
            comment.content = content;
        }
        if (newAttachments.length > 0) {
            comment.attachments = [...(comment.attachments ?? []), ...newAttachments];
        }

        await comment.save();
        return comment;
    }

    async deleteComment({ commentId }: { commentId: string }, user: HUser): Promise<void> {
        const comment = await this.getSingleComment({ commentId });
        const isCommentOwner = comment.userId.toString() === user._id.toString();

        if (!isCommentOwner) {
            const post = await this.findPostOrThrow(comment.postId);
            const isPostOwner = post.userId.toString() === user._id.toString();
            if (!isPostOwner) {
                throw new ForbiddenException("You are not allowed to delete this comment");
            }
        }

        await this.commentRepository.deleteOne({
            filter: { _id: comment._id },
        });
        return;
    }
}

export const commentService = new CommentService();
