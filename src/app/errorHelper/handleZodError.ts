import z from "zod";
import { TErrorSources } from "../interfaces/error.interfaces";
import { StatusCodes } from "http-status-codes";
import { envVars } from "../../config/env";

export const handleZodError = (err: z.ZodError) =>{
    const errorSources: TErrorSources[] = []

    const statusCode = StatusCodes.BAD_REQUEST
    const message = "Zod Validation Error"



    err.issues.forEach(issue => {
        errorSources.push({
            path: issue.path.join("=>"),
            message: issue.message
        })
    })

    

    return {
        success: false,
        message,
        statusCode,
        errorSources,
        error: envVars.NODE_ENV === "development" ? err.message : undefined,
    }
}