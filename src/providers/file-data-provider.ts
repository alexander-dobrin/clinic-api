import IDataProvider from "./abstract/data-provider-interface";
import { readFile, writeFile } from "fs/promises";
import IFindable from "./abstract/findable-interface";

export default class FileDataProvider<TModel extends IFindable> implements IDataProvider<TModel> {
    private readonly filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public async create(model: TModel): Promise<TModel> {
        const models = await this.read();
        models.push(model);
        const json = JSON.stringify(models);
        await writeFile(this.filePath, json);
        return model;
    }

    public async read(): Promise<TModel[]> {
        const json = await readFile(this.filePath, { encoding: "utf-8" });
        return JSON.parse(json);
    }

    public async readById(id: string): Promise<TModel | undefined> {
        const model = await this.read();
        return this.findById(id, model);
    }

    public async updateById(id: string, data: TModel): Promise<TModel | undefined> {
        const models = await this.read();
        const modelIdx = await this.findIndexById(id, models);
        if (modelIdx < 0) {
            return;
        }
        Object.assign(models[modelIdx], data);
        const json = JSON.stringify(models);
        await writeFile(this.filePath, json);
        return models[modelIdx];
    }

    public async deleteById(id: string): Promise<TModel | undefined> {
        const models = await this.read();
        const model = this.findById(id, models);
        if (!model) {
            return;
        }
        const remaining = models.filter((item) => item.id !== id);
        const json = JSON.stringify(remaining);
        await writeFile(this.filePath, json);
        return model;

    }
    
    private async findById(id: string, data: TModel[]): Promise<TModel | undefined> {
        const result = data.find(item => item.id === id);
        return result;
    }

    private async findIndexById(id: string, data: TModel[]): Promise<number> {
        const result = data.findIndex(item => item.id === id);
        return result;
    }
}