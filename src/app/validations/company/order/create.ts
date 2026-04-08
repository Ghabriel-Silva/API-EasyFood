import * as yup from 'yup';

export const createOrderSchema = yup.object({
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
        .required('Forma de pagamento obrigatória!'),


    status: yup
        .string()
        .oneOf(['Pendente', 'Preparando', 'Completo', 'Entregue', 'Cancelado'], "Status inválido")
        .notRequired(),


    isFreightApplied: yup
        .boolean()
        .typeError("O valor deve ser booleano")
        .required("O campo é obrigatório"),

    customFreight: yup
        .number()
        .typeError('O frete deve ser um número')
        .min(0, 'O frete deve ser positivo')
        .notRequired(),

    additionalValue: yup
        .number()
        .typeError('O valor adicional deve ser um número')
        .min(0, 'O valor adicional deve ser positivo')
        .notRequired(),

    discountValue: yup
        .number()
        .typeError('O valor de desconto deve ser um número')
        .min(0, 'O valor de desconto deve ser positivo')
        .notRequired(),

    observations: yup
        .string()
        .max(600, 'O endereço deve ter no máximo 200 caracteres')
        .notRequired(),
    items: yup
        .array()
        .of(
            yup.object({
                name: yup
                    .string()
                    .required('O nome do produto é obrigatório'),

                product_id: yup
                    .string()
                    .required('O produto é obrigatório'),

                quantity: yup
                    .number()                 
                    .required('A quantidade é obrigatória'),

                price: yup
                    .number()
                    .transform((_, originalValue) =>
                        originalValue === "" ? undefined : Number(originalValue)
                    )
                    .typeError('O preço deve ser um número')
                    .positive('O preço deve ser positivo')
                    .required('O preço é obrigatório'),
            })
        )
        .min(1, 'É necessário informar pelo menos um item no pedido')
        .required('O campo items é obrigatório'),
});

export type CreateOrderSchema = yup.InferType<typeof createOrderSchema>;
