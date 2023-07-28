import { DateTime } from 'luxon';
import { ValueTransformer } from 'typeorm';

export class DateTimeColumn implements ValueTransformer {
	to(date: string) {
		return DateTime.fromISO(date, { zone: 'utc' });
	}

	from(date: string) {
		return DateTime.fromJSDate(new Date(date)).toUTC();
	}
}
