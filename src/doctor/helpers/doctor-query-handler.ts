import { DoctorsSortByEnum, ErrorMessageEnum } from "../../common/enums";
import { InvalidParameterError, UnableToSortError } from "../../common/errors";
import { IFilterParam, IQueryParams, IRepository, ISortParam, ISortingStrategy } from "../../common/types";
import DoctorModel from "../doctor-model";
import AppointmentModel from "../../appointment/appointment-model";
import { SortingStrategyFactory } from "./sorting/sorting-strategy-factory";

// Review: декомпозировать это все в отдельные классы или оставить методами сервиса докторов?
export class DoctorQueryHandler {
    private readonly sortingStrategy;

    constructor(
        private readonly appointmentsRepository: IRepository<AppointmentModel>
    ) {
        this.sortingStrategy = new SortingStrategyFactory(appointmentsRepository);
    }

    public async applyRequestQuery(doctors: DoctorModel[], options: IQueryParams): Promise<DoctorModel[]> {
        const copy = [...doctors];
        if (options.filterBy) {
            return this.filter(copy, options.filterBy);
        }
        if (options.sortBy) {
            return await this.sort(doctors, options.sortBy);
        }
        return doctors;
    }

    private filter(doctors: DoctorModel[], filterParams: IFilterParam[]): DoctorModel[] {
        filterParams.forEach((filterParam: IFilterParam) => {
            doctors = doctors.filter((doctor: DoctorModel) => {
                if (!(filterParam.field in doctor)) {
                    throw new InvalidParameterError(
                        ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', filterParam.field)
                    );
                }
                return doctor[filterParam.field] === filterParam.value;
            });
        });
        return doctors;
    }

    private async sort(doctors: DoctorModel[], sortParams: ISortParam[]): Promise<DoctorModel[]> {
        if (doctors.length < 1) {
            throw new UnableToSortError(ErrorMessageEnum.UNABLE_TO_SORT.replace('%s', DoctorsSortByEnum.APPOINTMENTS));
        }
        for (const param of sortParams) {
            const strategy: ISortingStrategy = await this.sortingStrategy.create(param.field as DoctorsSortByEnum);
            const sorted = strategy.sortDescening(doctors);
            doctors = (param.order === 'asc') ? sorted : sorted.reverse();
        }
        return doctors;
    }
}
