import { z } from "zod";

export const SignupSchema = z.object({
    email : z.string().email(),
    username :z.string(),
    password : z.string().min(8).max(25)
})

export const SigninSchema = z.object({
    email : z.string().email(),
    password : z.string()
})

export const CreateRoomSchema = z.object({
    name : z.string(),
})