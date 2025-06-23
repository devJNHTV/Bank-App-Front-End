export interface ApiResponseWrapper<T> {
  status: number;
  message: string;
  data: T | null;
}