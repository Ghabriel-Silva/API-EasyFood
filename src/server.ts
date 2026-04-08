import express from "express"
import { AppDataSource } from "./database/dataSource"
import 'reflect-metadata'
import cors from 'cors'
import 'express-async-errors'
import httpErrorMiddleware from "./app/middlewares/error-middleware"
import routers from "./app/routes"
import cookieParser from "cookie-parser";


const app = express()
app.use(express.json())
app.use(cookieParser());

app.use(cors({
    origin: [
        "easy-food-web-h2ip-git-vercel-ec516a-gabriels-projects-306bc07f.vercel.app",
    ],
    credentials: true,
}))

app.use(routers)

app.use(httpErrorMiddleware)

AppDataSource.initialize().then(() => {
    console.log('data base Started!')

    app.listen(8080, () => {
        console.log('Server Started!')
    })


}).catch((err) => {
    console.log("Error during Data Source initialization:", err)
})