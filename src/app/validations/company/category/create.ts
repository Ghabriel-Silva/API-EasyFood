import * as yup from 'yup';


export const categoryValidationSchema = yup.object({
    name: yup
        .string()
        .typeError("O a categoria  deve ser texto")
        .min(3, 'A categoria deve ter no minimo 3 caracteres')
        .max(100, 'A categoria deve ter até 100 caracteres')
        .required()
})

export type CategoryValidationSchema = yup.InferType<typeof categoryValidationSchema>