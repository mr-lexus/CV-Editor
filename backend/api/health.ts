type ResponseLike = {
  status(code: number): ResponseLike
  json(body: unknown): void
}

export default async function handler(_request: unknown, response: ResponseLike): Promise<void> {
  response.status(200).json({ ok: true })
}
