import { myJwtPayload } from "../i-auth/i-auth";

export interface QueryTypeDate {
    initial: string,
    final: string
}
export interface dateInfo {
    initial:Date, 
    final:Date
}

export interface IDashboardInput extends myJwtPayload , dateInfo {}