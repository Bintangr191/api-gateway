import jwt from "jsonwebtoken"
import { env } from "../config/env"

export const verifyToken = (token: string) => {
  return jwt.verify(
    token,
    env.jwtSecret
  )
}