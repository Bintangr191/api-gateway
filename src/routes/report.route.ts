import { Hono } from "hono"
import { env } from "../config/env"
import { proxyRequest } from "../utils/proxy"
import { authMiddleware } from "../middlewares/auth.middleware"
import { rateLimit } from "../middlewares/rate-limit.middleware"

type AuthUser = { userId: string; role: string; username: string }
type Env = { Variables: { user: AuthUser } }

const reportRoute = new Hono<Env>()

reportRoute.use("*", authMiddleware)
reportRoute.use("*", rateLimit())

reportRoute.all("*", async (c) => {
  const url = new URL(c.req.url)
  const path = url.pathname.replace("/reports", "/api/reports")
  const targetUrl = `${env.reportServiceUrl}${path}${url.search}`

  const user = c.get("user")

  return proxyRequest(
    targetUrl,
    c.req.raw,
    {
      "x-user-id": user.userId,
      "x-user-role": user.role,
      "x-user-username": user.username,
      "x-internal-secret": env.INTERNAL_SECRET,
    }
  )
})

export default reportRoute
