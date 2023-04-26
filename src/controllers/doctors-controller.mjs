export class DoctorsController {
    constructor(doctorsRepository) {
        this.doctorsRepository = doctorsRepository;
    }

    getAll(req, res) {
        res.json(this.doctorsRepository.getAll());
    }

    getOne(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const one = this.doctorsRepository.getOne(url.searchParams.get('id'));
        res.json(one);
    }
}