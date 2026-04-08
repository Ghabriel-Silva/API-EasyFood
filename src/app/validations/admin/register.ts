import * as yup from "yup";

const registerSchema = yup.object({
    name: yup
        .string()
        .required("O campo nome é obrigatório")
        .min(3, "O campo nome deve ter pelo menos 3 caracteres")
        .max(100, "O campo nome não pode ter mais de 100 caracteres"),

    email: yup
        .string()
        .email("O campo email deve ser um email válido")
        .required("O campo email é obrigatório")
        .min(10, "O campo email deve ter pelo menos 10 caracteres")
        .max(100, "O campo email não pode ter mais de 100 caracteres"),

    password: yup
        .string()
        .required("O campo senha é obrigatório")
        .min(6, 'A senha deve ter pelo menos 6 caracteres')
        .max(100, "O campo senha não pode ter mais de 100 caracteres")

})
    .noUnknown(true, "Campos não permitidos foram enviados.");

export default registerSchema