import express from 'express';

export class Server {
    constructor(patientsController, doctorsController, appointmentsController) {
        this.patientsController = patientsController;
        this.doctorsController = doctorsController;
        this.appointmentsController = appointmentsController;

        this.app = express();
    }

    listen(port) {
        this.app.use(async (req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);

            if (url.pathname === '/patients') {

                await this.handlePatients(req, res);

            } else if (url.pathname === '/doctors') {

                await this.handleDoctors(req, res);

            } else if (url.pathname === '/appointments') {

                await this.handleAppointments(req, res);

            }

            res.sendStatus(404);
        });
        
        this.app.listen(port);
    }

    async handlePatients(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        if (req.method === 'GET') {
            if (url.searchParams.get('id')) {
                this.patientsController.getOne(req, res);
                return;
            }
            this.patientsController.getAll(req, res);
            return;
        }
    }

    async handleDoctors(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        if (req.method === 'GET') {
            if (url.searchParams.get('id')) {
                this.doctorsController.getOne(req, res);
                return;
            }
            this.doctorsController.getAll(req, res);
            return;
        }
    }

    async handleAppointments(req, res) {
        if (req.method === 'GET') {
            this.appointmentsController.getAll(req, res);
            return;
        }

        if (req.method === 'POST') {
            this.appointmentsController.schedule(req, res);
        }
    }
}