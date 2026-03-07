/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../../config/env"
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";
import { handleZodError } from "../errorHelper/handleZodError";


const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.log("Error from globalErrorHandler:", err);
    }

    let errorSources: TErrorSources[] = []

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    let message = StatusCodes[statusCode] || "An unexpected error occurred"
    const error = err.message

    if (err instanceof z.ZodError) {

        const simplifiedError = handleZodError(err)

        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]

        
        err.issues.forEach(issue => {
            errorSources.push({
                // path: issue.path.length > 1 ? issue.path.join("=>") : issue.path[0].toString(),

                path: issue.path.join("=>"),
                message: issue.message
            })
        })

    }    

    // res.status(statusCode).json({
    //     success: false,
    //     message,
    //     errorSources,
    //     error: envVars.NODE_ENV === "development" ? error : undefined,
    // })


     const errorResponse: TErrorResponse ={
        success: false,
        message,
        errorSources,
        error: envVars.NODE_ENV === "development" ? error : undefined,
    }

    return res.status(statusCode).json(errorResponse)
}

export default globalErrorHandler