import { Router } from "express";
import { specialtyRoute } from "../module/specialty/specialty.route";

const router = Router()

router.use("/specialties", specialtyRoute)



export const indexRoute = router