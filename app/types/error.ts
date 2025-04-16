export interface ApplicationError extends Error {
  info: string;
  status: number;
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}
