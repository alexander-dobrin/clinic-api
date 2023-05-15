import { inject, injectable } from "inversify";
import { IDataProvider } from "../common/types";
import { IUser } from "./user-interface";
import { CONTAINER_TYPES } from "../common/constants";
import { v4 } from "uuid";
import { DuplicateEntityError } from "../common/errors";
import { ErrorMessageEnum, UserRoleEnum } from "../common/enums";
import { merge } from "lodash";

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
        // Review: on which criteria initial user role is defined and which module is responsible for that?
        // Should user role be passed in req body and, if not, set do default, and then 
        // set to doctor/patient when creating patient or doctor?
        // Should user role be set in UserService or AuthService?
        // Should role be set during login or registration?
        const newUser: IUser = { id: v4(), role: user.role ?? UserRoleEnum.GUEST, ...user };        
        return this.provider.create(newUser);
    }

    public async isUserExist(email: string): Promise<boolean> {
        const users = await this.provider.read();
        return users.some(u => u.email === email);
    }

    public async getUserByEmail(email: string): Promise<IUser> {
        const users = await this.provider.read();
        return users.find(u => u.email === email);
    }

    public async updateUserByEmail(email: string, userNewData: IUser): Promise<IUser> {
        const isOldEmail = email === userNewData.email;
        if (!isOldEmail && await this.isUserExist(userNewData.email)) {
            throw new DuplicateEntityError(ErrorMessageEnum.USER_ALLREADY_EXISTS.replace('%s', userNewData.email));
        }
        const user = await this.getUserByEmail(email);
        if (!user) {
            return;
        }
        // Review: use merge or create new user manually with constructor
        merge(user, userNewData);
        return this.provider.updateById(user.id, user);
    }

    public async getUserByResetToken(token: string) {
        const users = await this.provider.read();
        return users.find(u => u?.resetToken === token);
    }
}