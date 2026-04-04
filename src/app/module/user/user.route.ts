import { Router } from "express";
import { UserController } from "./user.controller";
import { createDoctorZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router()

router.post("/create-doctor", validateRequest(createDoctorZodSchema), UserController.createDoctor)


export const UserRoutes = router;
