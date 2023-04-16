export class PatientsController {
    constructor(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }

    getAll(req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(this.patientsRepository.getAll()));
    }

    getOne(req, res) {
        res.setHeader('Content-Type', 'application/json');
        const url = new URL(req.url, `http://${req.headers.host}`);
        const one = this.patientsRepository.getOne(url.searchParams.get('id'));
        res.end(JSON.stringify(one));
    }
}