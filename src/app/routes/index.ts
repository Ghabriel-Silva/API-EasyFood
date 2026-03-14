import { Router } from "express";
import userRouter from "../controller/company/auth-controller";
import adminRouter from "../controller/admin/admin-controler";
import productsRoutes from "../controller/company/product-controller";
import orderRouters from "../controller/company/orders-controller";
import categoryRoutes from "../controller/company/category-controller";
import configCompanyRoutes from "../controller/company/config-controler";
import printComande from "../controller/company/print-controller";
import dashboardRoutes from "../controller/company/dashboard-controller";

const routers = Router()

routers.use('/company', userRouter)
routers.use('/admin', adminRouter)
routers.use('/product', productsRoutes)
routers.use('/order', orderRouters )
routers.use('/category', categoryRoutes)
routers.use('/config', configCompanyRoutes)
routers.use('/print', printComande)
routers.use('/dashboard', dashboardRoutes)


export default routers