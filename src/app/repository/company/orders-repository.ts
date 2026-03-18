import { DeepPartial, Repository, In, Like } from "typeorm"
import { AppDataSource } from "../../../database/dataSource"
import { Order, OrderStatus } from "../../entity/Order"
import { CreateOrderSchema } from "../../validations/company/order/create"
import { myJwtPayload } from "../../interfaces/i-auth/i-auth"
import { OrderItem } from "../../entity/OrderItem"
import { Company } from "../../entity/Company"
import { toMoney } from "../../utils/money"
import { Products } from "../../entity/Products"
import { SetStatusSchemaOrder } from "../../validations/company/order/set-status"
import { IFilterOrder, IOrderSetStatus } from "../../interfaces/i-orders/i-orders"
import { FilterOrderSchema } from "../../validations/company/order/filter"
import { IDashboardInput } from "../../interfaces/i-dashboard/dashbordInput"



class orderRepository {
    private orderRepo: Repository<Order>


    constructor() {
        this.orderRepo = AppDataSource.getRepository(Order)
    }

    async createOrder(
        data: CreateOrderSchema,
        company: myJwtPayload,
        sumFreight: number,
        valorTotalFinal: number
    ): Promise<Order | null> {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const newOrder: Order = queryRunner.manager.create(Order, {
                ...data as DeepPartial<Order>,
                totalFreight: sumFreight,
                total: valorTotalFinal,
                company: { id: company.id },
            })

            await queryRunner.manager.save(Order, newOrder)

            // aqui vou criar  os itens do pedido, tenho que esperar o pedido ser gerado pois preciso do id da order 
            const items = data.items.map(item => ({
                quantity: item.quantity,
                subtotal: toMoney(item.quantity * item.price),
                price: item.price,
                order: { id: newOrder.id },
                product: { id: item.product_id },
            }))

            await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(OrderItem)
                .values(items)
                .execute()

            // atualizando  os estoques dos produtos envolvidos
            for (const item of data.items) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Products)
                    .set({ quantity: () => `quantity - ${item.quantity}` }) // desconta direto no banco
                    .where("id = :id", { id: item.product_id })
                    .andWhere("company_id = :company_id", { company_id: company.id })
                    .execute()
            }

            // busco pedido se tudo deu certo
            const orderWithItems = await queryRunner.manager.findOne(Order, {
                where: { id: newOrder.id },
                relations: ["items", "items.product"],
            });

            //  finalizando a transação  
            await queryRunner.commitTransaction();
            return orderWithItems ?? null

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release()
        }
    }


    async getCompanyFreightValue(company: myJwtPayload): Promise<Company | null> {
        return await AppDataSource
            .getRepository(Company)
            .createQueryBuilder('company')
            .select(['company.defaultFreight'])
            .where("company.id = :id", { id: company.id })
            .getOne()
    }

    async existProductid(company: myJwtPayload, productsIds: string[]): Promise<Products[]> {
        return await AppDataSource
            .getRepository(Products)
            .find({
                where: {
                    id: In(productsIds),
                    company: {
                        id: company.id
                    }
                }
            })
    }

    async setStatusOrder(id: string, status: SetStatusSchemaOrder, company: myJwtPayload): Promise<IOrderSetStatus | null> {
        const resultStatus = await this.orderRepo
            .createQueryBuilder()
            .update(Order)
            .set({ status: status.status })
            .where('id = :id', { id })
            .andWhere('status != :status', { status: status.status })
            .andWhere('company_id = :companyId', { companyId: company.id })
            .execute();


        return resultStatus.affected && resultStatus.affected > 0
            ? { id: id, status: status.status }
            : null
    }

    async filterOrder(company: myJwtPayload, validadeFilterOrder: FilterOrderSchema, filterDate: IFilterOrder): Promise<Order[] | null> {

        const query = this.orderRepo
            .createQueryBuilder('order') //Pega todos pedidos da compania
            .leftJoinAndSelect("order.items", "items")  //{order.items = items}
            .leftJoinAndSelect("items.product", "product") //{order.items.products }
            .leftJoin('order.company', "company")
            .orderBy('order.created_at', 'DESC')

        if (company.id) {
            query.andWhere("company.id = :companyId", {
                companyId: company.id
            })
        }
        //filtra pelo meio de pagamento
        if (validadeFilterOrder.paymentMethod && validadeFilterOrder.paymentMethod.length > 0) {
            query.andWhere("order.paymentMethod IN (:...paymentMethod)", {
                paymentMethod: validadeFilterOrder.paymentMethod
            })
        }
        //Filtra pelas o status do pedido
        if (validadeFilterOrder.status && validadeFilterOrder.status.length > 0) {
            query.andWhere("order.status IN (:...statusList)", {
                statusList: validadeFilterOrder.status
            })
        }
        //filtra pelo nome do cliente
        if (validadeFilterOrder.clientName) {
            query.andWhere("LOWER(order.customerName) LIKE LOWER(:clientName)", {
                clientName: `%${validadeFilterOrder.clientName}%`
            })
        }

        //Pega pela data
        if (filterDate.start && filterDate.end) {
            query.andWhere("order.created_at BETWEEN :start AND :end", { start: filterDate.start, end: filterDate.end });
        } else if (filterDate.start) {
            query.andWhere("order.created_at BETWEEN :start AND :end", { start: filterDate.start, end: filterDate.end });
        }

        const orderFilter: Order[] = await query.getMany()

        if (orderFilter.length === 0) {
            return null
        }
        return orderFilter
    }

    async printOrderId(orderId: string, idCompany: myJwtPayload): Promise<Order | null> {
        return this.orderRepo.findOne({
            where: {
                id: orderId,
                company: {
                    id: idCompany.id
                }
            },
            relations: [
                'company',
                'items',
                'items.product'

            ]
        })
    }

    async getDataOrderDashbord(Data: IDashboardInput) {
        //Insight do dia atual idependente se vier ou não com data 
        //Total de pedido Do dia
        //Lucro total de todos o periodo
        //valor total de Hoje
        //Pedidos completos
        //Pedidos cancelados
        //Pedidos em rota
        //Peidos preparando 

        try {
            const startOfDay = new Date()
            startOfDay.setHours(0, 0, 0, 0)
            const finalOfDay = new Date()
            finalOfDay.setHours(23, 59, 59, 999)

            const [kipsOrderToday] = await Promise.all([
                this.orderRepo
                    .createQueryBuilder("order")
                    .select("SUM(order.total)", "totalMoneyDay")
                    // .addSelect("COUNT(order.)", "totalOrderDay")
                    .innerJoin("order.company", "company")
                    .where("company.id = :id", { id: Data.id })
                    .andWhere("order.created_at BETWEEN :start AND :end", {
                        start:startOfDay, 
                        end:finalOfDay
                    })
                    .getRawOne()
            ],
            )
            return {
               kipsOrderToday
            }

        } catch (err) {
            console.log(err)
        }




        //todas query com base na data expecificada, se n definir pega sempre 30 dias antes 
        //Numeros de pedidos criados
        //Numero de pedidos cancelados 
        //Numero de pedidos Pendente
        //Numero de pedido Concluidos
        //numero de pedido em rota
        //Dia que teve mais pedios, "Aqui Conta todo o periodo"
        // Horário que mais Sai pedidos conta o periodo o por default 30 dias antes
        //Método de pagamento mais utilizados separar do maior para o menor 

    }


}

export default orderRepository