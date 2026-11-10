import { IPost } from "../interface";
import { DatabaseRepository } from "./db.repository";
import { PostModel } from "../../DB/model";

export class PostRepository extends DatabaseRepository<IPost> {
    constructor() {
        super(PostModel);
    }
}

