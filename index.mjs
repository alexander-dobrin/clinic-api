import * as fs from 'fs/promises';
import * as path from 'path';

const data = await fs.readFile(path.resolve('assets', 'patients.json'), {encoding: 'utf8'});
const patients = JSON.parse(data);

patients.forEach(user => console.log(user.firstName));

const data2 = await fs.readFile(path.resolve('assets', 'doctors.json'), {encoding: 'utf8'});
const doctors = JSON.parse(data2);

doctors.forEach(doctor => console.log(doctor.speciality));
