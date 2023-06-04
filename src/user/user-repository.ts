import { DataSource, Repository } from 'typeorm';
import { User } from './user';

export class UserRepository extends Repository<User> {
	constructor(dataProvider: DataSource) {
		super(User, dataProvider.createEntityManager());
	}
}
