import * as  yup from 'yup'

const LoginSchema = yup.object({
    email: yup
    .string()
    .email('Digite um email válido!')
    .max(100, 'O email não pode ter mais de 100 caracteres')
    .required('O email é obrigatório!'),

    password: yup
    .string()
    .required('O campo senha é obrigatório')
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(50, 'A senha não pode ter mais de 50 caracteres')
})
export default LoginSchema