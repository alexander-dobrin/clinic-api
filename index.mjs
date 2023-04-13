import * as fs from 'fs/promises';
import * as path from 'path';

const data = await fs.readFile(path.resolve('assets', 'patients.json'), {encoding: 'utf8'});
const patients = JSON.parse(data);

patients.forEach(user => console.log(user.firstName));

