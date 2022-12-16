import path from "path";
import * as Yup from "yup";
import { Config } from "./config";

Config.validate();
const config = Config.instance;

const registered = require(path.join(process.cwd(), config.registeredUsersPath)) as string[];
console.log(registered);

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
