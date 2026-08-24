'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/Navigation';

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <>
      {!isLogin && <Navigation />}
      <div className={isLogin ? '' : 'pt-[68px]'}>{children}</div>
    </>
  );
}
