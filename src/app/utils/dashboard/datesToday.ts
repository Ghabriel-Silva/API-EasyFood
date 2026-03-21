//Função retorna o dia atual tando o incio 00:00  quando o final do dia 23:59

interface DatesTodayI  {
     todayStart: Date, 
        todayEnd:Date
}

export const datesToday = ():DatesTodayI => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const finalOfDay = new Date()
    finalOfDay.setHours(23, 59, 59, 999)

    return {
        todayStart: startOfDay, 
        todayEnd:finalOfDay
    }
}