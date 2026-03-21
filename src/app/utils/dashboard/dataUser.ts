import { myJwtPayload } from "../../interfaces/i-auth/i-auth";
import { IDashboardInput, QueryTypeDate } from "../../interfaces/i-dashboard/dashbordInput";

//Centralizo as data para que me retorne sempre inicial começando 00:00 e a final 23:59 caso não envie por default puxa 30 dias 
export const dataUser = (payloud:myJwtPayload, date:QueryTypeDate):IDashboardInput => {
    const initial = date?.initial
        ? new Date(`${date.initial}T00:00:00`)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const final = date?.final
        ? new Date(`${date.final}T23:59:59.999`)
        : new Date();

    if (!date?.initial) {
        initial.setHours(0, 0, 0, 0);
    }
    if (!date?.final) {
        final.setHours(23, 59, 59, 999);
    }
    const dataUserAndDate = {
        ...payloud,
        initial,
        final
    }

    return dataUserAndDate
}