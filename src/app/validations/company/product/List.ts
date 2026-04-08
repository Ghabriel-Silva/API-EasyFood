import * as yup from 'yup';

export const listSchemaProducts = yup.object({
    status: yup
        .string()
        .oneOf(["active", "desactivated"], "Status deve ser um dos seguintes valores: active, desactivated")
        .optional(),

    price: yup
        .string()
        .oneOf(["menor", "maior"], "Preço deve ser um dos seguintes valores: maior, manor")
        .optional(),

    page: yup
        .number()
        .transform((_, value) => {
            const n = Number(value);
            return isNaN(n) ? 1 : n;
        })
        .integer()
        .min(1)
        .default(1),

    limit: yup
        .number()
        .transform((_, value) => {
            if (value === undefined) return undefined
            const n = Number(value)
            return isNaN(n) ? undefined : n
        })
        .integer()
        .min(1)
        .max(200)
})

export type listSchema = yup.InferType<typeof listSchemaProducts>