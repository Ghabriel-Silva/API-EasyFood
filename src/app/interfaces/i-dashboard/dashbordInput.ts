import { myJwtPayload } from "../i-auth/i-auth";


export interface dateInfo {
    initial:string, 
    final:string
}

export interface IDashboardInput extends myJwtPayload , dateInfo {}