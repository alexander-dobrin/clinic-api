export class AppointmentsController {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }

    schedule(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        const patientId = url.searchParams.get('patientid');
        const doctorId = url.searchParams.get('doctorid');
        const date = url.searchParams.get('date');
        
        try {
            const appointment = this.appointmentService.schedule(patientId, doctorId, date);
            res.status(201).json(appointment);
        } catch (err) {
            res.sendStatus(err.statusCode);
        }
    }

    getAll(req, res) {
        res.json(this.appointmentService.getAll());
    }
}