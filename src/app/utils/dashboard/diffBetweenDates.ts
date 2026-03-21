// Calcula a diferença em dias entre duas datas, normalizando ambas para o início do dia 00:00:00
// e retorna também as datas ajustadas para uso em consultas.
export const diffBetweenDates = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)
    
    const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
        diffDays, 
        start, 
        end
    }
}