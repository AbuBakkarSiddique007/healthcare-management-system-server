import express, { Application, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { indexRoute } from "./app/routes";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/v1", indexRoute)



// Basic route
app.get('/', async (req: Request, res: Response) => {
    // const specialty = await prisma.specialty.create({
    //     data: {
    //         title: "Neurology",
    //     }
    // })

    // res.status(200).json({
    //     success: true,
    //     message: "Specialty created successfully",
    //     data: specialty
    // })


    res.send('Hello, TypeScript + Express!');
});

export default app;