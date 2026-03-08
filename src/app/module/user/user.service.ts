import { StatusCodes } from "http-status-codes";
import { Role, Specialty } from "../../../generated/client/client";
import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";

const createDoctor = async (payload: ICreateDoctorPayload) => {
    const specialties: Specialty[] = []

    for (const specialtyId of payload.specialties) {
        const specialty = await prisma.specialty.findUnique({
            where: {
                id: specialtyId
            }
        })

        if (!specialty) {
            // throw new Error(`Specialty not found with id ${specialtyId}`)

            throw new AppError(StatusCodes.NOT_FOUND, `Specialty not found with id ${specialtyId}`)
        }

        specialties.push(specialty)
    }


    const userExist = await prisma.user.findUnique({
        where: {
            email: payload.doctor.email
        }
    })

    if (userExist) {
        // throw new Error("User already exists")

        throw new AppError(StatusCodes.CONFLICT, "User already exists")
    }

    const userData = await auth.api.signUpEmail({
        body: {
            email: payload.doctor.email,
            password: payload.password,
            role: Role.DOCTOR,
            name: payload.doctor.name,
            needPasswordChange: true,
        }
    })


    try {
        const result = await prisma.$transaction(async (tx) => {

            const doctorData = await tx.doctor.create({
                data: {
                    userId: userData.user.id,
                    ...payload.doctor,
                }
            })

            const doctorSpecialtyData = specialties.map((specialty) => {
                return {
                    doctorId: doctorData.id,
                    specialtyId: specialty.id
                }
            })

            await tx.doctorSpecialty.createMany({
                data: doctorSpecialtyData
            })


            const doctor = await tx.doctor.findUnique({
                where: {
                    id: doctorData.id
                },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    gender: true,
                    appointmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            status: true,
                            emailVerified: true,
                            image: true,
                            isDeleted: true,
                            deletedAt: true,
                            createdAt: true,
                            updatedAt: true,
                        }

                    },

                    doctorSpecialties: {
                        select: {
                            specialty: {
                                select: {
                                    title: true,
                                    id: true
                                }
                            }
                        }
                    }
                }
            })

            return doctor


        })

        return result


    } catch (error) {
        console.log("Transaction Error", error);

        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        })
        throw error
    }

}


export const UserService = {
    createDoctor
}