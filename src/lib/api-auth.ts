import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from './auth';

export async function checkApiAuth(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return null;

  return verifyToken(token);
}
