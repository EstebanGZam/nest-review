import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Crea la tabla en la DB
@Entity('users')
export class User {
  // UUID como PK
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  firstName: string;

  @Column('text', { unique: true })
  email: string;

  // No se devuelve por defecto (seguridad)
  @Column('text', { select: false })
  password: string;

  // Array de roles (ej: ['user', 'admin'])
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @Column('bool', { default: true })
  isActive: boolean;
}
