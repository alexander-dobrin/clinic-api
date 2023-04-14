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
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString(); 
            });

            req.on('end', async () => {
                const appointmentData = JSON.parse(body);
                const patient = await getPatient(appointmentData.patientId);
                const doctor = await getDoctor(appointmentData.doctorId);
                
                const appointment = makeAppointment(patient, doctor, new Date(appointmentData.startDate));
                console.log(appointment);
                res.end();
                //const url = new URL(`http://localhost:3000${req.url}`);
            });
        }
    }
    
    res.statusCode = 404;
    res.end('unknown endpoint');
});

dotenv.config()

server.listen(process.env.PORT);

async function getPatients() {
    return JSON.parse(await fs.readFile(path.resolve('assets', 'patients.json'), { encoding: 'utf8' }))
        .map(p => new PatientEntity(p.id, p.firstName, p.phone));
}

async function getPatient(id) {
    const patients = await getPatients();
    return patients.find(p => p.id === id);
}

async function getDoctors() {
    return JSON.parse(await fs.readFile(path.resolve('assets', 'doctors.json'), { encoding: 'utf8' }))
        .map(d => new DoctorEntity(d.id, d.firstName, d.speciality, d.availableAppointments));
}

async function getDoctor(id) {
    const doctors = await getDoctors();
    return doctors.find(d => d.id === id);
}

function makeAppointment(patient, doctor, date) {
    const isSlotAvailable = doctor.availableAppointments.some(a => a.getTime() === date.getTime());

    if (!isSlotAvailable) {
        throw new Error('time is taken');
    }

    return new AppointmentEntity(patient.id, doctor.id, date);
}