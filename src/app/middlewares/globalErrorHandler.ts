/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";
import { handleZodError } from "../errorHelper/handleZodError";
import AppError from "../errorHelper/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";


const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.log("Error from globalErrorHandler:", err);
    }

    // For Single File Upload Error Handling:
    if (req.file) {
        await deleteFileFromCloudinary(req.file.path)
    }

    // For Multiple File Upload Error Handling:
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls = req.files.map((file) => file.path)

        console.log(imageUrls);


        await Promise.all(
            imageUrls.map((url) => deleteFileFromCloudinary(url))
        )
    }



    let errorSources: TErrorSources[] = []

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    let message = StatusCodes[statusCode] || "An unexpected error occurred"
    let stack = err?.stack
    const error = err.message

    // if (err instanceof z.ZodError) {
    //     const simplifiedError = handleZodError(err)

    //     statusCode = simplifiedError.statusCode
    //     message = simplifiedError.message
    //     errorSources = simplifiedError.errorSources
    // }

    if (err instanceof z.ZodError) {
        const simplifiedError = handleZodError(err)

        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
        stack = err.stack
        errorSources = [{
            path: "",
            message: err.message
        }]
    }
    else if (err instanceof Error) {
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR
        message = err.message
        stack = err.stack
        errorSources = [{
            path: "",
            message: err.message
        }]
    }

    // res.status(statusCode).json({
    //     success: false,
    //     message,
    //     errorSources,
    //     error: envVars.NODE_ENV === "development" ? error : undefined,
    // })


    const errorResponse: TErrorResponse = {
        statusCode,
        success: false,
        message,
        errorSources,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? err : undefined,
    }

    return res.status(statusCode).json(errorResponse)
}

export default globalErrorHandler