import { Router } from "express";
import { UserController } from "./user.controller";
import { validRequest } from "../../middlewares/validateRequest";
import { createDoctorZodSchema } from "./user.validation";

const router = Router()

router.post("/create-doctor", validRequest(createDoctorZodSchema), UserController.createDoctor)


export const UserRoutes = router;
