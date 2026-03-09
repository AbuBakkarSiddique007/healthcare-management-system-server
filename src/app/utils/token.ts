import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../../config/env";
import { cookieUtils } from "./cookie";
import { Response } from "express";

const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload,
        envVars.ACCESS_TOKEN_SECRET,
        {
            expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN
        } as SignOptions
    )

    return accessToken
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        envVars.REFRESH_TOKEN_SECRET,
        {
            expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN
        } as SignOptions
    )

    return refreshToken
}


const setAccessTokenCookie = (res: Response, token: string) => {
    const isProd = envVars.NODE_ENV === "production"

    cookieUtils.setCookie(res, "accessToken", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        // 1d
        maxAge: 60 * 60 * 60 * 24,
    })
}


const setRefreshTokenCookie = (res: Response, token: string) => {
    // const maxAge = ms(envVars.REFRESH_TOKEN_EXPIRES_IN as StringValue)

    const isProd = envVars.NODE_ENV === "production"

    cookieUtils.setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        // 7d
        maxAge: 60 * 60 * 60 * 24 * 7,
    })
}


const setBetterAuthSessionCookie = (res: Response, token: string) => {
    // const maxAge = ms(envVars.REFRESH_TOKEN_EXPIRES_IN as StringValue)


    const isProd = envVars.NODE_ENV === "production"

    // use the same cookie key expected by `checkAuth` middleware:
    cookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        // 1 day: 
        maxAge: 60 * 60 * 60 * 24,
    })
}


export const tokenUtils = {
    getAccessToken,
    getRefreshToken,

    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie
}