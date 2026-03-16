import { Repository } from "typeorm";
import { Products } from "../../entity/Products";
import { AppDataSource } from "../../../database/dataSource";
import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import { IProduct, IProductsReturn, IProductStatus } from "../../interfaces/i-product/i-product";
import { Company } from "../../entity/Company";
import { Category } from "../../entity/Category";
import { listSchema } from "../../validations/company/product/List";
import { IDashboardInput } from "../../interfaces/i-dashboard/dashbordInput";
import { OrderItem } from "../../entity/OrderItem";



export class ProductRepository {
    private productRepository: Repository<Products>
    private orderItemRepo: Repository<OrderItem>

    constructor() {
        this.productRepository = AppDataSource.getRepository(Products)
        this.orderItemRepo = AppDataSource.getRepository(OrderItem)
    }



    async createProduct(user: myJwtPayload, data: IProduct): Promise<boolean> {
        const newProduct = this.productRepository.create({
            name: data.name,
            price: data.price,
            quantity: data.quantity ?? undefined,
            expirationDate: data.expirationDate ?? undefined,
            description: data.description ?? undefined,
            isAvailable: true,
            uni_medida: data.uni_medida ?? undefined,
            company: { id: user.id },
            category: data.category_id ? { id: data.category_id } : undefined,
        }) //?? undefined garante que, se o valor for null ou undefined, o campo será omitido, que é exatamente o que o TypeORM espera
        const categoryExist = await AppDataSource
            .getRepository(Category)
            .createQueryBuilder('category')
            .where("category.id = :category", { category: newProduct.category.id })
            .andWhere("company_id = :id", { id: newProduct.company.id })
            .getExists()

        if (!categoryExist) {
            return false
        }

        const createProducts = await this.productRepository.save(newProduct)

        if (createProducts) return true

        return false
    }


    async updateProduct(id: string, company: myJwtPayload, update: any): Promise<Products | null> {

        const updateData = await this.productRepository
            .createQueryBuilder()
            .update(Products)
            .set(update)
            .where("id = :id", { id })
            .andWhere("company_id = :company_id", { company_id: company.id })
            .execute();

        if (updateData.affected === 0) return null


        const productWithRelations = await this.productRepository.findOne({
            where: {
                id: id,
                company: {
                    id: company.id
                }
            },
            relations: ['company', 'category']
        })
        return productWithRelations
    }



    async findByid(id: string, company: myJwtPayload): Promise<Products | null> {
        return await this.productRepository.findOne({
            where: {
                id,
                company: { id: company.id }
            },
            relations: ["company", "category"]
        });
    }

    async setStatusProduct(id: string, company: myJwtPayload, setStatus: boolean): Promise<IProductStatus | null> {
        const updateStatus = await this.productRepository
            .createQueryBuilder()
            .update(Products)
            .set({ isAvailable: setStatus })
            .where("id = :id", { id })
            .andWhere("company_id = :company_id", { company_id: company.id })
            .execute()

        if (updateStatus.affected === 0) return null

        return { id, isAvailable: setStatus }
    }
    async getCompanyFrete(company: myJwtPayload) {
        return await AppDataSource
            .getRepository(Company)
            .createQueryBuilder('company')
            .select(['company.defaultFreight'])
            .where("company.id = :id", { id: company.id })
            .getOne()
    }

    async listProduct(filters: listSchema, company: myJwtPayload): Promise<IProductsReturn> {
        const frete: Company | null = await this.getCompanyFrete(company)
        const page = filters.page;
        const limit = filters.limit;


        const order: Record<string, 'ASC' | 'DESC'> = {
            created_at: 'DESC'
        }
        const where: any = {
            company: { id: company.id }
        }

        if (filters.price === 'maior') order.price = 'DESC'
        else if (filters.price === 'menor') order.price = 'ASC'

        if (filters.status === 'active') where.isAvailable = true
        else if (filters.status === 'desactivated') where.isAvailable = false



        const [products, total] = await this.productRepository.findAndCount({
            where,
            skip: limit ? (page - 1) * limit : undefined,
            take: limit || undefined,
            order,

            relations: ['category', 'company']
        })

        const totalPages = limit ? Math.ceil(total / limit) : 1;

        return {
            data: products,
            frete: frete,
            fromCache: false,
            page,
            limit,
            total,
            totalPages
        } as IProductsReturn
    }

    async dataDashboard(data: IDashboardInput) {
        try {
            const kips = await this.productRepository
                .createQueryBuilder("products")
                .select("COUNT(products.id)", "products_total")
                .addSelect(`SUM(CASE WHEN  products.isAvailable = TRUE THEN 1 ELSE 0 END)`, 'products_active')
                .addSelect(`SUM(CASE WHEN  products.isAvailable = FALSE THEN 1 ELSE 0 END)`, "products_inactive")
                .addSelect(`SUM(CASE WHEN products.quantity = 0 THEN 1 ELSE 0 END)`, "products_negative_quantity")
                .where("products.company_id = :id", { id: data.id })
                .getRawOne()

            const topProducts = await this.orderItemRepo
                .createQueryBuilder("item")
                .select("product.id", "id")
                .addSelect("product.name", "name")
                .addSelect("SUM(item.quantity)", "totalSold")
                .innerJoin("item.product", "product")
                .innerJoin("product.company", "company")
                .where("company.id = :companyId", { companyId: data.id })
                .groupBy("product.id")
                .orderBy("totalSold", "DESC")
                .limit(5)
                .getRawMany()

            const lowProducts = await this.orderItemRepo
                .createQueryBuilder("item")
                .select("product.id", "id")
                .addSelect("product.name", "name")
                .addSelect("SUM(item.quantity)", "totalSold")
                .innerJoin("item.product", "product")
                .innerJoin("product.company", "company")
                .where("company.id = :companyId", { companyId: data.id })
                .groupBy("product.id")
                .orderBy("totalSold", "ASC")
                .limit(5)
                .getRawMany();


            return {
                ...kips,
                topProducts,
               lowProducts
            }
        } catch (err) {
            console.log(err)
        }

    }
}