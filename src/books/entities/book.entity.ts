import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  author: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('bool', { default: false })
  isSold: boolean;

  @Column('text', { nullable: true })
  soldTo: string; // ID del usuario que compró
}
