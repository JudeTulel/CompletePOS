import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'suppliers' })
export class Supplier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 150, nullable: true })
    contactPerson: string;

    @Column({ length: 100, nullable: true })
    email: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ length: 200, nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    location: string;

    @Column({  nullable: true, default: 0 })
   balance: Number;

    @Column({ default: true })
    isActive: boolean;
}