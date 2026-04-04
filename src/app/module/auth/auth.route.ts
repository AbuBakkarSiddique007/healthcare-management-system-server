import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/client/enums";

const router = Router()

router.post("/register", authController.registerPatient)
router.post("/login", authController.loginUser)


//get-me 
router.get("/me",
	checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN),
	authController.getMe)

router.post("/refresh-token", authController.getNewToken)

router.post("/change-password",
	checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN),
	authController.changePassword
)

router.post("/logout",
	checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN),
	authController.logOutUser
)

// Verify email OTP:
router.post("/verify-email", authController.verifyEmailOTP)

export const authRoute = router