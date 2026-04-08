import { Request, Response, Router } from "express";
import { PrintService } from "../../service/print/print-service";
import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import AuthenticateMidlleware from "../../middlewares/auth-midlleware";

class PrintController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.inicializedRoutes();
    }

    inicializedRoutes() {
        this.router.get('/reports/:type', AuthenticateMidlleware, this.printReport);
        this.router.get('/:orderId', AuthenticateMidlleware, this.print);
    }

    // ✅ COMANDA (pedido)
    print = async (req: Request, res: Response) => {
        const { orderId } = req.params;
        const idCompany = this.getCompanyFromRequest(req);

        const printService = new PrintService();

        const html: string = await printService.gerarComanda(orderId, idCompany);

        res
            .status(200)
            .set('Content-Type', 'text/html')
            .send(html);
    }

    printReport = async (req: Request, res: Response) => {
        try {
            const { type } = req.params;
            const { initial, final } = req.query;

            const idCompany = req.user as myJwtPayload;

            const printService = new PrintService();

            const html = await printService.gerarRelatorio(
                type,
                idCompany,
                { initial, final }
            );

            const pdf = await printService.gerarPDF(html);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=relatorio.pdf'
            });

            return res.send(pdf);

        } catch (error: any) {
            return res.status(error.status || 500).json({
                message: error.message
            });
        }
    }
    private getCompanyFromRequest(req: Request): myJwtPayload {
        return req.user as myJwtPayload;
    }
}

const printComande = new PrintController().router;
export default printComande;