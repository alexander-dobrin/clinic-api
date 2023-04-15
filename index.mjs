import * as http from 'http';
import dotenv from 'dotenv';
import { AppointmentEntity } from './entities/appointment-entity.mjs';
import { PatientsController } from './controllers/patients-controller.mjs';
import { DoctorsController } from './controllers/doctors-controller.mjs';

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (url.pathname === '/patients') {
        const patientsController = new PatientsController();
        
        if (url.searchParams.get('id')) {
            patientsController.getOne(req, res);
            return;
        }
        patientsController.getAll(req, res);
    } else if (url.pathname === '/doctors') {
        const doctorsController = new DoctorsController();

        if (url.searchParams.get('id')) {
            doctorsController.getOne(req, res);
            return;
        }
        doctorsController.getAll(req, res);
    }

    res.statusCode = 404;
    res.end();

    // if (req.method === 'POST') {
    //     if (req.url === '/appointment') {
    //         let body = '';
            
    //         req.on('data', chunk => {
    //             body += chunk.toString(); 
    //         });

    //         req.on('end', async () => {
    //             const appointmentData = JSON.parse(body);
    //             const patient = await getPatient(appointmentData.patientId);
    //             const doctor = await getDoctor(appointmentData.doctorId);
                
    //             const appointment = makeAppointment(patient, doctor, new Date(appointmentData.startDate));
    //             console.log(appointment);
    //             res.end();
    //             //const url = new URL(`http://localhost:3000${req.url}`);
    //         });
    //     }
    // }
    
    // res.statusCode = 404;
    // res.end('unknown endpoint');
});

dotenv.config()

server.listen(process.env.PORT);

function makeAppointment(patient, doctor, date) {
    const isSlotAvailable = doctor.availableAppointments.some(a => a.getTime() === date.getTime());

    if (!isSlotAvailable) {
        throw new Error('time is taken');
    }

    return new AppointmentEntity(patient.id, doctor.id, date);
}