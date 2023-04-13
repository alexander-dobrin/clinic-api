import * as fs from 'fs/promises';
import * as path from 'path';
import * as http from 'http';
import dotenv from 'dotenv';
import { PatientEntity } from './entities/patient-entity.mjs';
import { DoctorEntity } from './entities/doctors-entity.mjs';
import { AppointmentEntity } from './entities/appointment-entity.mjs';

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;

    if (req.method === 'GET') {
        if (req.url === '/patients') {
            const patients = await getPatients();
            res.end(patients);
        } else if (req.url === '/doctors') {
            const doctors = await getDoctors();
            res.end(doctors);
        }
    } else if (req.method === 'POST') {
        if (req.url === '/appointment') {
            // TODO: parse url and call makeAppointment with params from url
        }
    }
    
    res.statusCode = 404;
    res.end('unknown endpoint');
});

dotenv.config()

server.listen(process.env.PORT);

async function getPatients() {
    return fs.readFile(path.resolve('assets', 'patients.json'), { encoding: 'utf8' });
}

async function getDoctors() {
    return fs.readFile(path.resolve('assets', 'doctors.json'), { encoding: 'utf8' });
}

function makeAppointment(patient, doctor, date) {
    const isSlotAvailable = doctor.availableAppointments.some(a => a.getTime() === date.getTime());

    if (!isSlotAvailable) {
        throw new Error('time is taken');
    }

    return new AppointmentEntity(patient.id, doctor.id, date);
}