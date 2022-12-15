import * as Yup from "yup";
const registered = require("../data/registered.json") as string[];

export const signInSchema = Yup.object().shape({
    username: Yup.string().required(),
    password: Yup.string().required(),
});

export const signUpSchema = signInSchema.concat(
    Yup.object().shape({
        email: Yup.string().email().required(),
    })
);

export const hasRegisteredOnVITCEvents = (email: string) => registered.includes(email);

export const isYupErr = (err: any): err is Yup.ValidationError => err.name === "ValidationError";
