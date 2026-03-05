import express, { Application, Request, Response } from "express";
// import { prisma } from "./app/lib/prisma";
import { indexRoute } from "./app/routes";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/v1", indexRoute)



// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.send('Hello World from Ph Health Server!');
});

export default app;