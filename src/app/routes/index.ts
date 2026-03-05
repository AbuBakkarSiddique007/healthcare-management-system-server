import { Router } from "express";
import { specialtyRoute } from "../module/specialty/specialty.route";
import { authRoute } from "../module/auth/auth.route";

const router = Router()

router.use("/auth", authRoute)
router.use("/specialties", specialtyRoute)



export const indexRoute = router