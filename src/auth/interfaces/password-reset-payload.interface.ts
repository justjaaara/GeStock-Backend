export interface PasswordResetPayload {
  userId: number;
  email: string;
  type: string; // JWT payload from client; keep as string for runtime validation
  ip: string;
  timestamp: number;
}
