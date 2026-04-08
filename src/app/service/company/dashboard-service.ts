import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import { IDataToQueryGetMonthOrder, IDashboardInput, QueryTypeDate, DatesReturn } from "../../interfaces/i-dashboard/dashbordInput";
import orderRepository from "../../repository/company/orders-repository";
import { ProductRepository } from "../../repository/company/product-repository";
import { dataUser } from "../../utils/dashboard/dataUser";
import { datesToday } from "../../utils/dashboard/datesToday";
import { diffBetweenDates } from "../../utils/dashboard/diffBetweenDates";
import { generateDates } from "../../utils/dashboard/genereateDates";
import { orderMonthGenerete } from "../../utils/dashboard/orderMonthGenerete";
import ErrorExtension from "../../utils/error-extension";
import { dashboardDateSchema, dashboardDateType } from "../../validations/company/dashbord/filter";
import * as yup from "yup";


export default class dashboardService {
    private orderRepo: orderRepository
    private productsRepo: ProductRepository


    constructor() {
        this.orderRepo = new orderRepository(),
            this.productsRepo = new ProductRepository()

    }


    getAllData = async (payloud: myJwtPayload, date: QueryTypeDate) => {
        try {
            console.log(date)
            const validadeDate = await dashboardDateSchema.validate(date, {
                abortEarly: false
            })

            const formatToString = (d: Date | null | undefined): string | undefined => {
                if (!d || isNaN(d.getTime())) return undefined
                return d.toISOString().split('T')[0]
            }

            const dateStringFormat = {
                initial: formatToString(validadeDate.initial),
                final: formatToString(validadeDate.final)
            }

            const dataToQuery: IDashboardInput = dataUser(payloud, dateStringFormat)

            const [
                dashboardProductsSummary,
                allOrdersSummary,
                monthlyOrdersSummary,
                paymentMethodsSummary,
                todayOrdersSummary
            ] = await Promise.all([
                this.productsRepo.dataDashboard(dataToQuery),
                this.getOrderAll(payloud, dateStringFormat),
                this.getOrderMonth(payloud, dateStringFormat),
                this.getMethodPayment(payloud, dateStringFormat),
                this.getDataToday(payloud)
            ])
            return {
                dashboardProductsSummary,
                allOrdersSummary,
                monthlyOrdersSummary,
                paymentMethodsSummary,
                todayOrdersSummary
            }
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                throw new ErrorExtension(400, err.errors.join(","));
            }
            throw err;
        }
    }

    getOrderAll = async (payloud: myJwtPayload, data: QueryTypeDate) => {
        try {
            const dataToQuery: IDashboardInput = dataUser(payloud, data)
            return await this.orderRepo.getOrderAll(dataToQuery)
        } catch (error) {
            throw new ErrorExtension(500, 'Erro ao buscar pedidos do período')
        }
    }

    getOrderMonth = async (payloud: myJwtPayload, data: QueryTypeDate): Promise<DatesReturn[]> => {
        try {
            const dataToQuery: IDashboardInput = dataUser(payloud, data)
            const diffDays = diffBetweenDates(dataToQuery.initial, dataToQuery.final)
            const groupBy = diffDays.diffDays <= 30 ? "day" : "month"
            const dataToQueryMonthOrDay: IDataToQueryGetMonthOrder = {
                ...dataToQuery,
                ...diffDays,
                groupBy
            }
            const queryMonthOrDay = await this.orderRepo.getOrderMonth(dataToQueryMonthOrDay)
            const allDates = generateDates(diffDays.start, diffDays.end, groupBy)
            return orderMonthGenerete(allDates, queryMonthOrDay)
        } catch (error) {
            throw new ErrorExtension(500, 'Erro ao buscar pedidos por período/mês')
        }
    }

    getMethodPayment = async (payloud: myJwtPayload, date: QueryTypeDate) => {
        try {
            const dataToQuery: IDashboardInput = dataUser(payloud, date)
            return await this.orderRepo.getMethodPayment(dataToQuery)
        } catch (error) {
            throw new ErrorExtension(500, 'Erro ao buscar métodos de pagamento')
        }
    }

    getDataToday = async (payloud: myJwtPayload) => {
        try {
            const dateT = datesToday()
            const dataToQuery: IDashboardInput = {
                ...payloud,
                initial: dateT.todayStart,
                final: dateT.todayEnd
            }
            return await this.orderRepo.getDataToday(dataToQuery)
        } catch (error) {
            throw new ErrorExtension(500, 'Erro ao buscar dados de hoje')
        }
    }
}