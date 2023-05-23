import { IUser } from '../user/user-interface';

export class PatientModel {
	constructor(
		public id: string,
		public user: IUser,
		public phoneNumber: string,
	) {}
}
