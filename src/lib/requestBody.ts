export class RequestBodyError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

/** Limit actual bytes before JSON or multipart parsing, including chunked requests. */
export async function readBoundedBody(req: Request, maxBytes: number): Promise<Buffer> {
  if (Number(req.headers.get('content-length')) > maxBytes) {
    throw new RequestBodyError('Слишком большой запрос.', 413);
  }
  const reader = req.body?.getReader();
  if (!reader) throw new RequestBodyError('Пустой запрос.', 400);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError('Слишком большой запрос.', 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export async function readBoundedJson(req: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const raw = await readBoundedBody(req, maxBytes);
  let value: unknown;
  try { value = JSON.parse(raw.toString('utf8')); }
  catch { throw new RequestBodyError('Некорректный JSON.', 400); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestBodyError('Ожидается объект запроса.', 400);
  }
  return value as Record<string, unknown>;
}

export async function readBoundedForm(req: Request, maxBytes: number): Promise<FormData> {
  const bytes = await readBoundedBody(req, maxBytes);
  try {
    return await new Response(new Uint8Array(bytes), {
      headers: { 'content-type': req.headers.get('content-type') || '' },
    }).formData();
  } catch { throw new RequestBodyError('Некорректный файл.', 400); }
}
