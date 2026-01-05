import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";

export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey :'SECRET_KEY',
        });
    }

    validate(payload:any){
        return payload
    }


}