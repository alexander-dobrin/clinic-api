export class DoctorsController {
    constructor(doctorsRepository) {
        this.doctorsRepository = doctorsRepository;
    }

    get(req, res) {
        res.json(this.doctorsRepository.getAll());
    }

    getById(req, res) {
        const doctor = this.doctorsRepository.getOne(req.params.id);
        res.json(doctor);
    }
}