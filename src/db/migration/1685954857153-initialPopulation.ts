import { MigrationInterface, QueryRunner } from 'typeorm';
import { hashSync } from 'bcrypt';
import { SALT_ROUNDS } from '../../common/constants';

export class InitialPopulation1685954857153 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		queryRunner.query(
			`
                INSERT INTO "user" (first_name, "role", email, password)
                VALUES
                ('Mary', 'doctor', 'mary@gmail.com', '${hashSync('mary', SALT_ROUNDS)}'),
                ('Alex', 'patient', 'alex@gmail.com', '${hashSync('alex', SALT_ROUNDS)}'),
                ('Guest', 'guest', 'guest@gmail.com', '${hashSync('guest', SALT_ROUNDS)}');
            `,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		queryRunner.query(
			`
                DELETE FROM "user"
                WHERE email IN ('mary@gmail.com', 'alex@gmail.com', 'guest@gmail.com');
            `,
		);
	}
}
