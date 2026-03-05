/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../../config/env"
import { StatusCodes } from "http-status-codes";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.log("Error from globalErrorHandler:", err);
    }

    const statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    const message = StatusCodes[statusCode] || "An unexpected error occurred"
    const error = err.message

    res.status(statusCode).json({
        success: false,
        message,
        error
    })
}

export default globalErrorHandler