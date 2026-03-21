export const generateDates = (start: Date, end: Date, groupBy: "day" | "month") => {
    const dates:string[] = []

    let current = new Date(start)
    current.setHours(12, 0, 0, 0)

    const targetEnd = new Date(end)
    targetEnd.setHours(12, 0, 0, 0)

    let limit = 0

    while (current <= targetEnd && limit < 500) {
        limit++;

        const isoString = current.toISOString()

        if (groupBy === "day") {
            dates.push(isoString.split("T")[0]) // YYYY-MM-DD
            current.setDate(current.getDate() + 1)
        } else {
            const yearMonth = isoString.slice(0, 7) // YYYY-MM
            if (!dates.includes(yearMonth)) {
                dates.push(yearMonth);
            }

            current.setMonth(current.getMonth() + 1)
            current.setDate(1);
        }
    }

    return dates;
};