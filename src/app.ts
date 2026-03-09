import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { indexRoute } from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFount from "./app/middlewares/notFound";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Cookie parser (populates `req.cookies`)
app.use(cookieParser());

app.use("/api/v1", indexRoute)



// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.send('Hello World from Ph Health Server!');
});



// Global Error Handler:
app.use(globalErrorHandler)

// Not Found Handler:
app.use(notFount)


export default app;