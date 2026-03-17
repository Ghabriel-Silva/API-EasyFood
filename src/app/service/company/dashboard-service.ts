import { Order } from "../../entity/Order";
import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import { dateInfo } from "../../interfaces/i-dashboard/dashbordInput";
import categoryRepository from "../../repository/company/category-repository";
import orderItemRepository from "../../repository/company/order-item-repository";
import orderRepository from "../../repository/company/orders-repository";
import { ProductRepository } from "../../repository/company/product-repository";


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

    getAllData = async (payloud: myJwtPayload, date: dateInfo) => {
        console.log('date:', date)
        const initial = date?.initial
            ? new Date(date.initial)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        console.log(initial)

        const final = date?.final
            ? new Date(date.final)
            : new Date()

        initial.setHours(0, 0, 0, 0)
        final.setHours(23, 59, 59, 999)
        
        const dataUserAndDate = {
            ...payloud,
            initial,
            final
        }

        const productsData = await this.productsRepo.dataDashboard(dataUserAndDate)


        return productsData
    }

}