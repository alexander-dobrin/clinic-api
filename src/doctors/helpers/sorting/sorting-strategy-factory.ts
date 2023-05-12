import AppointmentModel from "../../../appointments/appointment-model";
import { DoctorsSortByEnum, ErrorMessageEnum } from "../../../common/enums";
import { UnableToSortError } from "../../../common/errors";
import { IRepository, ISortingStrategy } from "../../../common/types";
import { SortByAppointmentsStrategy } from "./sort-by-appointments-strategy";
import { SortByNameStrategy } from "./sort-by-name-strategy";

export class SortingStrategyFactory {
    constructor(
        private readonly appointmentsRepository: IRepository<AppointmentModel>
    ) {

    }

    public async create(sortBy: DoctorsSortByEnum): Promise<ISortingStrategy> {
        switch (sortBy.toLowerCase()) {
            case DoctorsSortByEnum.NAME:
                return new SortByNameStrategy();
            case DoctorsSortByEnum.APPOINTMENTS:
                return new SortByAppointmentsStrategy(await this.appointmentsRepository.getAll());
            default:
                throw new UnableToSortError(ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', sortBy));
        }
    }
}