export class AlectraApiError extends Error {
  override readonly name = "AlectraApiError";

  constructor(
    message: string,
    readonly status?: number,
    readonly details?: readonly string[],
  ) {
    super(message);
  }
}
