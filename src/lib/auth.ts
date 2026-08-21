import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export async function getUserFromToken() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie) {
    return null;
  }

  const token = tokenCookie.value.replace('Bearer ', '');
  const decoded = verifyToken(token) as { id: string; email: string } | null;

  if (!decoded || !decoded.id) {
    return null;
  }

  return decoded;
}
