import { Hono } from "hono"
import { env } from "../config/env"
import { proxyRequest } from "../utils/proxy"
import { authMiddleware } from "../middlewares/auth.middleware"
import { rateLimit } from "../middlewares/rate-limit.middleware"

type AuthUser = {
  userId: string
  role: string
  email: string
}

type Env = {
  Variables: {
    user: AuthUser
  }
}

const footballRoute = new Hono<Env>()

footballRoute.use("*", authMiddleware)
footballRoute.use("*", rateLimit())

footballRoute.all("*", async (c) => {

  const url = new URL(c.req.url)
  const path = url.pathname.replace("/football", "")
  const targetUrl =
    `${env.footballServiceUrl}/football${path}${url.search}`

  const user = c.get("user")

  return proxyRequest(
    targetUrl,
    c.req.raw,
    {
      "x-user-id": user.userId,
      "x-user-role": user.role,
      "x-user-email": user.email,
      "x-internal-secret": env.INTERNAL_SECRET,
    }
  )
})

export default footballRoute
