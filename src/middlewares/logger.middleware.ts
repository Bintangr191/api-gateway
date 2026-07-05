export const loggerMiddleware =
  async (c: any, next: any) => {

    console.log(
      `[${new Date().toISOString()}]`,
      c.req.method,
      c.req.path
    )

    await next()
  }