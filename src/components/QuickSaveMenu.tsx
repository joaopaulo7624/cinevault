import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, Check, PlayCircle, Clock, Heart, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { WatchStatus, UserMedia } from '../types';
import { cn } from '../lib/utils';

interface QuickSaveMenuProps {
  item: any;
  className?: string;
}

export function QuickSaveMenu({ item, className }: QuickSaveMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const { library, addToLibrary, removeFromLibrary, updateMedia } = useLibraryStore();
  const { user } = useAuthStore();

  const itemId = `${item.type}-${item.id}`;
  const libItem = library[itemId];
  const isFavorite = libItem?.isFavorite || false;
  const currentStatus = libItem?.status || null;

  // Calculate position every time we open
  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 200;
      // Try to open to the right of the button, but flip left if near edge
      let left = rect.left;
      if (left + menuWidth > window.innerWidth - 12) {
        left = rect.right - menuWidth;
      }
      setMenuPos({ top: rect.bottom + 6, left });
    }
    setIsOpen((prev) => !prev);
  };

  // Close on scroll
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [isOpen]);

  const buildUserMedia = (status: WatchStatus, favorite: boolean): UserMedia => ({
    id: itemId,
    media: { ...item, id: item.id },
    status,
    rating: libItem?.rating ?? null,
    review: libItem?.review ?? '',
    tags: libItem?.tags ?? [],
    isFavorite: favorite,
    dateAdded: libItem?.dateAdded ?? new Date().toISOString(),
  });

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  const handleStatus = (e: React.MouseEvent, status: WatchStatus) => {
    stop(e);
    if (!user) { alert('Faça login para salvar na sua biblioteca!'); setIsOpen(false); return; }
    addToLibrary(buildUserMedia(status, isFavorite));
    setIsOpen(false);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    stop(e);
    if (!user) { alert('Faça login para salvar na sua biblioteca!'); setIsOpen(false); return; }
    if (!libItem) addToLibrary(buildUserMedia('plan_to_watch', true));
    else updateMedia(itemId, { isFavorite: !isFavorite });
    setIsOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    stop(e);
    removeFromLibrary(itemId);
    setIsOpen(false);
  };

  const actions = [
    {
      key: 'favorite',
      label: isFavorite ? 'Favoritado' : 'Favoritar',
      icon: Heart,
      active: isFavorite,
      accent: '#f59e0b',
      glow: 'rgba(245,158,11,0.1)',
      extraStyle: isFavorite ? { fill: 'currentColor' } : {},
      onClick: handleFavorite,
    },
    {
      key: 'watching',
      label: 'Assistindo',
      icon: PlayCircle,
      active: currentStatus === 'watching',
      accent: '#38bdf8',
      glow: 'rgba(56,189,248,0.1)',
      onClick: (e: React.MouseEvent) => handleStatus(e, 'watching'),
    },
    {
      key: 'watched',
      label: 'Já Assisti',
      icon: Check,
      active: currentStatus === 'watched',
      accent: '#34d399',
      glow: 'rgba(52,211,153,0.1)',
      onClick: (e: React.MouseEvent) => handleStatus(e, 'watched'),
    },
    {
      key: 'plan_to_watch',
      label: 'Quero Ver',
      icon: Clock,
      active: currentStatus === 'plan_to_watch',
      accent: '#a78bfa',
      glow: 'rgba(167,139,250,0.1)',
      onClick: (e: React.MouseEvent) => handleStatus(e, 'plan_to_watch'),
    },
  ];

  const dropdown = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Global backdrop to close */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={(e) => { stop(e); setIsOpen(false); }}
          />

          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 400, mass: 0.8 }}
            onClick={stop}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              width: 200,
              zIndex: 9999,
              background: 'linear-gradient(145deg, rgba(13,13,20,0.98) 0%, rgba(8,8,14,0.99) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12,
              boxShadow: '0 16px 48px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              overflow: 'hidden',
            }}
          >
            {/* Title */}
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 3 }}>
                Salvar como
              </p>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.72)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title}
              </p>
            </div>

            {/* Actions */}
            <div style={{ padding: '4px 6px' }}>
              {actions.map((action, i) => (
                <motion.button
                  key={action.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={action.onClick}
                  className="group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 8px',
                    borderRadius: 8,
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    background: action.active ? action.glow : 'transparent',
                    borderColor: action.active ? `${action.accent}22` : 'transparent',
                    position: 'relative',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => {
                    if (!action.active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={e => {
                    if (!action.active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {/* Left accent bar when active */}
                  {action.active && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 2, borderRadius: 4,
                      background: action.accent,
                    }} />
                  )}

                  {/* Icon box */}
                  <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: action.active ? `${action.accent}20` : 'rgba(255,255,255,0.04)',
                    flexShrink: 0,
                    transition: 'background 0.12s',
                  }}>
                    <action.icon
                      style={{ width: 13, height: 13, color: action.active ? action.accent : 'rgba(255,255,255,0.35)', ...action.extraStyle }}
                      strokeWidth={action.key === 'watched' ? 2.5 : 1.8}
                    />
                  </div>

                  {/* Label */}
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: action.active ? action.accent : 'rgba(255,255,255,0.45)',
                    letterSpacing: '0.01em',
                    flex: 1, textAlign: 'left',
                  }}>
                    {action.label}
                  </span>

                  {/* Active dot */}
                  {action.active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: action.accent, flexShrink: 0 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Remove */}
            {libItem && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 10px' }} />
                <div style={{ padding: '4px 6px 6px' }}>
                  <button
                    onClick={handleRemove}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '8px 8px', borderRadius: 8,
                      border: '1px solid transparent', cursor: 'pointer',
                      background: 'transparent', transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.15)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: 7,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.03)',
                    }}>
                      <Trash2 style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.25)' }} strokeWidth={1.8} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>
                      Remover
                    </span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn('relative', className)} style={{ isolation: 'isolate' }}>
      <motion.button
        ref={btnRef}
        onClick={openMenu}
        whileTap={{ scale: 0.88 }}
        className={cn(
          'w-[26px] h-[26px] rounded-md flex items-center justify-center transition-all duration-150',
          'border backdrop-blur-md',
          isOpen
            ? 'bg-white/15 border-white/25 text-white'
            : 'bg-black/55 border-white/10 text-white/60 hover:text-white hover:bg-black/70 hover:border-white/20',
        )}
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </motion.button>

      {createPortal(dropdown, document.body)}
    </div>
  );
}
