import { Hono } from "hono"
import { env } from "../config/env"
import { proxyRequest } from "../utils/proxy"

const authRoute = new Hono()

authRoute.all("*", async (c) => {

  const path = c.req.path.replace("/auth", "")

  const targetUrl =
    `${env.authServiceUrl}/auth${path}`

  console.log("Forwarding:", targetUrl)

  return proxyRequest(
    targetUrl,
    c.req.raw
  )
})

export default authRoute