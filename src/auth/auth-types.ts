import { UserRoleEnum } from '../common/enums';
import { Request } from 'express';

export interface UserPayload {
	id: string;
	email: string;
	role: UserRoleEnum;
}

export interface AuthedUser {
	user: UserPayload;
	token: string;
}

export interface AuthorizedRequest<T = unknown> extends Request {
	user: UserPayload;
	body: T;
}
