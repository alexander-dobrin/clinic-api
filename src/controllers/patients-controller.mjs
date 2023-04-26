export class PatientsController {
    constructor(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }

    getAll(req, res) {
        res.json(this.patientsRepository.getAll());
    }

    getOne(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const one = this.patientsRepository.getOne(url.searchParams.get('id'));
        res.json((one));
    }
}