import Jwt, { SignOptions } from "jsonwebtoken"
import dotenv from "dotenv"
import { myJwtPayload } from "../interfaces/i-auth/i-auth"
import ErrorExtension from "./error-extension"


const SECRET: string = process.env.JWT_SECRET as string
const jwtDefaultConfig: SignOptions = {
    algorithm: "HS256",
    expiresIn: "1h"
}

class Auth {
    constructor(private jwtConfig?: SignOptions) {
        if (!jwtConfig) {
            this.jwtConfig = jwtDefaultConfig
        }
    }

    public jwtGenerator(payload: myJwtPayload) {
        return Jwt.sign(payload, SECRET, this.jwtConfig)
    }

    public AuthenticateToken(token: string):myJwtPayload {
        if (!token) {
            throw new ErrorExtension(401, "Token não encontrado!")
        }
        try {
            const validateJwt:myJwtPayload  = Jwt.verify(token, SECRET) as myJwtPayload
            return validateJwt
        } catch (err) {
            throw new ErrorExtension(401, "Token não encontrado!")
        }

    }
}

export default Auth