import { ISortingStrategy } from "../../../common/types";
import DoctorModel from "../../doctor-model";

export class SortByNameStrategy implements ISortingStrategy {
    sortDescening(doctors: DoctorModel[]): DoctorModel[] {
        return doctors.sort((a, b) => a.firstName.localeCompare(b.firstName));
    }
}
