import { Router, Request, Response, NextFunction } from "express";
import { UserAuthService } from "../../service/company/auth-service";
import { ILoginResponse, IRegister } from "../../interfaces/i-auth/i-auth";
import { SuccessResponse } from "../../utils/success-response";
import AuthenticateMidlleware from "../../middlewares/auth-midlleware";

class AuthUser {
    public router: Router
    private userAuthService: UserAuthService

    constructor() {
        this.router = Router(),
            this.userAuthService = new UserAuthService(),
            this.inicializeRoutes()
    }

    private inicializeRoutes() {
        this.router.post('/login', this.loginUser)
        this.router.get('/me', AuthenticateMidlleware, this.infoUser)
    }


    private loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.userAuthService.login(req.body)
            if (data) {
                res.cookie("token", data.token, {
                    httpOnly: true,
                    secure:true,
                    sameSite: "none", 
                    maxAge: 3600000,
                })
                res.status(201).json(
                    SuccessResponse<ILoginResponse>(
                        null,
                        null,
                        `Bem vindo de novo ${data.user.name}`
                    )
                )
            }
        } catch (error) {
            next(error)
        }
    }

    private infoUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.json({
                authenticated: true,
                user: req.user
            });
        } catch (erro) {
            next(erro)
        }
    }

}

const userRouter = new AuthUser().router

export default userRouter