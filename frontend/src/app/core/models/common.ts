/** Uniform error body returned by every backend service. */
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
  fieldErrors?: Record<string, string>;
}
