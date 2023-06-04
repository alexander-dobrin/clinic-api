import { DateTime } from 'luxon';
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';
import { PatientModel } from '../patient/patient-model';
import { DoctorModel } from '../doctor/doctor-model';
import { DateTimeColumn } from '../common/util/date-time-column';

@Entity('appointment')
export class AppointmentModel {
	@PrimaryGeneratedColumn('uuid', { name: 'appointment_id' })
	id: string;

	@ManyToOne(() => PatientModel, { onDelete: 'CASCADE', nullable: false })
	patient: PatientModel;

	@Column({ type: 'uuid' })
	@RelationId((appointment: AppointmentModel) => appointment.patient)
	patientId: string;

	@ManyToOne(() => DoctorModel, { onDelete: 'CASCADE', nullable: false })
	doctor: DoctorModel;

	@Column({ type: 'uuid' })
	@RelationId((appointment: AppointmentModel) => appointment.doctor)
	doctorId: string;

	@Column({ name: 'date', type: 'timestamptz', transformer: new DateTimeColumn() })
	date: DateTime;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
