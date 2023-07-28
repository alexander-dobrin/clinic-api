import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';
import { User } from '../user/user';

@Entity('patient')
export class Patient {
	@PrimaryGeneratedColumn('uuid', { name: 'patient_id' })
	id: string;

	@ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
	@JoinColumn({ name: 'user_id' })
	@RelationId((patient: Patient) => patient.userId)
	userId: string;

	@Column({ name: 'phone_number', type: 'varchar', unique: true })
	phoneNumber: string;

	@CreateDateColumn({ name: 'created_at', select: false })
	createdAt: Date;

	constructor(userId?: string, phoneNumber?: string) {
		this.userId = userId;
		this.phoneNumber = phoneNumber;
	}
}
