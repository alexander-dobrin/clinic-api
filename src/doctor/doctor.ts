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
	@PrimaryGeneratedColumn('uuid', { name: 'doctor_id' })
	id: string;

	// Review: я нашел способ сохранить отношения между сущностями, чтоб например работало onDelete: 'cascade'
	// и чтоб в объекте хранился только id сущности, а не вся она целиком. Это имеет ограничения,
	// но в целом стоит ли так делать?
	@ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false, eager: true })
	@JoinColumn({ name: 'user_id' })
	@RelationId((doctor: Doctor) => doctor.userId)
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
