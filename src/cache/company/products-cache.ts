import { listSchema } from "../../app/validations/company/product/List";
import client from "../redis-client";

const CACHE_TTL_PRODUCTS = 5 * 60

export const setCompanyFilterCache = async (
    userId: string,
    baseKey: string = 'products',
    value: any,
    filters: listSchema,
    ttlSeconds = CACHE_TTL_PRODUCTS
) => {
    const filterKey = Object.entries(filters)
        .map(([k, v]) => `${k}:${v}`)
        .join('-') //["status:active", "price:maior"] → "status:active-price:maior-page:1-limit:10"

    const cacheKey = `company:${userId}:${baseKey}:${filterKey}` //"company:123:products:status:active|price:maior" 
    await client.set(cacheKey, JSON.stringify(value), { EX: ttlSeconds })
}


export const getFilterCompanyCache = async (
    userId: string,
    filters: Record<string, string | number>,
    baseKey: string = 'products'
) => {
    const filterKey = Object.entries(filters).map(([Key, value]) => `${Key}:${value}`).join('-')
    const cacheKey = `company:${userId}:${baseKey}:${filterKey}`

    const cached = await client.get(cacheKey)

    return cached ? JSON.parse(cached) : null
}
