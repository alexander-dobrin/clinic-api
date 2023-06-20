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
import { User } from '../user/user';
import { DateTimeArrayColumn } from '../db/util/date-time-array-column';
import { Exclude, Transform, Type } from 'class-transformer';

@Entity('doctor')
export class Doctor {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@RelationId((doctor: Doctor) => doctor.user)
	userId: string;

	@Column({ type: 'varchar' })
	speciality: string;

	@Type(() => DateTime)
	@Transform(({ value }) => value.map((date: DateTime) => date.toISO()))
	@Column({ name: 'available_slots', type: 'simple-array', transformer: new DateTimeArrayColumn() })
	availableSlots: DateTime[];

	@CreateDateColumn({ name: 'created_at' })
	@Exclude()
	createdAt: Date;
}
