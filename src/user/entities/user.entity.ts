import { BaseEntity, BeforeInsert, Column, Entity,  PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';


@Entity('users')
export class User extends BaseEntity{

    @PrimaryGeneratedColumn()
    id:string;
    
    @Column()
    username:string;
    
    @Column({unique:true})
    email:string;
    
    @Column()
    @Exclude({ toPlainOnly: true })
    password:string;

    @Column('bool')
    is_buyer: boolean;

    @Column('bool')
    is_seller: boolean;

    @Column({nullable: true})
    account_id: string;
    
    @Column({nullable: true})
    customer_id: string;

    @BeforeInsert()
    hashPassword() {
        const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
        this.password = bcrypt.hashSync(this.password, salt);
    }

}
