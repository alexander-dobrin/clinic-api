import { UserRoleEnum } from '../common/enums';

export interface UserPayload {
	id: string;
	email: string;
	role: UserRoleEnum;
}

export interface AuthedUser {
	user: UserPayload;
	token: string;
}
