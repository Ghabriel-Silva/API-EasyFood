import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import orderRepository from '../../repository/company/orders-repository'
import { Order } from '../../entity/Order'
import ErrorExtension from '../../utils/error-extension'
import { myJwtPayload } from '../../interfaces/i-auth/i-auth'
import dashboardService from '../company/dashboard-service'

import puppeteer from 'puppeteer'

export class PrintService {
    private orderRepo: orderRepository

    constructor() {
        this.orderRepo = new orderRepository()
        this.registerHelpers() // 👈 REGISTRA UMA VEZ SÓ
    }




    // ✅ HELPERS CENTRALIZADOS
    private registerHelpers() {
        if (!Handlebars.helpers.formatCurrency) {
            Handlebars.registerHelper('formatCurrency', (value: number) => {
                return Number(value).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });
            });
        }

        if (!Handlebars.helpers.formatDate) {
            Handlebars.registerHelper('formatDate', (date: string) => {
                return new Date(date).toLocaleString('pt-BR');
            });
        }
    }

    async gerarPDF(html: string): Promise<Buffer> {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        const pdfUint8 = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true
        });

        await browser.close();

        return Buffer.from(pdfUint8);
    }


    async gerarComanda(orderId: string, idCompany: myJwtPayload): Promise<string> {
        const order: Order | null = await this.orderRepo.printOrderId(orderId, idCompany)

        if (!order) {
            throw new ErrorExtension(404, 'Pedido não encontrado')
        }

        const templatePath = path.join(
            process.cwd(),
            'src',
            'app',
            'service',
            'print',
            'templates',
            'comanda.hbs'
        )

        const source = fs.readFileSync(templatePath, 'utf-8')
        const template = Handlebars.compile(source)

        const printData = {
            id: order.id.slice(0, 4),
            company: order.company.name,

            mesa: order.delivery_method === 'dine_in'
                ? 'Mesa 01'
                : '—',

            createdAt: order.created_at.toLocaleString('pt-BR'),
            status: order.status,
            pagamento: order.paymentMethod,

            cliente: order.customerName ?? '—',
            telefone: order.customerPhone ?? '—',
            endereco: order.customerAddress ?? '—',
            observacoes: order.observations ?? '',

            itens: order.items.map(item => {
                const precoUnitario = Number(item.price)
                const qtd = item.quantity

                return {
                    qtd,
                    nome: item.product.name,
                    totalItem: precoUnitario * qtd
                }
            }),

            frete: Number(order.totalFreight),
            adicional: Number(order.additionalValue ?? 0),
            desconto: Number(order.discountValue ?? 0),
            total: Number(order.total)
        }

        return template(printData)
    }

    async gerarRelatorio(
        tipo: string,
        idCompany: myJwtPayload,
        date: { initial?: any; final?: any }
    ): Promise<string> {


        const templatePath = path.join(
            process.cwd(),
            'src', 'app', 'service', 'print', 'templates', 'resumo-geral.hbs',
        );

        const dashboardServiceMap = new dashboardService();

        const data = await dashboardServiceMap.getAllData(idCompany, date);

        const printData = {
            empresa: idCompany.name || "Minha Empresa",
            dataEmissao: new Date().toLocaleString('pt-BR'),

            produtos: {
                total: Number(data.dashboardProductsSummary.kipsProducts.total),
                ativos: Number(data.dashboardProductsSummary.kipsProducts.active),
                inativos: Number(data.dashboardProductsSummary.kipsProducts.inactive),
                negativos: Number(data.dashboardProductsSummary.kipsProducts.negative_quantity),
            },

            financeiro: {
                total: Number(data.allOrdersSummary.totalMoney),
                pedidosFinalizados: Number(data.allOrdersSummary.orderCompleted),
                pedidosPendentes: Number(data.allOrdersSummary.orderPending),
                cancelados: Number(data.allOrdersSummary.orderCancelled),
            },

            pagamentos: data.paymentMethodsSummary.map((p: any) => ({
                metodo: p.method,
                quantidade: Number(p.quantity)
            })),

            topProdutos: data.dashboardProductsSummary.topProducts.map((p: any) => ({
                nome: p.name,
                total: Number(p.totalSold)
            })),

            produtosZerados: data.dashboardProductsSummary.quantityZeroProducts.map((p: any) => ({
                nome: p.name,
                quantidade: Number(p.quantity)
            })),

            pedidosPorDia: data.monthlyOrdersSummary.map((d: any) => ({
                data: d.date,
                total: d.total
            }))
        };

        const source = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(source);

        return template(printData);
    }
}