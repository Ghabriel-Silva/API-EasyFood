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
        const [
            dashboardProductsSummary,
            allOrdersSummary,
            monthlyOrdersSummary,
            paymentMethodsSummary,
            todayOrdersSummary
        ] = await Promise.all([
            this.productsRepo.dataDashboard(dataToQuery),
            this.getOrderAll(payloud, date),
            this.getOrderMonth(payloud, date),
            this.getMethodPayment(payloud, date),
            this.getDataToday(payloud)
        ])
        return {
            dashboardProductsSummary,
            allOrdersSummary,
            monthlyOrdersSummary,
            paymentMethodsSummary,
            todayOrdersSummary
        }
    }

    //Retorna dados de pedidos do periodo definido, default 30 dias
    getOrderAll = async (payloud: myJwtPayload, data: QueryTypeDate) => {
        const dataToQuery: IDashboardInput = dataUser(payloud, data)
        return await this.orderRepo.getOrderAll(dataToQuery)
    }


    //Retorno dados para o dashbord de pedidos por dia ou mensal se for até 30 dias o retorno sera os pedidos naquele periodo, caso for maior que 30 dias ira retorna o pedidos por mês ex: 01/2026-02/2026
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

        const queryMonthOrDay = await this.orderRepo.getOrderMonth(dataToQueryMonthOrDay)
        const allDates = generateDates(diffDays.start, diffDays.end, groupBy)
        const orderGenereteDay = orderMonthGenerete(allDates, queryMonthOrDay)
        return orderGenereteDay
    }

    //Esse método retorna os métodos de pagamentos, e a quantidade que cada método de pagamento vou utilizado nas vendas
    getMethodPayment = async (payloud: myJwtPayload, date: QueryTypeDate) => {
        const dataToQuery: IDashboardInput = dataUser(payloud, date)
        return await this.orderRepo.getMethodPayment(dataToQuery)
    }


    //Retorna dados Rapidos do dia de Atual 
    getDataToday = async (payloud: myJwtPayload) => {
        const dateT = datesToday()
        const dataToQuery: IDashboardInput = {
            ...payloud,
            initial: dateT.todayStart,
            final: dateT.todayEnd
        }
        return await this.orderRepo.getDataToday(dataToQuery)
    }
}