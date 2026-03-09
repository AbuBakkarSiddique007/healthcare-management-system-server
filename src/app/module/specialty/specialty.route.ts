import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/client/enums";

const router = Router()

router.post("/", specialtyController.createSpecialty)

router.get("/",checkAuth(Role.PATIENT), specialtyController.getAllSpecialties)

router.delete("/:id", specialtyController.deleteSpecialty)
router.patch("/:id", specialtyController.updateSpecialty)
 

export const specialtyRoute = router