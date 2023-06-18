import { UserRoleEnum } from '../../common/enums';

export class UserResponseDto {
	id: string;
	email: string;
	role: UserRoleEnum;
	accessToken: string;
	refreshToken: string;
}
