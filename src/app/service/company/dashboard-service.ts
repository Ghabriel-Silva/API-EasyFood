import { Order } from "../../entity/Order";
import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import { dateInfo, QueryTypeDate } from "../../interfaces/i-dashboard/dashbordInput";
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

    getAllData = async (payloud: myJwtPayload, date: QueryTypeDate) => {
        const initial = date?.initial
            ? new Date(`${date.initial}T00:00:00`)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const final = date?.final
            ? new Date(`${date.final}T23:59:59.999`)
            : new Date();

        if (!date?.initial) {
            initial.setHours(0, 0, 0, 0);
        }
        if (!date?.final) {
            final.setHours(23, 59, 59, 999);
        }

        const dataUserAndDate = {
            ...payloud,
            initial,
            final
        }
        const productsData = await this.productsRepo.dataDashboard(dataUserAndDate)
        const orderData = await this.orderRepo.getDataOrderDashbord(dataUserAndDate)

        return {
            productsData,
            orderData
        }
    }

}