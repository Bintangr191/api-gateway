export const roleMiddleware =
  (...roles: string[]) =>
  async (c: any, next: any) => {

    const user = c.get("user")

    if (
      !user ||
      !roles.includes(user.role)
    ) {
      return c.json(
        {
          success: false,
          message: "Forbidden"
        },
        403
      )
    }

    await next()
  }