import { NextFunction, Request, Response, Router } from "express";

export interface IDataProvider<TModel> {
    create(model: TModel): Promise<TModel>;

    read(): Promise<TModel[]>;

    readById(id: string): Promise<TModel | undefined>;

    updateById(id: string, data: TModel): Promise<TModel | undefined>;

    deleteById(id: string): Promise<TModel | undefined>;
}

export interface IFindable {
    id: string;
}

export interface IGetOptions {
    sortBy: string;
}

export interface IHttpController {
    get(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    post(req: Request, res: Response, next: NextFunction): Promise<void>;
    put(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IRepository<T> {
    add(model: T): Promise<T>;
    getAll(): Promise<T[]>;
    get(id: string): Promise<T | undefined>;
    update(model: T): Promise<T | undefined>;
    remove(model: T): Promise<T | undefined>;
}

export interface IRoutes {
    get router(): Router;
}