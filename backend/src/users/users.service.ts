import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {

   private users = [
    {"id":1,"name":"Ram"}
   ]
    
    getUsers(){
        return this.users
    }
    addUser(id:number,name:string){
        const newUser = {id,name}
        this.users.push(newUser)
        return{
            message:"User has been sucessfully created!",
            users:newUser,
        }
    }
    deleteUser(id:number){
        this.users = this.users.filter(user => user.id !== id);
        return {message:`user ${id} delete sucessfully`}
    }


}
