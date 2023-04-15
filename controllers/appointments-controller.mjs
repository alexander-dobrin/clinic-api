import { AppointmentEntity } from "../entities/appointment-entity.mjs";

export class AppointmentsController {
    constructor(patientsRepository, doctorsRepository) {
        this.patientsRepository = patientsRepository;
        this.doctorsRepository = doctorsRepository;
    }

    schedule(req, res) {
        res.setHeader('Content-Type', 'application/json');
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        const patient = this.patientsRepository.getOne(url.searchParams.get('patientid'));
        const doctor = this.doctorsRepository.getOne(url.searchParams.get('doctorid'));
        
        const appointment = new AppointmentEntity(
            patient.id, 
            doctor.id, 
            new Date(url.searchParams.get('date'))
        );
        
        res.end(JSON.stringify(appointment));
    }
}