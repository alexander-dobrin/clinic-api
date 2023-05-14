import { inject, injectable } from "inversify";
import { IDataProvider } from "../common/types";
import { IUser } from "./user-interface";
import { CONTAINER_TYPES } from "../common/constants";
import { v4 } from "uuid";
import { DuplicateEntityError } from "../common/errors";
import { ErrorMessageEnum } from "../common/enums";

@injectable()
export default class UserService {
    constructor(
        @inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly provider: IDataProvider<IUser>
    ) {

    }

    public async createUser(user: IUser): Promise<IUser> {
        if (await this.isUserExist(user.email)) {
            throw new DuplicateEntityError(ErrorMessageEnum.USER_ALLREADY_EXISTS.replace('%s', user.email));
        }
        const newUser: IUser = { id: v4(), ...user };        
        return this.provider.create(newUser);
    }

    public async isUserExist(email: string): Promise<boolean> {
        const users = await this.provider.read();
        return users.some(u => u.email === email);
    }
}