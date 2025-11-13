

export interface User {
    id:number,
    first_name:string,
    last_name:string,
    phone_number:string,
    email: string;
    address: string;  
    role:number,
    status:number,
    createdAt:Date,
    updatedAt:Date,
    abn:any
    designation:any,
}

export interface UserCreds {
    username: string;
    password: string;
    
}

export class Staff {
    constructor()
    {

    }
    id:number;
    first_name:string;
    last_name:string;
    phone_number:string;
    email: string;
    password: string;  
    role:number;  
    role_name:string; 
}