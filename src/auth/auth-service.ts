import { IDataProvider } from "../common/types";
import { inject, injectable } from "inversify";
import 'reflect-metadata';
import { CONTAINER_TYPES } from "../common/constants";
import { DuplicateEntityError } from "../common/errors";
import { ErrorMessageEnum } from "../common/enums";
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from "../common/constants";
import jwt from "jsonwebtoken";
import { IUser } from "../users/user-interface";
import UserService from "../users/user-service";

@injectable()
export class AuthService {
    constructor(
        @inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly provider: IDataProvider<IUser>,
        @inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService
    ) {

    }

    public async register(user: IUser) {
        if (await this.userService.isUserExist(user.email)) {
            throw new DuplicateEntityError(ErrorMessageEnum.USER_ALLREADY_EXISTS.replace('%s', user.email));
        }

        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        const newUser = await this.userService.createUser(user);
    
        const token = jwt.sign({ email: newUser.email, id: newUser.id }, process.env.SECRET_KEY, {
            expiresIn: '2 days',
        });

        return { newUser, token };
    }
}
