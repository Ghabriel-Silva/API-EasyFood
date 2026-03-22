import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import { IDataToQueryGetMonthOrder, IDashboardInput, QueryTypeDate, DatesReturn } from "../../interfaces/i-dashboard/dashbordInput";
import orderRepository from "../../repository/company/orders-repository";
import { ProductRepository } from "../../repository/company/product-repository";
import { dataUser } from "../../utils/dashboard/dataUser";
import { datesToday } from "../../utils/dashboard/datesToday";
import { diffBetweenDates } from "../../utils/dashboard/diffBetweenDates";
import { generateDates } from "../../utils/dashboard/genereateDates";
import { orderMonthGenerete } from "../../utils/dashboard/orderMonthGenerete";


export default class dashboardService {
    private orderRepo: orderRepository
    private productsRepo: ProductRepository


    constructor() {
        this.orderRepo = new orderRepository(),
            this.productsRepo = new ProductRepository()

    }


    getAllData = async (payloud: myJwtPayload, date: QueryTypeDate) => {
        const dataToQuery: IDashboardInput = dataUser(payloud, date)

        const [productsData, orderData, orderMonth, orderMethodPayment, orderDataToday] = await Promise.all([
            this.productsRepo.dataDashboard(dataToQuery),

            this.orderRepo.getDataOrderDashbord(dataToQuery),
            this.getOrderMonth(payloud, date),
            this.getMethodPayment(payloud, date),
            this.getDataToday(payloud)
        ])
        return {
            productsData,
            orderData,
            orderMonth,
            orderMethodPayment, 
            orderDataToday
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

    //Metodo responsavel por Retornar os metodos de pagamento
    getMethodPayment = async (payloud: myJwtPayload, date: QueryTypeDate) => {
        const dataToQuery: IDashboardInput = dataUser(payloud, date)

        const methods = await this.orderRepo.methodoPaymente(dataToQuery)

        return methods

    }


    //Retorna dados Rapidos do dia de Atual  apenas
    getDataToday = async (payloud: myJwtPayload) => {
        const dateT = datesToday()

        const dataToQuery:IDashboardInput = {
            ...payloud, 
            initial:dateT.todayStart, 
            final:dateT.todayEnd
        }

        const orderToday = await this.orderRepo.kipsOrderToday(dataToQuery)

        return orderToday
    }

}