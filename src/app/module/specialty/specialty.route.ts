import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/client/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { specialtyValidation } from "./specialty.validation";


const router = Router()

router.post("/",
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(specialtyValidation.createSpecialtyZodSchema),
    specialtyController.createSpecialty)

router.get("/", specialtyController.getAllSpecialties)

router.delete("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    specialtyController.deleteSpecialty)

router.patch("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    specialtyController.updateSpecialty)


export const specialtyRoute = router