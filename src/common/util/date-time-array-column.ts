import { DateTime } from 'luxon';
import { ValueTransformer } from 'typeorm';

export class DateTimeArrayColumn implements ValueTransformer {
	to(dates: DateTime[]) {
		return dates.map((d) => d.toISO()).join(',');
	}
	from(dates: string[]) {
		return dates.map((d: string) => DateTime.fromISO(d, { zone: 'utc' }));
	}
}
