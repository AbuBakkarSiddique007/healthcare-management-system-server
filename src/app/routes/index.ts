import { Router } from "express";
import { specialtyRoute } from "../module/specialty/specialty.route";
import { authRoute } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";

const router = Router()

router.use("/auth", authRoute)
router.use("/specialties", specialtyRoute)
router.use("/users", UserRoutes)
router.use("/doctors", DoctorRoutes)


export const indexRoute = router