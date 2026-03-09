import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const route = Router()

route.get("/", DoctorController.getAllDoctors)

// router.post("/", DoctorController.createDoctor)
// router.get("/:id", DoctorController.getDoctorById)
// router.delete("/:id", DoctorController.deleteDoctor)
// router.patch("/:id", DoctorController.updateDoctor)


export const DoctorRoutes = route