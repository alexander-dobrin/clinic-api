import { DataSource, Repository } from "typeorm";
import { Token } from "./token";

export class TokenRepository extends Repository<Token> {
    constructor(dataProvider: DataSource) {
		super(Token, dataProvider.createEntityManager());
	}
}