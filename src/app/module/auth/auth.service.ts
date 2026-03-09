import { StatusCodes } from "http-status-codes";
import { UserStatus } from "../../../generated/client/enums";
import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

interface IRegisterPatientPayload {
    name: string,
    email: string,
    password: string
}

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


interface ILoginUserPayload {
    email: string,
    password: string
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

export const authService = {
    registerPatient,
    loginUser
}