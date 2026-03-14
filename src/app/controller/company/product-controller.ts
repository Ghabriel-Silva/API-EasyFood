import { Response, Request, NextFunction, Router } from "express";
import AuthenticateMidlleware from "../../middlewares/auth-midlleware";
import ProductService from "../../service/company/product-service";
import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import { SuccessResponse } from "../../utils/success-response";
import { listSchema, listSchemaProducts } from "../../validations/company/product/List";
import { setStatus } from "../../validations/company/product/set-status";
import { IProductOutput, IProductsReturn } from "../../interfaces/i-product/i-product";
import { Schema } from "yup";

class ProductController {
    public router: Router
    private productService: ProductService

    constructor() {
        this.router = Router()
        this.incializeRoutes()
        this.productService = new ProductService()
    }

    private incializeRoutes() {
        this.router.get('/', AuthenticateMidlleware, this.listProduct)
        this.router.post('/', AuthenticateMidlleware, this.createProduct)
        this.router.put('/:id', AuthenticateMidlleware, this.updateProduct)
        this.router.patch('/:id/status', AuthenticateMidlleware, this.setStatusProduct)
    }

    private createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = this.getCompanyFromRequest(req)
            const result = await this.productService.createProduct(req.body, user)

            res.status(200).json(
                SuccessResponse(result, null, undefined, "create", "Produto")
            )
        } catch (err) {
            next(err)
        }
    }
    private updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            const payloudCompany: myJwtPayload = this.getCompanyFromRequest(req)
            const result = await this.productService.updateProduct(id, payloudCompany, req.body)

            res.status(200).json(
                SuccessResponse(result, null, undefined, "update", "Produto")
            )
        } catch (err) {
            next(err)
        }
    }

    private setStatusProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            const payloudCompany: myJwtPayload = this.getCompanyFromRequest(req)
            const setStatus: setStatus = req.body


            const result = await this.productService.setStatusProducts(id, payloudCompany, setStatus)

            res.status(200).json(
                SuccessResponse(result, null, `Produto atulizado status: isAvailable ${result?.isAvailable}`)
            )
        } catch (err) {
            next(err)
        }
    }

    private listProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payloud: myJwtPayload = this.getCompanyFromRequest(req)

            const filter = req.query

            const result: IProductsReturn | null = await this.productService.listProduct(payloud, filter)

            if (!result?.data || result.data.length === 0) {
                return res.status(200).json(
                    SuccessResponse(
                        result?.data ?? [],
                        false,
                        'Nenhum produto encontrado'
                    )
                )
            }

            res.status(200).json(
                SuccessResponse(
                    {
                        products: result.data,
                        frete: result.frete,
                        fromCache: result.fromCache,
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                        totalPages: result.totalPages,

                    },
                    undefined,
                    "Produtos encontrados com sucesso",
                )
            )



        } catch (err) {
            next(err)
        }
    }



    private getCompanyFromRequest(req: Request): myJwtPayload {
        return req.user as myJwtPayload
    }
}

const productsRoutes = new ProductController().router
export default productsRoutes