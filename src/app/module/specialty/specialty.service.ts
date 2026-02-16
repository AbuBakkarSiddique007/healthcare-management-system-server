import { Specialty } from "../../../generated/client/client";
import { prisma } from "../../lib/prisma";


const createSpecialty =async (payload: Specialty): Promise<Specialty> =>{

    const specialty = await prisma.specialty.create({
        data: payload
    })

    return specialty
}



export const specialtyService = {
    createSpecialty
}