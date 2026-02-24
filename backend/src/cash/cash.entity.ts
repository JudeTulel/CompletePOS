import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Cash {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  opening: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  closing: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cashin: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  change: number;

  @CreateDateColumn()
  createdAt: Date;
}
