export function httpError(message: string, statusCode: number): Error {
  const err = new Error(message);
  (err as Error & { statusCode: number }).statusCode = statusCode;
  return err;
}
