import * as yup from 'yup';
import { OrderStatus } from '../../../entity/Order';


export const setStatusSchemaOrder = yup.object({
    status: yup
        .mixed<OrderStatus>()
        .oneOf(Object.values(OrderStatus), "Status inválido, defina um valor: ['Pendente,Preparando,Completo,Entregue,Cancelado'] ")
        .required("O status é obrigatório"),
})



export type SetStatusSchemaOrder = yup.InferType<typeof setStatusSchemaOrder>
