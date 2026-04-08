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
        "https://easy-food-web-jpcc.vercel.app",
        "http://localhost:3000" 
    ]
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