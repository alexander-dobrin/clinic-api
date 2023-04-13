import * as fs from 'fs/promises';
import * as path from 'path';
import { PatientEntity } from './entities/patient-entity.mjs';
import { DoctorEntity } from './entities/doctors-entity.mjs';

const data = await fs.readFile(path.resolve('assets', 'patients.json'), {encoding: 'utf8'});
const patients = JSON.parse(data).map(p => new PatientEntity(p.id, p.firstName, p.phone));

patients.forEach(patient => console.log(patient.firstName));

const data2 = await fs.readFile(path.resolve('assets', 'doctors.json'), {encoding: 'utf8'});
const doctors = JSON.parse(data2).map(d => new DoctorEntity(d.id, d.firstName, d.speciality, d.availableAppointments));

doctors.forEach(doctor => console.log(doctor.availableAppointments));
