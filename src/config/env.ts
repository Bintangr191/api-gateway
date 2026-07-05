export const env = {
  port: Number(process.env.PORT) || 3000,

  jwtSecret: process.env.JWT_SECRET || "",

  authServiceUrl:
    process.env.AUTH_SERVICE_URL || "",

  footballServiceUrl:
    process.env.FOOTBALL_SERVICE_URL || "",

  forumServiceUrl:
    process.env.FORUM_SERVICE_URL || "",

  notificationServiceUrl:
    process.env.NOTIFICATION_SERVICE_URL || "",

  INTERNAL_SECRET:
    process.env.INTERNAL_SECRET || "",
}