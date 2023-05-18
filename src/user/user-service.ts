import { inject, injectable } from "inversify";
import { IDataProvider, IRepository } from "../common/types";
import { IUser } from "./user-interface";
import { CONTAINER_TYPES, SALT_ROUNDS } from "../common/constants";
import { v4 } from "uuid";
import { DuplicateEntityError, UserConfilctError } from "../common/errors";
import { ErrorMessageEnum, UserRoleEnum } from "../common/enums";
import { merge } from "lodash";
import { CreateUserDto } from "./dto/create-user-dto";
import { UpdateUserDto } from "./dto/update-user-dto";
import bcrypt from "bcrypt";
import PatientModel from "../patient/patient-model";
import { validDto, validateDto } from "../common/decorator";


@injectable()
export default class UserService {
    constructor(
        @inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly provider: IDataProvider<IUser>,
        @inject(CONTAINER_TYPES.PATIENTS_REPOSITORY) private readonly patientsRepository: IRepository<PatientModel>
    ) {

    }

    @validateDto
    public async createUser(@validDto(CreateUserDto) user: CreateUserDto): Promise<IUser> {
        if (await this.isUserExist(user.email)) {
            throw new UserConfilctError(ErrorMessageEnum.USER_ALLREADY_EXISTS.replace('%s', user.email));
        }
        // Review: on which criteria initial user role is defined?
        // Should user role be set in UserService or AuthService?
        // Should role be set during login or registration?
        // Should user role be passed in req body and, or when creating patient or doctor in their services?
        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        const newUser: IUser = { id: v4(), role: user.role ?? UserRoleEnum.GUEST, ...user };        
        return this.provider.create(newUser);
    }

    private async isUserExist(email: string): Promise<boolean> {
        const users = await this.provider.read();
        return users.some(u => u.email === email);
    }

    public async getAllUsers() {
        return this.provider.read();
    }

    public async getUserById(id: string) {
        const users = await this.provider.read();
        return users.find(u => u.id === id);
    }

    public async getUserByEmail(email: string): Promise<IUser> {
        const users = await this.provider.read();
        return users.find(u => u.email === email);
    }

    public async getUserByResetToken(token: string) {
        const users = await this.provider.read();
        return users.find(u => u?.resetToken === token);
    }

    public async updateUserResetToken(email: string, token: string | null): Promise<IUser> {
        const user = await this.getUserByEmail(email);
        if (!user) {
            return;
        }
        
        user.resetToken = token;
        return this.provider.updateById(user.id, user);
    }    

    @validateDto
    public async updateUserById(id: string, @validDto(UpdateUserDto) userDto: UpdateUserDto) {
        if (!this.isUserExist(userDto.email)) {
            throw new DuplicateEntityError(ErrorMessageEnum.USER_ALLREADY_EXISTS.replace('%s', userDto.email));
        }
        const user = await this.provider.readById(id);
        if (!user) {
            return;
        }
        if (userDto.password) {
            userDto.password = await bcrypt.hash(userDto.password, SALT_ROUNDS);
        }
        merge(user, userDto);
        return this.provider.updateById(user.id, user);
    }

    public async deleteUserById(id: string) {
        const user = this.getUserById(id);
        if (!user) {
            return;
        }
        await this.deleteAssociatedPatients(id);      
        return this.provider.deleteById(id);
    }

    private async deleteAssociatedPatients(id: string) {
        const patients = await this.patientsRepository.getAll();
        const patientsToDelete = patients.filter(p => p.user.id === id);
        const promises = patientsToDelete.map(p => this.patientsRepository.remove(p));
        await Promise.all(promises);
    }
}