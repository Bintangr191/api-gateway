import { Hono } from "hono"
import { cors } from "hono/cors"

import authRoute from "./routes/auth.route"
import footballRoute from "./routes/football.route"
import uploadRoute from "./routes/upload.route"
import forumRoute from "./routes/forum.route"
// import notificationRoute from "./routes/notification.route"

import { loggerMiddleware } from "./middlewares/logger.middleware"
import { authMiddleware } from "./middlewares/auth.middleware"

const app = new Hono()

app.use("*", cors())
app.use("*", loggerMiddleware)

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "api-gateway",
  })
})

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
)

app.route("/auth", authRoute)
app.route("/football", footballRoute)
app.route("/upload", uploadRoute)
app.route("/forum", forumRoute)
// app.route("/notification", notificationRoute)

export default {
  port: 3000,
  fetch: app.fetch,
}