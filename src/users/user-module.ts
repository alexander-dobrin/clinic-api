import { ContainerModule } from "inversify";
import { IUser } from "./user-interface";
import { CONTAINER_TYPES } from "../common/constants";
import FileDataProvider from "../common/providers/file-data-provider";
import { resolve } from "path";
import { IDataProvider } from "../common/types";
import UserService from "./user-service";

export const userModule = new ContainerModule(bind => {
    bind<UserService>(CONTAINER_TYPES.USER_SERVICE).to(UserService);
    bind<IDataProvider<IUser>>(CONTAINER_TYPES.USER_DATA_PROVIDER)
        .toDynamicValue(_ => new FileDataProvider(resolve('assets', 'users.json')))
        .inSingletonScope();
});