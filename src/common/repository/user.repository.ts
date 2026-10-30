import { IUser } from "../interface";
import { DatabaseRepository } from "./db.repository";
import { UserModel } from "../../DB/model";

export class UserRepository extends DatabaseRepository<IUser> {
    constructor() {
        super(UserModel)
    }
}