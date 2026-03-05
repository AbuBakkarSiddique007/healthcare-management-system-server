import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router()

router.post("/", specialtyController.createSpecialty)
router.get("/", specialtyController.getAllSpecialties)
router.delete("/:id", specialtyController.deleteSpecialty)
router.patch("/:id", specialtyController.updateSpecialty)
 

export const specialtyRoute = router