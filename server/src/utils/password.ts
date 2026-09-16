import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword?: string | null
): Promise<boolean> => {
  if (!hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
};
