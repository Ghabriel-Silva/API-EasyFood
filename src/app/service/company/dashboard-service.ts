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
        const dataUserAndDate = {
            ...payloud,
            ...date
        }
        const productsData = await this.productsRepo.dataDashboard(dataUserAndDate)
        
        console.log(productsData)
        return productsData
    }

}