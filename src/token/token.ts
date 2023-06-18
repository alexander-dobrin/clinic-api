import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../common/constants';

@Entity('token')
export class Token {
	@PrimaryGeneratedColumn('uuid', { name: 'token_id' })
	id: string;

	@OneToOne(() => User, { onDelete: 'NO ACTION', nullable: false })
	@JoinColumn()
	user: User;

	@Column({ type: 'varchar' })
	userId: string;

	@Column({ name: 'refresh_token', type: 'varchar' })
	refreshToken: string;

	@CreateDateColumn({ name: 'created_at', select: false })
	createdAt: Date;

	@BeforeInsert()
	@BeforeUpdate()
	private hashTokenData() {
		this.refreshToken = bcrypt.hashSync(this.refreshToken, SALT_ROUNDS);
	}
}
