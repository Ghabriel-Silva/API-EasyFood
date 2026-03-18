import "reflect-metadata"
import { DataSource } from "typeorm"
import { Company } from "../app/entity/Company"
import { Category } from "../app/entity/Category"
import { Order } from "../app/entity/Order"
import { OrderItem } from "../app/entity/OrderItem"
import { Products } from "../app/entity/Products"
import dotenv from "dotenv"
dotenv.config()

import { GenerateAllTables1760965347778 } from '../database/migrations/1760965347778-GenerateAllTables'
import { EditeTablesCompanyOrder1762120085785 } from '../database/migrations/1762120085785-EditeTablesCompanyOrder'
import { AddCollumOrderItem1762491862341 } from '../database/migrations/1762491862341-AddCollumOrderItem'
import { AddColumnCategory1763381016818 } from '../database/migrations/1763381016818-AddColumnCategory'
import { CreateCollunToOrder1765649217086 } from '../database/migrations/1765649217086-CreateCollunToOrder'
import { CreateColumnsUniAndDeleivery1766270516114 } from '../database/migrations/1766270516114-CreateColumnsUniAndDeleivery'
import { CreateColumCategory1768401103923 } from '../database/migrations/1768401103923-CreateColumCategory'
import { AlterColunmQuantidadeItem1768663897382 } from '../database/migrations/1768663897382-AlterColunmQuantidadeItem'
import {AlterColunmQuantity1772232083432 } from '../database/migrations/1772232083432-AlterColunmQuantity'
import { AddColunmToCompany1773409963988} from '../database/migrations/1773409963988-AddColunmToCompany'




export const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    cache:false,
    logging: false,
    entities: [Company, Category, Products, Order, OrderItem],
    migrations: [
        GenerateAllTables1760965347778,
        EditeTablesCompanyOrder1762120085785,
        AddCollumOrderItem1762491862341,
        AddColumnCategory1763381016818,
        CreateCollunToOrder1765649217086,
        CreateColumnsUniAndDeleivery1766270516114, //Criando coluna de unidade de medida e delivery
        CreateColumCategory1768401103923,
        AlterColunmQuantidadeItem1768663897382, 
        AlterColunmQuantity1772232083432, //ALtera o valor aceitado na coluna quantidade para decimal
         AddColunmToCompany1773409963988 //Add coluna telefone e endereço 
    ],
    subscribers: [],
})
