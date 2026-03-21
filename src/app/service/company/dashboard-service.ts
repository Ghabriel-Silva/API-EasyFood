import { Order } from "../../entity/Order";
import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import { IDataToQueryGetMonthOrder, IDashboardInput, QueryTypeDate, DatesReturn } from "../../interfaces/i-dashboard/dashbordInput";
import categoryRepository from "../../repository/company/category-repository";
import orderItemRepository from "../../repository/company/order-item-repository";
import orderRepository from "../../repository/company/orders-repository";
import { ProductRepository } from "../../repository/company/product-repository";
import { dataUser } from "../../utils/dashboard/dataUser";
import { diffBetweenDates } from "../../utils/dashboard/diffBetweenDates";
import { generateDates } from "../../utils/dashboard/genereateDates";
import { orderMonthGenerete } from "../../utils/dashboard/orderMonthGenerete";


export default class dashboardService {
    private orderRepo: orderRepository
    private categoryRepo: categoryRepository
    private productsRepo: ProductRepository
    private orderItemRepo: orderItemRepository

    constructor() {
        this.orderRepo = new orderRepository(),
            this.categoryRepo = new categoryRepository(),
            this.productsRepo = new ProductRepository(),
            this.orderItemRepo = new orderItemRepository()
    }


    getAllData = async (payloud: myJwtPayload, date: QueryTypeDate) => {
        const dataToQuery: IDashboardInput = dataUser(payloud, date)

        const [productsData, orderData, dadosC] = await Promise.all([
            this.productsRepo.dataDashboard(dataToQuery),
            this.orderRepo.getDataOrderDashbord(dataToQuery),
            this.getOrderMonth(payloud, date)
        ])

        return {
            productsData,
            orderData,
            dadosC
        }
    }



    getOrderMonth = async (payloud: myJwtPayload, data: QueryTypeDate): Promise<DatesReturn[]> => {
        //aqui retorno o objeto contendo a datas inicial final centralizadas e fallback caso n envie o retorno da data incial sera 30 dias antes, pego o payloud aqui também
        const dataToQuery: IDashboardInput = dataUser(payloud, data)

        const diffDays = diffBetweenDates(dataToQuery.initial, dataToQuery.final)
     
        const groupBy = diffDays.diffDays <= 30 ? "day" : "month"

        //Retornando  o objeto completo para o repository
        const dataToQueryMonthOrDay: IDataToQueryGetMonthOrder = {
            ...dataToQuery,
            ...diffDays,
            groupBy
        }
     
        const queryMonthOrDay = await this.orderRepo.orderMonthQuery(dataToQueryMonthOrDay)
    
        const allDates = generateDates(diffDays.start, diffDays.end, groupBy)
    
        const orderGenereteDay = orderMonthGenerete(allDates, queryMonthOrDay)
    
       
        return orderGenereteDay
    }

}