import { NextFunction, Router, Request, Response } from "express";
import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import dashboardService from "../../service/company/dashboard-service";
import AuthenticateMidlleware from "../../middlewares/auth-midlleware";
import { QueryTypeDate } from "../../interfaces/i-dashboard/dashbordInput";



class dashboardController {
    public router: Router
    private dashbordInfoService: dashboardService
    constructor() {
        this.router = Router()
        this.dashbordInfoService = new dashboardService()
        this.inicializeRoutes()
    }

    inicializeRoutes() {
        this.router.get('/', AuthenticateMidlleware, this.getDataCompany)
    }

    private getDataCompany = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { initial, final } = req.query
            
            const date = {
                initial,
                final,
            } as QueryTypeDate

            const payloud = this.getCompanyFromRequest(req)
            const result = await this.dashbordInfoService.getAllData(payloud, date)

            res.status(200).json(result)

        } catch (err) {
            next(err)
        }
    }

    private getCompanyFromRequest(req: Request): myJwtPayload {
        return req.user as myJwtPayload
    }
}

const dashboardRoutes = new dashboardController().router

export default dashboardRoutes