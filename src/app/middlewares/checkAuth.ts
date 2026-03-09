import { NextFunction, Request, Response } from "express";
import { cookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import { Role, UserStatus } from "../../generated/client/enums";
import AppError from "../errorHelper/AppError";
import { StatusCodes } from "http-status-codes";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Session Token Verification :
        const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token")

        if (!sessionToken) {
            throw new Error("Unauthorized: No session token provided")
        }

        if (sessionToken) {
            const sessionExist = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date()
                    },
                },
                include: {
                    user: true
                }
            })

            if (sessionExist && sessionExist.user) {
                const user = sessionExist.user

                const now = new Date()

                const expiresAt = new Date(sessionExist.expiresAt)
                const createAt = new Date(sessionExist.createdAt)

                const sessionLifeTime = expiresAt.getTime() - createAt.getTime()
                const timeRemaining = expiresAt.getTime() - now.getTime()
                const percentRemaining = (timeRemaining / sessionLifeTime) * 100

                if (percentRemaining < 20) {
                    res.setHeader("X-Session-Expiring", "true")
                    res.setHeader("X-Session-Expires-In", expiresAt.toISOString())
                    res.setHeader("X-TimeRemaining", timeRemaining.toString())

                    console.log("Session Expiring Soon!!!");
                }

                if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                    throw new AppError(StatusCodes.UNAUTHORIZED, "User is blocked or deleted")
                }

                if (user.isDeleted) {
                    throw new AppError(StatusCodes.UNAUTHORIZED, "User is deleted")
                }

                if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                    throw new AppError(StatusCodes.FORBIDDEN, "Forbidden: You don't have permission to access this resource")
                }
            }
        }


        //  Access Token Verification :
        const accessToken = cookieUtils.getCookie(req, "accessToken")

        if (!accessToken) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized: No access token provided")
        }

        const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET)

        if (!verifiedToken.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized: Invalid access token")
        }

        if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data!.role)) {
            throw new AppError(StatusCodes.FORBIDDEN, "Forbidden: You don't have permission to access this resource")
        }

        next()

    } catch (error) {
        next(error)
    }

}