import { DateTime } from 'luxon';
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
	VersionColumn,
} from 'typeorm';
import { Patient } from '../patient/patient';
import { Doctor } from '../doctor/doctor';
import { DateTimeColumn } from '../common/util/date-time-column';
import { Exclude, Transform, Type } from 'class-transformer';

@Entity('appointment')
export class Appointment {
	@PrimaryGeneratedColumn('uuid', { name: 'appointment_id' })
	id: string;

	@ManyToOne(() => Patient, { onDelete: 'CASCADE', nullable: false })
	@Exclude()
	patient: Patient;

	@Column({ type: 'uuid' })
	@RelationId((appointment: Appointment) => appointment.patient)
	patientId: string;

	@ManyToOne(() => Doctor, { onDelete: 'CASCADE', nullable: false })
	@Exclude()
	doctor: Doctor;

	@Column({ type: 'uuid' })
	@RelationId((appointment: Appointment) => appointment.doctor)
	doctorId: string;

	@Column({ name: 'date', type: 'timestamptz', transformer: new DateTimeColumn() })
	@Type(() => DateTime)
	@Transform(({ value }) => value.toISO())
	date: DateTime;

	@CreateDateColumn({ name: 'created_at' })
	@Exclude()
	createdAt: Date;

	@VersionColumn({ nullable: true })
	version?: number;
}
