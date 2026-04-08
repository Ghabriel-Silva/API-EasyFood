import { myJwtPayload } from "../i-auth/i-auth";

export type QueryTypeDate = {
    initial?: Date | string | null;
    final?: Date | string | null;
}
export interface dateInfo {
    initial: Date,
    final: Date
}

interface diffDays {
    diffDays: number;
    start: Date;
    end: Date;
}

export interface IDashboardInput extends myJwtPayload, dateInfo { }

type GroupBy = "day" | "month"

//Interface para o metodo de busca os pedidos do mês IDataToQueryGetMonthOrder
export interface IDataToQueryGetMonthOrder extends diffDays, IDashboardInput {
    groupBy: GroupBy
}

export interface DatesReturn {
    date: string,
    total: number
}