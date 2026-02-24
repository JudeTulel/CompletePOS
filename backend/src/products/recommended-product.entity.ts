import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RecommendedProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
