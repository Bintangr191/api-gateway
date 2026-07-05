export const rateLimit = (
  limit = 100,
  windowMs = 60 * 1000
) => {

  const store = new Map<
    string,
    { count: number; resetAt: number }
  >()

  return async (c: any, next: any) => {

    const ip =
      c.req.header("x-forwarded-for") ||
      "unknown"

    const now = Date.now()

    const data = store.get(ip)

    if (!data) {
      store.set(ip, {
        count: 1,
        resetAt: now + windowMs
      })

      return next()
    }

    if (now > data.resetAt) {
      store.set(ip, {
        count: 1,
        resetAt: now + windowMs
      })

      return next()
    }

    data.count++

    if (data.count > limit) {
      return c.json(
        {
          success: false,
          message: "Too many requests"
        },
        429
      )
    }

    await next()
  }
}