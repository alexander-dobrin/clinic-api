import { ErrorMessageEnum } from "../enums";
import { InvalidParameterError } from "../errors";
import { IFilterParam, IQueryParams, ISortParam } from "../types";
import { Request, Response, NextFunction } from 'express';

export class QueryMapperMiddleware {
    public map(req: Request, res: Response, next: NextFunction): void {
        try {
            const mappedQuery: IQueryParams = {};

            if (req.query.filterBy) {
                mappedQuery.filterBy = this.mapFilterParams(req.query.filterBy)
            }
            if (req.query.sortBy) {
                mappedQuery.sortBy = this.mapSortParams(req.query.sortBy as (string | string[]), req.query.order as string)
            }

            Object.assign(req.query, mappedQuery);
            next();
        } catch (err) {
            next(err);
        }
    }

    private mapSortParams(sortBy: string | string[], order?: string): ISortParam[] {
        order ??= 'asc';

        if (Array.isArray(sortBy)) {
            return sortBy.map(sortParam => ({ field: sortParam, order }));
        } else {
            return [{ field: sortBy, order }];
        }
    }

    private mapFilterParams(filterBy: any): IFilterParam[] {
        if (Array.isArray(filterBy)) {
            return filterBy.map(this.parseFilterParam);
        }
        return [this.parseFilterParam(filterBy)];
    }

    private parseFilterParam(param: string): IFilterParam {
        const [field, value] = param.split(':');

        if (value == undefined) {
            throw new InvalidParameterError(ErrorMessageEnum.INVALID_FILTER_PARAMETER.replace('%s', param));
        }

        return { field, value };
    }
}