import { DateTime } from 'luxon';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';
import { UserModel } from '../user/user-model';
import { DateTimeArrayColumn } from '../common/date-time-array-column';

@Entity('doctor')
export class DoctorModel {
	@PrimaryGeneratedColumn('uuid', { name: 'doctor_id' })
	id: string;

	@ManyToOne(() => UserModel, { onDelete: 'CASCADE', nullable: false, eager: true })
	@JoinColumn({ name: 'user_id' })
	@RelationId((doctor: DoctorModel) => doctor.userId) // Review TODO: is it ok that eager stopps working
	userId: string;

	@Column({ type: 'varchar' })
	speciality: string;

	@Column({ name: 'available_slots', type: 'simple-array', transformer: new DateTimeArrayColumn() })
	availableSlots: DateTime[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
