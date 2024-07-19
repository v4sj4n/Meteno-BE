import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: null })
  bio: string;

  @Column({
    default:
      'https://qjwzovkhzxhfpfgytfgv.supabase.co/storage/v1/object/public/meteno/userImage/default.jpg',
  })
  imageUrl?: string;
}
