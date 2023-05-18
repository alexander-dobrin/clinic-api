import { UserRoleEnum } from "../common/enums";

// Review: use interfaces for models or classes?
export interface IUser {
    id: string;
    email: string;
    password: string;
    firstName: string;
    role?: UserRoleEnum;
    resetToken?: string;
}