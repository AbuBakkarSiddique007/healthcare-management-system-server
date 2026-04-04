import { Role, UserStatus } from './../../generated/client/enums';
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { bearer, emailOTP } from 'better-auth/plugins';
import { sendEmail } from '../utils/email';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true
    },

    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
    },


    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.PATIENT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            }
        }
    },

    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,

            async sendVerificationOTP({ email, otp, type }) {
                console.log(`Auth OTP send requested: type=${type} email=${email} otp=${otp}`)

                if (type === "email-verification") {

                    const user = await prisma.user.findUnique({
                        where: {
                            email: email
                        }
                    })

                    if (user && !user.emailVerified) {
                        sendEmail({
                            to: email,
                            subject: "Verify your email",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp: otp
                            }
                        })
                    }
                }
            },
            expiresIn: 2 * 60,
            otpLength: 6,

        })
    ],


    session: {
        // 1 Day in seconds
        expiresIn: 60 * 60 * 60 * 24,

        // 1 Day in seconds
        updateAge: 60 * 60 * 60 * 24,
        cookieCache: {
            enabled: true,

            // 1 Day in seconds
            maxAge: 60 * 60 * 60 * 24
        }
    }
});