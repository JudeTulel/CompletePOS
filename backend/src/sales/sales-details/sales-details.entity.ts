import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from '../sales.entity'; // Adjust path as needed
import { Product } from '../../products/products.entity';
@Entity('sales_details')
export class SalesDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=> Sale,{ onDelete: 'CASCADE' ,eager: true})
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('decimal', { precision: 12, scale: 2 })
    total: number;
}
