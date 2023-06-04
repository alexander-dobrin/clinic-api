import { Request, Response, NextFunction } from 'express';
import qs from 'qs';
import { In } from 'typeorm';

// TODO: MAKE DECORATOR and/or rename to TypeOrmGetOptionsParser +-
export class QueryMapperMiddleware {
	public map(req: Request, res: Response, next: NextFunction): void {
		try {
			const string = qs.stringify(req.query, {
				filter: (prefix: string, value: any): any => {
					if (typeof value === 'string' && value.startsWith(' ')) {
						return value.replace(' ', '+');
					}
					return value;
				},
			});
			
			req.query = qs.parse(string, { allowDots: true });

			if (req.query.filter) {
				for (const key in req.query.filter as object) {
					if (Object.prototype.hasOwnProperty.call(req.query.filter, key)) {
						const values = req.query.filter[key];
						if (Array.isArray(values)) {
							req.query.filter[key] = In(values);
						}
					}
				}
			}
			next();
		} catch (err) {
			next(err);
		}
	}
}
