import { DateTime } from 'luxon';
import { ValueTransformer } from 'typeorm';

// TODO: COVER EDGE CASES
export class DateTimeColumn implements ValueTransformer {
	to(date: string) {
		return DateTime.fromISO(date, { zone: 'utc' });
	}

	from(date: string) {
		// TODO: CHECK AFTER REMOVE .ToISO()
		return DateTime.fromJSDate(new Date(date)).toUTC();
	}
}
