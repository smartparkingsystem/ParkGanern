import { Reservation } from "./reservation";

export interface User {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    birthday: string;   
    platenum: string;
    reservation: Reservation;
    hasReserved: boolean;
    notifications: string;
}