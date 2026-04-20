export interface ILoginUserPayload {
    email: string,
    password: string
}

export interface IRegisterPatientPayload {
    name: string,
    email: string,
    password: string
}


export interface IChangePassword {
    currentPassword: string;
    newPassword: string;
}

export interface IForgotPasswordPayload {
    email: string;
}

export interface IResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}
