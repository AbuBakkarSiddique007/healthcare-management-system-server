import { Request, Response } from "express";
import { specialtyService } from "./specialty.service";

const createSpecialty = async (req: Request, res: Response) => {

    const payload = req.body

    const result = await specialtyService.createSpecialty(payload)

    res.status(200).json({
        success: true,
        message: "Specialty created successfully",
        data: result
    })
}

export const specialtyController = {
    createSpecialty
}