import * as yup from 'yup';


export const configConpanySchema = yup.object({
     name: yup
          .string()
          .min(3, "O campo nome deve ter pelo menos 3 caracteres")
          .max(30, "O campo nome não pode ter mais de 30 caracteres")
          .optional(),

     customerAddress: yup
          .string()
          .typeError('O endereço deve ser texto')
          .max(60, 'O endereço deve ter no máximo 60 caracteres')
          .transform((value) => (value?.trim() === "" ? null : value)),

     customerPhone: yup
          .string()
          .max(20, "O telefone pode ter no máximo 20 caracteres"),

     defaultFreight: yup
          .number()
          .typeError('O Valor do frete deve ser um numero')
          .positive('O valor do frete deve ser positivo')
          .required('Defina um valor ao enviar')

})

export type ConfigConpanySchema = yup.InferType<typeof configConpanySchema>
