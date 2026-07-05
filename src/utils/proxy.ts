export async function proxyRequest(
  targetUrl: string,
  request: Request,
  extraHeaders?: Record<string, string>
) {

  const body =
    request.method !== "GET"
      ? await request.text()
      : undefined

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization:
      request.headers.get("Authorization") || "",
  }

  if (extraHeaders) {
    Object.assign(headers, extraHeaders)
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  })

  const data = await response.text()

  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}