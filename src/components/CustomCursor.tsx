import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let isHovering = false;

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, input, .magnetic, [role="button"]');

      if (isInteractive && !isHovering) {
        isHovering = true;
        gsap.to(cursor, {
          scale: 3,
          backgroundColor: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          duration: 0.3,
          ease: 'power2.out'
        });
      } else if (!isInteractive && isHovering) {
        isHovering = false;
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          border: '1px solid transparent',
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    // Add style to document head to force hide cursor on all elements
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-3 h-3 -ml-[6px] -mt-[6px] rounded-full bg-white pointer-events-none z-[99999] shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-colors mix-blend-difference"
    />
  );
}
