import * as yup from "yup"

export const dashboardDateSchema = yup.object({
    initial: yup
        .date()
        .nullable()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        )
        .typeError("Data inicial inválida"),

    final: yup
        .date()
        .nullable()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        )
        .typeError("Data final inválida")
        .test(
            "require-start-date-if-final",
            "Defina a data inicial",
            function (finalDate) {
                const { initial } = this.parent
                if (!finalDate) return true
                return !!initial
            }
        )
        .test(
            "final-after-start",
            "A data final não pode ser menor que a inicial",
            function (finalDate) {
                const { initial } = this.parent
                if (!finalDate || !initial) return true
                return finalDate >= initial
            }
        ),
})

export type dashboardDateType = yup.InferType<typeof dashboardDateSchema>