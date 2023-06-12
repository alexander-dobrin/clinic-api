import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRoleEnum } from '../common/enums';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../common/constants';

@Entity({ name: 'user' })
export class User {
	@PrimaryGeneratedColumn('uuid', { name: 'user_id' })
	public id: string;

	@Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.GUEST })
	public role: UserRoleEnum;

	@Column({ name: 'first_name', type: 'varchar' })
	public firstName: string;

	@Column({ unique: true, type: 'varchar' })
	public email: string;

	@Column({ type: 'varchar' })
	public password: string;

	@Column({ name: 'reset_token', nullable: true, type: 'varchar' })
	public resetToken: string;

	@CreateDateColumn({ name: 'created_at', select: false })
	public createdAt: Date;

	@BeforeInsert()
	@BeforeUpdate()
	private hashPassword() {
		this.password = bcrypt.hashSync(this.password, SALT_ROUNDS);
	}
}
