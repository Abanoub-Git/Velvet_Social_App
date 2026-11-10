import express from 'express'
import cors from "cors"
import { authenticationController, commentController, postController, userController } from './modules'
import { globalErrorHandling } from './middleware'
import { PORT } from './config'
import { bootstrapDB } from './DB/connection.db'
const app:express.Application = express() //msh mandatory a3ml kda 3shan hya constant w ba5od alvalue bta3to mn alintializer

app.use(cors(),express.json())
app.use("/assets", express.static("./assets"));
bootstrapDB(app,PORT)

app.all("/", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
    return res.status(200).json({ message: "Done" })
})


app.use('/auth', authenticationController)
app.use('/user', userController)
app.use('/post', postController)
app.use('/comment', commentController)
app.use(globalErrorHandling)


