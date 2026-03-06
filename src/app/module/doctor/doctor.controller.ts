import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { DoctorService } from "./doctor.service"
import { sendResponse } from "../../shared/sendResponse"
import { StatusCodes } from "http-status-codes"

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
    const doctors = await DoctorService.getAllDoctors()
    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Doctors fetched successfully",
        data: doctors
    })
})

// get byId
// update
// delete (soft delete)

export const DoctorController = {
    getAllDoctors
}