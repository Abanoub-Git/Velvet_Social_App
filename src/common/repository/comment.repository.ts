import { IComment } from "../interface";
import { DatabaseRepository } from "./db.repository";
import { CommentModel } from "../../DB/model";

export class CommentRepository extends DatabaseRepository<IComment> {
    constructor() {
        super(CommentModel);
    }
}

