import { DatesReturn } from "../../interfaces/i-dashboard/dashbordInput"

export const orderMonthGenerete = (
    allDatesQuery: string[],
    orderMonth: any[]
): DatesReturn[] => {
    //YYYY-MM-DD ou YYYY-MM
    const map = new Map(
        orderMonth.map(item => {
            const dateKey = new Date(item.date).toISOString()
            const isMonthGroup = allDatesQuery[0]?.length === 7
            const formattedKey = isMonthGroup
                ? dateKey.slice(0, 7)
                : dateKey.split("T")[0]

            return [formattedKey, Number(item.total)]
        })
    );

    return allDatesQuery.map(date => ({
        date,
        total: map.get(date) ?? 0
    }));
}