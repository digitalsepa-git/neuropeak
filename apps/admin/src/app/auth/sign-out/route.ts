import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/auth';

/**
 * Çıkış. POST: bir bağlantıya tıklamak ya da bir sayfayı önden
 * yüklemek kimseyi oturumundan atmasın.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (supabase !== null) await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}
