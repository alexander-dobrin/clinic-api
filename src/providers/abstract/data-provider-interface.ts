export default interface IDataProvider<TModel> {
    create(model: TModel): Promise<TModel>;

    read(): Promise<TModel[]>;

    readById(id: string): Promise<TModel | undefined>;

    updateById(id: string, data: TModel): Promise<TModel | undefined>;

    deleteById(id: string): Promise<TModel | undefined>;
}