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
import { DatesReturn, IDashboardInput, IDataToQueryGetMonthOrder } from "../../interfaces/i-dashboard/dashbordInput"
import ErrorExtension from "../../utils/error-extension"

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

    //Essa consulta irá retorna o pedidos do mês, caso a consulta for maior que 30 dias ela retornara pedidos por mês, 
    async orderMonthQuery(data: IDataToQueryGetMonthOrder): Promise<DatesReturn[]> {

        return await this.orderRepo
            .createQueryBuilder("order")
            .select(
                data.groupBy === "day"
                    ? "DATE(order.created_at)"
                    : "DATE_FORMAT(order.created_at, '%Y-%m')",
                "date"
            )
            .addSelect("COUNT(order.id)", "total")
            .innerJoin("order.company", "company")
            .where("company.id = :id", { id: data.id })
            .andWhere("order.created_at >= :start AND order.created_at < :end", {
                start: data.start,
                end: data.end
            })
            .groupBy("date")
            .orderBy("date", "ASC")
            .getRawMany()
    }

    async getDataOrderDashbord(Data: IDashboardInput) {
        try {
            const startOfDay = new Date()
            startOfDay.setHours(0, 0, 0, 0)
            const finalOfDay = new Date()
            finalOfDay.setHours(23, 59, 59, 999)

            //Seleciona status e informe como Todas de pedidos dia e valor total dos pedidos completos
            const [kipsOrderToday, kipsOrderAll, methodoPaymente] = await Promise.all([
                this.orderRepo
                    .createQueryBuilder("order")
                    .select("SUM(CASE WHEN order.status = 'Completo' THEN order.total ELSE 0 END)", "totalMoney")
                    .addSelect("COUNT(order.id)", "totalOrder")
                    .addSelect("SUM(CASE WHEN order.status = 'Completo' THEN 1 ELSE 0 END )", "OrderCompleted")
                    .addSelect("SUM(CASE WHEN order.status = 'Preparando' THEN 1 ELSE 0 END )", "OrderPreparing")
                    .addSelect("SUM(CASE WHEN order.status = 'Pendente' THEN 1 ELSE 0 END )", "OrderPending ")
                    .addSelect("SUM(CASE WHEN order.status = 'Cancelado' THEN 1 ELSE 0 END )", "OrderCancelled")
                    .innerJoin("order.company", "company")
                    .where("company.id = :id", { id: Data.id })
                    .andWhere("order.created_at BETWEEN :start AND :end", {
                        start: startOfDay,
                        end: finalOfDay
                    })
                    .getRawOne(),

                //Seleciona todos status de pedido porem no periodo defino
                this.orderRepo
                    .createQueryBuilder('order')
                    .select("SUM(CASE WHEN order.status = 'Completo' THEN order.total ELSE 0 END)", "totalMoney")
                    .addSelect("SUM(CASE WHEN order.status = 'Completo' THEN 1 ELSE 0 END )", "OrderCompleted")
                    .addSelect("SUM(CASE WHEN order.status = 'Preparando' THEN 1 ELSE 0 END )", "OrderPreparing")
                    .addSelect("SUM(CASE WHEN order.status = 'Pendente' THEN 1 ELSE 0 END )", "OrderPending ")
                    .addSelect("SUM(CASE WHEN order.status = 'Cancelado' THEN 1 ELSE 0 END )", "OrderCancelled")
                    .innerJoin("order.company", "company")
                    .where("company.id = :id", { id: Data.id })
                    .andWhere("order.created_at BETWEEN :start AND :end", {
                        start: Data.initial,
                        end: Data.final
                    })
                    .getRawOne(),

                //Seleciona metodo de pagamento e a quantidade 
                this.orderRepo
                    .createQueryBuilder("order")
                    .select("order.paymentMethod", "method")
                    .addSelect("COUNT(order.paymentMethod)", "quantity")
                    .innerJoin("order.company", "company")
                    .where("company.id = :id", { id: Data.id })
                    .andWhere("order.created_at BETWEEN :start AND :end", {
                        start: Data.initial,
                        end: Data.final
                    })
                    .groupBy("method")
                    .orderBy("quantity", "DESC")
                    .getRawMany(),

            ],
            )

            return {
                kipsOrderToday,
                kipsOrderAll,
                methodoPaymente,
            }

        } catch (err) {
            throw new ErrorExtension(500, "Erro ao processar dados do dashboard");
        }
    }


}

export default orderRepository