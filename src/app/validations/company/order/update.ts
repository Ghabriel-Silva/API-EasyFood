import * as yup from 'yup';

export const updateOrderSchema = yup.object({
    customerName: yup
        .string()
        .typeError("O nome da empresa deve ser texto")
        .max(100, 'O nome da Empresa deve ter até 100 caracteres')
        .notRequired(),

    customerAddress: yup
        .string()
        .typeError('O endereço deve ser texto')
        .max(200, 'O endereço deve ter no máximo 200 caracteres')
        .notRequired(),

    customerPhone: yup
        .string()
        .max(20, "O telefone pode ter no máximo 20 caracteres")
        .notRequired(),

    paymentMethod: yup
        .string()
        .oneOf(['Dinheiro', 'Cartão', 'Pix', 'Outros'], "Forma de pagamento inválida")
        .notRequired(),

    isFreightApplied: yup
        .boolean()
        .typeError("O valor deve ser booleano")
        .notRequired(),

    customFreight: yup
        .number()
        .typeError('O frete deve ser um número')
        .positive('O frete deve ser positivo')
        .notRequired(),

    additionalValue: yup
        .number()
        .typeError('O valor adicional deve ser um número')
        .positive('O valor adicional deve ser positivo')
        .notRequired(),

    discountValue: yup
        .number()
        .typeError('O valor de desconto deve ser um número')
        .positive('O valor de desconto deve ser positivo')
        .notRequired(),

    items: yup
        .array()
        .of(
            yup.object({
                product_id: yup
                    .string()
                    .required('O produto é obrigatório'),

                quantity: yup
                    .number()
                    .integer('A quantidade deve ser um número inteiro')
                    .min(1, 'A quantidade deve ser no mínimo 1')
                    .required('A quantidade é obrigatória'),

                price: yup
                    .number()
                    .typeError('O preço deve ser um número')
                    .positive('O preço deve ser positivo')
                    .required('O preço é obrigatório'),
            })
        )
        .min(1, 'É necessário informar pelo menos um item no pedido')
        .notRequired()
        .nullable()
        .when([], {
            is: (items:any) => Array.isArray(items),
            then: (schema) => schema.min(1, 'É necessário informar pelo menos um item no pedido'),
        })
})

export type UpdateOrderSchema = yup.InferType<typeof updateOrderSchema>