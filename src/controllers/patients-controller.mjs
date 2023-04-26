export class PatientsController {
    constructor(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }

    get(req, res) {
        res.json(this.patientsRepository.getAll());
    }

    getById(req, res) {
        const patient = this.patientsRepository.getOne(req.params.id);
        res.json((patient));
    }
}