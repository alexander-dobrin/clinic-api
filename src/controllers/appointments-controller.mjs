export class AppointmentsController {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }

    post(req, res) {        
        // body
        try {
            const appointment = this.appointmentService.schedule(patientId, doctorId, date);
            res.status(201).json(appointment);
        } catch (err) {
            res.sendStatus(err.statusCode);
        }
    }

    get(req, res) {
        res.json(this.appointmentService.getAll());
    }
}