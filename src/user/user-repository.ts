import { DataSource, Repository } from 'typeorm';
import { UserModel } from './user-model';

export class UserRepository extends Repository<UserModel> {
	constructor(dataProvider: DataSource) {
		super(UserModel, dataProvider.createEntityManager());
	}
}