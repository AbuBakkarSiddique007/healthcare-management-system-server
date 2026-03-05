import { Specialty } from "../../../generated/client/client";
import { prisma } from "../../lib/prisma";


const createSpecialty = async (payload: Specialty): Promise<Specialty> => {

    const specialty = await prisma.specialty.create({
        data: payload
    })

    return specialty
}


const getAllSpecialties = async () => {
    const specialties = await prisma.specialty.findMany()

    return specialties
}


const deleteSpecialty = async (specialtyId: string) => {

    const specialty = await prisma.specialty.findUnique({
        where: {
            id: specialtyId
        }
    })

    if (!specialty) {
        throw new Error("Specialty not found")
    }

    const deletedSpecialty = await prisma.specialty.delete({
        where: {
            id: specialtyId
        }
    })

    return deletedSpecialty
}


const updateSpecialty = async (specialtyId: string, payload: Specialty) => {

    const specialty = await prisma.specialty.findUnique({
        where: {
            id: specialtyId
        }
    })

    if (!specialty) {
        throw new Error("Specialty not found")
    }

    const updatedSpecialty = await prisma.specialty.update({
        where: {
            id: specialtyId
        },
        data: payload
    })

    return updatedSpecialty
}


export const specialtyService = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty
}