import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const route = Router()

route.get("/", DoctorController.getAllDoctors)


export const DoctorRoutes = route