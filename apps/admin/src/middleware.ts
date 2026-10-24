import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Oturumu tazeler ve girişi olmayanı giriş ekranına yollar.
 *
 * Supabase yapılandırılmamışsa hiçbir şey yapmıyor: panel gömülü
 * içeriği salt okunur gösterdiği için korunacak bir şey de yok ve
 * geliştirici ortam değişkenleri olmadan paneli gezebiliyor.
 *
 * Yöneticilik burada kontrol edilmiyor, yalnızca giriş. Yetki
 * kontrolü veritabanında: giriş yapmış ama yönetici olmayan biri
 * paneli açar, içerik sorgularından boş döner ve sayfa bunu söyler.
 * Kuralı iki yerde tutmamak için.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured =
  url !== undefined && url.length > 0 && anonKey !== undefined && anonKey.length > 0;

export async function middleware(request: NextRequest) {
  if (!isConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url as string, anonKey as string, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  // `getUser` jetonu sunucuda doğruluyor; süresi dolmuşsa tazeliyor.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === '/login' || pathname.startsWith('/auth');

  if (user === null && !isLoginRoute) {
    const target = request.nextUrl.clone();
    target.pathname = '/login';
    // Girişten sonra istenen sayfaya dönebilmek için.
    target.searchParams.set('next', pathname);
    return NextResponse.redirect(target);
  }

  if (user !== null && isLoginRoute) {
    const target = request.nextUrl.clone();
    target.pathname = '/';
    target.search = '';
    return NextResponse.redirect(target);
  }

  return response;
}

export const config = {
  // Statik dosyalar ve ikon dışındaki her şey.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
