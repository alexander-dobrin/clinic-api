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
            this.appointmentService.schedule(patientId, doctorId, date);
            res.statusCode = 200;
        } catch (err) {
            res.statusCode = err.statusCode;
            res.end();
        }

        res.end();
    }
}