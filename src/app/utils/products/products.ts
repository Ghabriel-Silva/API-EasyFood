import { Products } from "../../entity/Products";
import { IProductOutput } from "../../interfaces/i-product/i-product";

export const mapProductToOutput = (product: Products): IProductOutput => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity ?? null,          
    expirationDate: product.expirationDate ?? null,
    isAvailable: product.isAvailable,
    description: product.description ?? null,    
    created_at: product.created_at,
    updated_at: product.updated_at,
    company: {
        id: product.company.id,
        name: product.company.name,
    },
    category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
        }
        : null,                                    
})