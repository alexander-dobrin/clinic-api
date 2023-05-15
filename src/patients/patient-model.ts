import { IUser } from "../users/user-interface";

export default class PatientModel {
    constructor(
        public id: string, 
        // Review: use full model or just id?
        public user: IUser,
        public phoneNumber: string
    ) {
    }
}