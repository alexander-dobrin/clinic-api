export class DoctorsController {
    constructor(doctorsRepository) {
        this.doctorsRepository = doctorsRepository;
    }

    getAll(req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(this.doctorsRepository.getAll()));
    }

    getOne(req, res) {
        res.setHeader('Content-Type', 'application/json');
        const url = new URL(req.url, `http://${req.headers.host}`);
        const one = this.doctorsRepository.getOne(url.searchParams.get('id'));
        res.end(JSON.stringify(one));
    }
}