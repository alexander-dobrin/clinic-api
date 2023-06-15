import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';
import { User } from '../user/user';

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

	// TODO: resetToken

	@CreateDateColumn({ name: 'created_at', select: false })
	createdAt: Date;
}
