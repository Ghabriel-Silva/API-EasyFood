import * as yup from 'yup';

export const setStatusSchema = yup.object({
    status: yup
    .string()
    .oneOf(['active', 'inactive'], 'O parâmetro status precisa conter "active" ou "inactive".')
    .optional()
})

export type setStatus = yup.InferType<typeof setStatusSchema>