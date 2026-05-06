import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { specialtyService } from "./specialty.service";
import { sendResponse } from "../../shared/sendResponse";
import { Prisma } from "../../../generated/client/client";

const createSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const payload: Prisma.SpecialtyCreateInput = {
            ...req.body,
            icon : req.file?.path
        };
        const result = await specialtyService.createSpecialty(payload);
        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: 'Specialty created successfully',
            data: result
        });
    }
)


const getAllSpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const result = await specialtyService.getAllSpecialties();
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Specialties fetched successfully',
            data: result
        });
    }
)

const deleteSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await specialtyService.deleteSpecialty(id as string);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Specialty deleted successfully',
            data: result
        });
    }
)

const updateSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload: Prisma.SpecialtyUpdateInput = {
            ...req.body,
            icon: req.file?.path,
        };

        const result = await specialtyService.updateSpecialty(id as string, payload);

        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Specialty updated successfully',
            data: result,
        });
    }
)

export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty
}