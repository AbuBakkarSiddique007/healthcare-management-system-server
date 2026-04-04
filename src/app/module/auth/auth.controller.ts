import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/AppError";
import { cookieUtils } from "../../utils/cookie";

const registerPatient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body

        const result = await authService.registerPatient(payload)


        // Set cookies:
        const { accessToken, refreshToken, token, ...rest } = result

        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, refreshToken)
        tokenUtils.setBetterAuthSessionCookie(res, token as string)


        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "Patient registered successfully",
            data: {
                accessToken,
                refreshToken,
                token,
                ...rest
            }
        })
    }
)


const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body
        const result = await authService.loginUser(payload)

        const { accessToken, refreshToken, token, ...rest } = result

        // Set cookies:
        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, refreshToken)
        tokenUtils.setBetterAuthSessionCookie(res, token)




        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
                token,
                ...rest
            }
        })
    }
)



const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user
        const result = await authService.getMe(user)

        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "User profile fetched successfully",
            data: result
        })
    }
)


const getNewToken = catchAsync(
    async (req: Request, res: Response) => {

        const refreshToken = req.cookies.refreshToken
        const betterAuthSessionToken = req.cookies["better-auth.session_token"]

        if (!refreshToken || !betterAuthSessionToken) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Refresh token or session token is missing")
        }

        const result = await authService.getNewToken(refreshToken, betterAuthSessionToken)


        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result

        // Set cookies:
        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken)
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken)


        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "New access token generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,

            }
        })
    }


)



const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body
        const betterAuthSessionToken = req.cookies["better-auth.session_token"]

        if (!betterAuthSessionToken) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Session token is missing")
        }
        const result = await authService.changePassword(payload, betterAuthSessionToken)

        const { accessToken, refreshToken, token } = result

        // Set cookies:
        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, refreshToken)
        tokenUtils.setBetterAuthSessionCookie(res, token as string)



        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "Password changed successfully",
            data: result
        })
    }
)


const logOutUser = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"]
        if (!betterAuthSessionToken) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Session token is missing")
        }

        await authService.logOutUser(betterAuthSessionToken)

        // Clear cookies:
        cookieUtils.clearCookie(res, "accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        })

        cookieUtils.clearCookie(res, "refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        })

        cookieUtils.clearCookie(res, "better-auth.session_token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        })


        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "User logged out successfully",
        })
    }
)


const verifyEmailOTP = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body
        
        if (!email || !otp) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Email and OTP are required")
        }


        await authService.verifyEmailOTP(email, otp)

        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "Email verified successfully"
        })
    }
)

export const authController = {
    registerPatient,
    loginUser,
    getMe,
    logOutUser,
    getNewToken,
    changePassword,
    verifyEmailOTP
}   