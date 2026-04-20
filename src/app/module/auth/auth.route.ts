import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/client/enums";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../lib/auth";

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


// forget password:
router.post("/forget-password", authController.forgetPassword)

// reset password: 
router.post("/reset-password", authController.resetPassword)


// Social Login (Google): 
router.get("/login/google", authController.googleLogin)
router.get("/google/success", authController.googleLoginSuccess)
router.get("/oauth/error", authController.handleOAuthError)


// Better Auth Fallback:
router.use(toNodeHandler(auth))

export const authRoute = router