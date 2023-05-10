export interface IRepository<T> {
    add(model: T): Promise<T>;
    getAll(): Promise<T[]>;
    get(id: string): Promise<T | undefined>;
    update(model: T): Promise<T | undefined>;
    remove(model: T): Promise<T | undefined>;
}