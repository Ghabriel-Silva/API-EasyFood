import * as yup from 'yup';
import { UniMedida } from '../../../entity/Products';

export const productCreateSchema = yup.object({
  name: yup.string().required('O nome do produto é obrigatório'),
  price: yup
    .number()
    .typeError('O preço deve ser um número')
    .positive('O preço deve ser positivo')
    .required('O preço é obrigatório'),
  quantity: yup
    .number()
    .min(0, 'A quantidade não pode ser negativa')
    .notRequired(),
  uni_medida: yup
    .mixed<UniMedida>()
    .oneOf(
      Object.values(UniMedida),
      "Unidade inválida. Valores aceitos: un, kg, lt, porcao"
    )
    .required("Unidade De medida é obrigatório"),


  expirationDate: yup.string().typeError('Data inválida').notRequired(),
  description: yup.string().notRequired(),
  category_id: yup.string().required('Categoria é obrigatório'),
});

export type ProductSchema = yup.InferType<typeof productCreateSchema>