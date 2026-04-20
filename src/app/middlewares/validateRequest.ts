import { NextFunction, Request, Response } from "express"
import z from "zod"

export const validateRequest = (zodSchema: z.ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {

        if (req.body && req.body.data) {
            try {
                req.body = JSON.parse(req.body.data)
            } catch (error) {
                console.log(error);
            }
        }


        const parseResult = zodSchema.safeParse(req.body)

        if (!parseResult.success) {
            next(parseResult.error)
        }

        // Sanitizing the data:
        req.body = parseResult.data
        next()
    }
}