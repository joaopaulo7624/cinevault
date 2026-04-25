import { useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// Lenis is disabled — the layout now uses a fixed sidebar with the main
// element as the scroll container (overflow-y-auto). We keep this provider
// only for the route-change scroll-to-top behaviour.
export default function LenisProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // Scroll the main content area back to top on route change
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return <>{children}</>;
}
