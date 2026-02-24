import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { SalesDetail } from './sales-details/sales-details.entity';

@Entity('Sales')
export class Sale {
    @PrimaryGeneratedColumn({ name: 'SaleID' })
    saleId: number;

    @CreateDateColumn({ name: 'SaleDate', type: 'timestamp',})
    saleDate: Date;


    @Column('decimal', { name: 'TotalAmount', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'enum', enum: ['cash', 'mpesa', 'hybrid'], default: 'cash' })
    paymentMethod: string;


    @Column({ nullable: true })
    cashierId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cashAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    mpesaAmount: number;

    @Column({ type: 'varchar', length: 32, nullable: true })
    phone: string;

    @Column({ nullable: true })
    cashRegisterId: number;

    @Column({ type: 'varchar', length: 32, default: 'pending' })
    status: string;

    @OneToMany(() => SalesDetail, detail => detail.sale)
    details: SalesDetail[];

    @CreateDateColumn()
    createdAt: Date;
}