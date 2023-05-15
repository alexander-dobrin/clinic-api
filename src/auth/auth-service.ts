import { IDataProvider } from "../common/types";
import { inject, injectable } from "inversify";
import 'reflect-metadata';
import { CONTAINER_TYPES } from "../common/constants";
import { DuplicateEntityError, InvalidParameterError } from "../common/errors";
import { ErrorMessageEnum, UserRoleEnum } from "../common/enums";
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from "../common/constants";
import jwt from "jsonwebtoken";
import { IUser } from "../users/user-interface";
import UserService from "../users/user-service";
import { CreateUserDto } from "../users/dto/create-user-dto";
import { UpdateUserDto } from "../users/dto/update-user-dto";

@injectable()
export class AuthService {
    constructor(
        @inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly provider: IDataProvider<IUser>,
        @inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService
    ) {

    }

    public async register(user: CreateUserDto) {
        if (await this.userService.isUserExist(user.email)) {
            throw new DuplicateEntityError(ErrorMessageEnum.USER_ALLREADY_EXISTS.replace('%s', user.email));
        }

        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        const newUser = await this.userService.createUser(user);
    
        const token = this.signTokenForUser(newUser);

        return { newUser, token };
    }

    public async login(user: IUser) {
        const foundUser = await this.userService.getUserByEmail(user.email);

        // Review: return undefined or throw error when user not found? 
        // Undefined can be processed with controller to return code 400
        if (!foundUser) {
            return;
        }

        const isMatch = await bcrypt.compare(user.password, foundUser.password);
        if (isMatch) {
            const token = this.signTokenForUser(foundUser);
            return { user: { email: foundUser.email, role: foundUser.role, id: foundUser.id }, token };
        } else {
            throw new InvalidParameterError(ErrorMessageEnum.INVALID_PASSWORD);
        }
    }

    public async resetPassword(email: string) {
        const user = await this.userService.getUserByEmail(email);
        if (!user) {
            throw new InvalidParameterError(ErrorMessageEnum.USER_NOT_FOUND.replace('%s', email));
        }

        // Review: should i provide additional info for token payload when reset password?
        const resetToken = this.signTokenForUser(user);
        await this.userService.updateUserResetToken(email, resetToken);

        return resetToken;
    }

    public async recoverPassword(resetToken: string, newPassword: string) {
        const user = await this.userService.getUserByResetToken(resetToken);
        if (!user) {
            throw new InvalidParameterError(ErrorMessageEnum.INVALID_RESET_TOKEN);
        }

        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await this.userService.updateUserById(user.id, new UpdateUserDto(user.email, user.password, user.firstName, user.role));
        await this.userService.updateUserResetToken(user.email, null);

        return "Password has been successfully recovered.";
    }

    private signTokenForUser(user: IUser) {
        // Review: get secret key from .env file? Use email, role and id for token payload?
        // Can i consider payload as auth data I want to share with client?
        return jwt.sign(
            { 
                email: user.email, 
                role: user.role, 
                id: user.id 
            }, 
            process.env.SECRET_KEY, 
            {
                expiresIn: '2 days',
            }
        );
    }
}
