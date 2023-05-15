import { UserRoleEnum } from "../common/enums";

export interface IUser {
    id: string;
    email: string;
    password: string;
    firstName: string;
    role: UserRoleEnum;
    resetToken?: string;
}