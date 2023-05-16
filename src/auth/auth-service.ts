import { IDataProvider } from "../common/types";
import { inject, injectable } from "inversify";
import { CONTAINER_TYPES } from "../common/constants";
import { DuplicateEntityError, InvalidParameterError } from "../common/errors";
import { ErrorMessageEnum, ResponseMessageEnum, TokenLifetimeEnum, UserRoleEnum } from "../common/enums";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { IUser } from "../users/user-interface";
import UserService from "../users/user-service";
import { UpdateUserDto } from "../users/dto/update-user-dto";
import { LoginDto } from "./dto/login-dto";
import { RegisterDto } from "./dto/register-dto";
import { AuthedUser, UserPayload } from "./auth-types";
import { ResetPasswordDto } from "./dto/reset-password-dto";
import { RecoverPasswordDto } from "./dto/recover-password-dto";

@injectable()
export class AuthService {
    constructor(
        @inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly provider: IDataProvider<IUser>,
        @inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService
    ) {

    }

    public async register(registerData: RegisterDto): Promise<AuthedUser> {
        if (await this.userService.isUserExist(registerData.email)) {
            throw new DuplicateEntityError(ErrorMessageEnum.USER_ALLREADY_EXISTS.replace('%s', registerData.email));
        }
        const newUser = await this.userService.createUser(registerData);    
        const token = this.signTokenForUser(newUser as UserPayload, TokenLifetimeEnum.REGISTER_TOKEN);

        return { user: { email: newUser.email, role: newUser.role, id: newUser.id }, token };
    }

    public async login(loginData: LoginDto): Promise<AuthedUser> {
        const foundUser = await this.userService.getUserByEmail(loginData.email);

        // Review: return undefined or throw error when user not found? 
        // Undefined can be processed with controller to return code 400
        if (!foundUser) {
            return;
        }

        const isMatch = await bcrypt.compare(loginData.password, foundUser.password);
        if (isMatch) {
            const token = this.signTokenForUser(foundUser as UserPayload, TokenLifetimeEnum.LOGIN_TOKEN);
            return { user: { email: foundUser.email, role: foundUser.role, id: foundUser.id }, token };
        } else {
            throw new InvalidParameterError(ErrorMessageEnum.INVALID_PASSWORD);
        }
    }

    public async resetPassword(resetData: ResetPasswordDto) {
        const user = await this.userService.getUserByEmail(resetData.email);
        if (!user) {
            throw new InvalidParameterError(ErrorMessageEnum.USER_NOT_FOUND.replace('%s', resetData.email));
        }

        const resetToken = this.signTokenForUser(user as UserPayload, TokenLifetimeEnum.RESET_TOKEN);
        await this.userService.updateUserResetToken(resetData.email, resetToken);

        return resetToken;
    }

    public async recoverPassword(recoverData: RecoverPasswordDto) {
        const { resetToken, password } = recoverData
        const user = await this.userService.getUserByResetToken(resetToken);
        if (!user) {
            throw new InvalidParameterError(ErrorMessageEnum.INVALID_RESET_TOKEN);
        }
        await this.userService.updateUserById(user.id, new UpdateUserDto(user.email, password, user.firstName, user.role, user.resetToken));
        return ResponseMessageEnum.PASSWORD_RECOVERED;
    }

    private signTokenForUser(user: UserPayload, lifetime: string) {
        // Review: get secret key from .env file? Use email, role and id for token payload?
        // Can i consider payload as auth data I want to share with client after auth?
        return jwt.sign(
            { 
                email: user.email, 
                role: user.role, 
                id: user.id 
            }, 
            process.env.SECRET_KEY, 
            {
                expiresIn: lifetime,
            }
        );
    }
}
