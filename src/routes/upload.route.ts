import { Hono } from "hono"
import { env } from "../config/env"
import { proxyRequest } from "../utils/proxy"

const uploadRoute = new Hono()

uploadRoute.all("*", async (c) => {

  const path = c.req.path.replace("/upload", "")

  const targetUrl =
    `${env.authServiceUrl}/upload${path}`

  console.log("Forwarding:", targetUrl)

  return proxyRequest(
    targetUrl,
    c.req.raw
  )
})

export default uploadRoute