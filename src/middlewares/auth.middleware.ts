import { verifyToken } from "../utils/jwt"

export const authMiddleware = async (
  c: any,
  next: any
) => {

  const authHeader =
    c.req.header("Authorization")

  if (!authHeader) {
    return c.json(
      {
        success: false,
        message: "Unauthorized"
      },
      401
    )
  }

  const token =
    authHeader.replace("Bearer ", "")

  try {

    const payload =
      verifyToken(token)

    c.set("user", payload)

    await next()

  } catch {

    return c.json(
      {
        success: false,
        message: "Invalid token"
      },
      401
    )
  }
}