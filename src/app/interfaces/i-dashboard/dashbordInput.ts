import { myJwtPayload } from "../i-auth/i-auth";


export interface dateInfo {
    initial:Date, 
    final:Date
}

export interface IDashboardInput extends myJwtPayload , dateInfo {}