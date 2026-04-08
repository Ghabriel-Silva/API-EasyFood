import * as yup from 'yup';

export const setStatusSchemaValidation = yup.object({
    status: yup
    .string()
    .oneOf(['active', 'inactive'], 'O valores de status devem ser active ou inactive')
    .optional()
})

export type SetStatusSchemaValidation = yup.InferType<typeof setStatusSchemaValidation>