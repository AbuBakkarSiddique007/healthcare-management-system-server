import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { indexRoute } from "./app/routes";
import notFount from "./app/middlewares/notFound";
import path from "path";
import cors from "cors"
import { envVars } from "./app/config/env";
import qs from "qs";
import { PaymentController } from "./app/module/payment/payment.controller";
import cron from "node-cron"
import { AppointmentService } from "./app/module/appointment/appointment.service";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";


const app: Application = express();
app.set("query parser", (str : string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views",path.resolve(process.cwd(), `src/app/templates`) )

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)

app.use(cors({
    origin : [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders : ["Content-Type", "Authorization"]
}))

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())

cron.schedule("*/25 * * * *", async () => {
    try {
        console.log("Running cron job to cancel unpaid appointments...");
        await AppointmentService.cancelUnpaidAppointments();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error : any) {
        console.error("Error occurred while canceling unpaid appointments:", error.message);    
    }
})

app.use("/api/v1", indexRoute);


app.use("/api/v1/auth", toNodeHandler(auth))

// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'API is working',
    })
});

app.use(globalErrorHandler)
app.use(notFount)


export default app;