import { StatusCodes } from "http-status-codes";
import { UserStatus } from "../../../generated/client/enums";
import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IChangePassword, ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface";


const registerPatient = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,

            // Default values for the new user, So need to pass them:
            // needPasswordChange: false,
            // role : Role.PATIENT
        }
    })

    if (!data.user) {
        // throw new Error("User registration failed")
        throw new AppError(StatusCodes.BAD_REQUEST, "User registration failed")
    }

    try {
        // TODO: create patient profile in transaction after user signUp of patient in User Model
        const patient = await prisma.$transaction(async (tx) => {

            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email,
                }
            })

            return patientTx
        })


        // Create access and refresh tokens:
        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        })

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        })


        return {
            ...data,
            patient,
            accessToken,
            refreshToken
        }

    } catch (error) {
        console.log("Error creating patient profile:", error);

        // If somehow fail to create patient profile, delete the user:

        await prisma.user.delete({
            where: {
                id: data.user.id
            }
        })

        throw error
    }

}




const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload

    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        // throw new Error("Your account is blocked. Please contact support.")
        throw new AppError(StatusCodes.FORBIDDEN, "Your account is blocked. Please contact support.")
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        // throw new Error("Your account is deleted. Please contact support.")
        throw new AppError(StatusCodes.NOT_FOUND, "Your account is deleted. Please contact support.")

    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })

    return {
        ...data,
        accessToken,
        refreshToken
    }

}


const getMe = async (user: IRequestUser) => {

    const isUserExist = await prisma.user.findUnique({
        where: {
            id: user.userId
        },
        include: {
            patient: {
                include: {
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                    medicalReports: true,
                    patientHealthData: true,
                }
            },
            doctor: {
                include: {
                    specialties: true,
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                }
            },
            admin: true,
        },

    })

    if (!isUserExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found")
    }

    return isUserExist
}


// Generate new access token , refresh token using refresh token:
// 1. Verify the refresh token and session token
// 2. If valid, generate new access token and refresh token
// 3. Update the session with new expiry time and token
// 4. Return the new tokens to the client
// Also, need to set the new tokens in cookies in controller after getting the new tokens from service


const getNewToken = async (refreshToken: string, sessionToken: string) => {

    const isSessionTokenExist = await prisma.session.findUnique({
        where: {
            token: sessionToken,
        },
        include: {
            user: true,
        }
    })

    if (!isSessionTokenExist) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid session token")
    }



    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)

    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    })

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    })



    const { token } = await prisma.session.update({
        where: {
            token: sessionToken,
        },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date()
        }
    })

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token,
    }
}



const changePassword = async (payload: IChangePassword, sessionToken: string) => {

    const session = await auth.api.getSession({
        headers: {
            Authorization: `Bearer ${sessionToken}`

        }
    })

    if (!session) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid session")
    }


    const { currentPassword, newPassword } = payload

    const result = await auth.api.changePassword(
        {
            body: {
                currentPassword,
                newPassword,
                revokeOtherSessions: true
            },
            headers: {
                Authorization: `Bearer ${sessionToken}`
            }
        }
    )


    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    })




    return {
        ...result,
        accessToken,
        refreshToken
    }
}


const logOutUser = async (sessionToken: string) => {

    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })

    return result
}


const verifyEmailOTP = async (email: string, otp: string) => {

    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp
        }
    })

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                emailVerified: true
            }
        })
    }

}


export const authService = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logOutUser,
    verifyEmailOTP
}