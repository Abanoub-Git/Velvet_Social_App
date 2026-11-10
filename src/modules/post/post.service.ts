import { HydratedDocument } from "mongoose";
import { BadRequestException, ForbiddenException, NotfoundException } from "../../common/exception";
import { IPost } from "../../common/interface";
import { CommentRepository, PostRepository } from "../../common/repository";
import { toObjectId } from "../../common/utils";
import { HUser } from "../../DB/model";

export class PostService {
    private readonly postRepository: PostRepository;
    private readonly commentRepository: CommentRepository;

    constructor() {
        this.postRepository = new PostRepository();
        this.commentRepository = new CommentRepository();
    }

    async createPost(
        { content }: { content: string },
        user: HUser,
        files?: Express.Multer.File[]
    ): Promise<HydratedDocument<IPost>> {
        const attachments = files?.map((file) => file.path) ?? [];
        const post = await this.postRepository.createOne({
            data: {
                content,
                attachments,
                userId: user._id,
            },
        });
        return post;
    }

    async getAllPosts(user: HUser): Promise<HydratedDocument<IPost>[]> {
        const posts = await this.postRepository.find({
            filter: { userId: user._id },
            options: { sort: { createdAt: -1 } },
        });
        return posts;
    }

    async getSinglePost({ postId }: { postId: string }): Promise<HydratedDocument<IPost>> {
        const post = await this.postRepository.findById({
            id: toObjectId(postId),
        });
        if (!post) {
            throw new NotfoundException("Post not found");
        }
        return post;
    }

    async updatePost(
        { postId }: { postId: string },
        { content }: { content?: string | undefined },
        user: HUser,
        files?: Express.Multer.File[]
    ): Promise<HydratedDocument<IPost>> {
        const post = await this.getSinglePost({ postId });
        if (post.userId.toString() !== user._id.toString()) {
            throw new ForbiddenException("You are not allowed to update this post");
        }

        const newAttachments = files?.map((file) => file.path) ?? [];
        if (content === undefined && newAttachments.length === 0) {
            throw new BadRequestException("At least content or attachments must be provided");
        }

        if (content !== undefined) {
            post.content = content;
        }
        if (newAttachments.length > 0) {
            post.attachments = [...(post.attachments ?? []), ...newAttachments];
        }

        await post.save();
        return post;
    }

    async deletePost({ postId }: { postId: string }, user: HUser): Promise<void> {
        const post = await this.getSinglePost({ postId });
        if (post.userId.toString() !== user._id.toString()) {
            throw new ForbiddenException("You are not allowed to delete this post");
        }
        await this.commentRepository.deleteMany({
            filter: { postId: post._id },
        });
        await this.postRepository.deleteOne({
            filter: { _id: post._id },
        });
        return;
    }
}

export const postService = new PostService();
