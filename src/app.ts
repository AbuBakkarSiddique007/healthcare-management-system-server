import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { indexRoute } from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFount from "./app/middlewares/notFound";
import path from "path";
import cors from "cors"
import { envVars } from "./app/config/env";
import qs from "qs";

const app: Application = express();

app.set("query parser", (str : string) => qs.parse(str));

// For Email Template:
app.set("view engine", "ejs")
app.set("views", path.resolve(process.cwd(), "src/app/templates"))

app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))


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