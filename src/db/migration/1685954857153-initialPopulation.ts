import { MigrationInterface, QueryRunner } from 'typeorm';
import { hashSync } from 'bcrypt';
import { SALT_ROUNDS } from '../../common/constants';

export class InitialPopulation1685954857153 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const users = [
			{ first_name: 'Mary', role: 'doctor', email: 'mary@gmail.com', password: 'mary' },
			{ first_name: 'Alex', role: 'patient', email: 'alex@gmail.com', password: 'alex' },
			{ first_name: 'Guest', role: 'guest', email: 'guest@gmail.com', password: 'guest' },
		];

		for (const user of users) {
			user.password = hashSync(user.password, SALT_ROUNDS);
			const query = `
				INSERT INTO "user" (first_name, "role", email, password)
				VALUES ('${user.first_name}', '${user.role}', '${user.email}', '${user.password}');
      		`;

			await queryRunner.query(query);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {}
}
