import * as yup from 'yup';
import { UniMedida } from '../../../entity/Products';

export const productUpdateSchema = yup.object({
  name: yup.string().notRequired(),
  price: yup
    .number()
    .typeError('O preço deve ser um número')
    .positive('O preço deve ser positivo')
    .notRequired(),
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
    .notRequired(),
  expirationDate: yup.string().typeError('Data inválida').notRequired(),
  description: yup.string().notRequired(),
  category_id: yup.string().notRequired(),
});

export type ProductUpdateSchema = yup.InferType<typeof productUpdateSchema>