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
import { DateTimeColumn } from '../db/util/date-time-column';
import { Transform, Type } from 'class-transformer';

@Entity('appointment')
export class Appointment {
	@PrimaryGeneratedColumn('uuid', { name: 'appointment_id' })
	id: string;

	@ManyToOne(() => Patient, { onDelete: 'CASCADE', nullable: false })
	patient: Patient;

	@Column({ type: 'uuid' })
	@RelationId((appointment: Appointment) => appointment.patient)
	patientId: string;

	@ManyToOne(() => Doctor, { onDelete: 'CASCADE', nullable: false })
	doctor: Doctor;

	@Column({ type: 'uuid' })
	@RelationId((appointment: Appointment) => appointment.doctor)
	doctorId: string;

	@Column({ name: 'date', type: 'timestamptz', transformer: new DateTimeColumn() })
	@Type(() => DateTime)
	@Transform(({ value }) => value.toISO())
	date: DateTime;

	@CreateDateColumn({ name: 'created_at', select: false })
	createdAt: Date;

	@VersionColumn()
	version?: number;
}
