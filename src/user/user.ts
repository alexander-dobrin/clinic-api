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
import { Exclude } from 'class-transformer';

@Entity({ name: 'user' })
export class User {
	@PrimaryGeneratedColumn('uuid', { name: 'user_id' })
	id: string;

	@Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.GUEST })
	role: UserRoleEnum;

	@Column({ name: 'first_name', type: 'varchar' })
	firstName: string;

	@Column({ unique: true, type: 'varchar' })
	email: string;

	@Column({ type: 'varchar' })
	@Exclude()
	password: string;

	@Column({ name: 'reset_token', nullable: true, type: 'varchar' })
	@Exclude()
	resetToken: string;

	@CreateDateColumn({ name: 'created_at' })
	@Exclude()
	createdAt: Date;

	@Column({ name: 'is_activated', type: 'boolean', nullable: false, default: false })
	isActivated: boolean;

	@Column({ name: 'activation_link', type: 'varchar', nullable: true })
	@Exclude()
	activationLink: string;

	@BeforeInsert()
	@BeforeUpdate()
	private hashPassword() {
		this.password = bcrypt.hashSync(this.password, SALT_ROUNDS);
	}
}
