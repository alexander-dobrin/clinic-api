import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserModel {
    @PrimaryGeneratedColumn()
    public id: number;
}
