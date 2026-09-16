import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  name?: string | null;
  email: string;
  username: string;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
