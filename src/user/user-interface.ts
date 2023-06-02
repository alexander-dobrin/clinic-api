import { UserRoleEnum } from '../common/enums';

// TODO: MIGRATE TO UserModel
export interface IUser {
	id: string;
	email: string;
	password: string;
	firstName: string;
	role?: UserRoleEnum;
	resetToken?: string;
}
