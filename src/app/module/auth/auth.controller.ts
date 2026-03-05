import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const registerPatient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body

        const result = await authService.registerPatient(payload)

        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "Patient registered successfully",
            data: result
        })
    }
)


const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body
        const result = await authService.loginUser(payload)

        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "User logged in successfully",
            data: result
        })
    }
)


export const authController = {
    registerPatient,
    loginUser
}