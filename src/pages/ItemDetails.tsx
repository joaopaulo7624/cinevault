import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMediaDetails } from '../lib/api';
import { useLibraryStore } from '../store/useLibraryStore';
import { UserMedia, WatchStatus, MediaType } from '../types';
import {
  Star, Clock, Check, Heart, ArrowLeft, Plus,
  Film, Tv, Calendar, Play, Loader2, BookmarkCheck,
  Eye, ListPlus, Tag, X, Trash2, MoreHorizontal, User,
  Clapperboard, PenLine, Building2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const STATUS = [
  { value: 'watched'       as WatchStatus, label: 'Já Assisti',  icon: Eye,      accent: '#a3e635' },
  { value: 'watching'      as WatchStatus, label: 'Assistindo',  icon: Play,     accent: '#38bdf8' },
  { value: 'plan_to_watch' as WatchStatus, label: 'Quero Ver',   icon: ListPlus, accent: '#c084fc' },
];

export default function ItemDetails() {
  const { id: routeId } = useParams();
  const location        = useLocation();
  const navigate        = useNavigate();

  const type      = routeId?.split('-')[0] as MediaType;
  const idNumber  = Number(routeId?.split('-')[1]);
  const storageId = routeId!;

  const { library, addToLibrary, updateMedia, removeFromLibrary } = useLibraryStore();
  const existingItem = library[storageId];

  const { data: media, isLoading } = useQuery({
    queryKey: ['mediaDetails', type, idNumber],
    queryFn:  () => getMediaDetails(idNumber, type),
    initialData: location.state?.media || existingItem?.media,
    staleTime: 1000 * 60 * 60,
  });

  const [status,  setStatus]  = useState<WatchStatus>(existingItem?.status || 'plan_to_watch');
  const [isFav,   setIsFav]   = useState(existingItem?.isFavorite || false);
  const [rating,  setRating]  = useState<number | null>(existingItem?.rating || null);
  const [review,  setReview]  = useState(existingItem?.review || '');
  const [tags,    setTags]    = useState<string[]>(existingItem?.tags || []);
  const [newTag,  setNewTag]  = useState('');
  const [saved,   setSaved]   = useState(false);

  const handleSave = () => {
    if (!media) return;
    const payload = { status, isFavorite: isFav, rating, review, tags };
    if (existingItem) updateMedia(storageId, payload);
    else addToLibrary({ id: storageId, media, dateAdded: new Date().toISOString(), ...payload } as UserMedia);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = () => { removeFromLibrary(storageId); navigate('/library'); };
  const addTag = () => {
    const t = newTag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setNewTag('');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  );
  if (!media) return (
    <div className="min-h-screen flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
      Não encontrado.
    </div>
  );

  const year        = media.releaseDate ? new Date(media.releaseDate).getFullYear() : null;
  const hrs         = media.runtime ? `${Math.floor(media.runtime / 60)}h ${media.runtime % 60}m` : null;
  const popularity  = media.popularity ? Math.min(Math.round(media.popularity), 100) : null;
  const releaseFormatted = media.releaseDate
    ? new Date(media.releaseDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="relative min-h-screen bg-[#05050c] font-sans overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-100">

      {/* ── Cinematic Hero Backdrop ── */}
      {media.backdropPath && (
        <div className="absolute top-0 left-0 w-full h-[65vh] z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#05050c]/40 mix-blend-multiply z-10" />
          <img
            src={media.backdropPath}
            alt=""
            className="w-full h-full object-cover opacity-30 blur-[2px] scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Fades */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050c] via-[#05050c]/60 to-transparent z-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05050c] via-[#05050c]/30 to-transparent z-20" />
        </div>
      )}

      {/* ── Back button ── */}
      <motion.button
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-white/50 hover:text-white transition-all backdrop-blur-xl border border-white/[0.05] bg-[#05050c]/50 hover:bg-[#05050c]/80 hover:border-white/20"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar
      </motion.button>

      {/* ══════════════════════════════════════════════
          MAIN LAYOUT
      ══════════════════════════════════════════════ */}
      <div className="relative z-30 max-w-[1200px] mx-auto px-6 md:px-10 pt-[15vh] md:pt-[22vh] pb-24">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">

          {/* ══ LEFT COLUMN (Poster & Actions) ═════════ */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[260px] lg:max-w-[290px] shrink-0 mx-auto md:mx-0 flex flex-col gap-6"
          >
            {/* Poster */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/[0.08] aspect-[2/3] bg-white/[0.02]">
              {media.posterPath ? (
                <img
                  src={media.posterPath}
                  alt={media.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {media.type === 'movie' ? <Film className="w-12 h-12 text-white/10 stroke-[1]" /> : <Tv className="w-12 h-12 text-white/10 stroke-[1]" />}
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col gap-3">
              {/* Watch Status List */}
              <div className="flex flex-col gap-1 p-1.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                {STATUS.map(opt => {
                  const active = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
                      style={
                        active
                          ? { background: `rgba(${opt.accent === '#38bdf8' ? '56,189,248' : opt.accent === '#c084fc' ? '192,132,252' : '163,230,53'},0.12)`, color: opt.accent }
                          : { color: 'rgba(255,255,255,0.4)' }
                      }
                    >
                      <opt.icon className="w-4 h-4" strokeWidth={active ? 2.5 : 1.5} />
                      {opt.label}
                      {active && <Check className="ml-auto w-4 h-4" />}
                    </button>
                  );
                })}
              </div>

              {/* Fav & Save Row */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setIsFav(!isFav)}
                  className="flex-1 flex justify-center py-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.05] transition-colors"
                  style={isFav ? { borderColor: 'rgba(251,191,36,0.4)', color: '#fbbf24', background: 'rgba(251,191,36,0.1)' } : { color: 'rgba(255,255,255,0.4)' }}
                >
                  <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                </button>

                <button
                  onClick={handleSave}
                  className="flex-[3] flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
                  style={
                    saved
                      ? { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }
                      : { background: 'white', color: 'black' }
                  }
                >
                  {saved ? 'Salvo!' : existingItem ? 'Atualizar' : 'Salvar'}
                </button>
              </div>

              {/* Remove */}
              {existingItem && (
                <button
                  onClick={handleRemove}
                  className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-500/40 hover:text-red-400 text-center py-2 transition-colors"
                >
                  Remover da Biblioteca
                </button>
              )}
            </div>
          </motion.div>

          {/* ══ RIGHT COLUMN (Info, Log, Cast) ═════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 min-w-0 space-y-12 md:mt-8"
          >
            
            {/* ─ Header & Meta ─ */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                <span className="flex items-center gap-1.5 text-white/70">
                  {media.type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                  {media.type === 'movie' ? 'Filme' : 'Série'}
                </span>
                <span>•</span>
                <span>{year || '—'}</span>
                <span>•</span>
                <span>{hrs || '—'}</span>
                {media.voteAverage > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {media.voteAverage.toFixed(1)}
                    </span>
                  </>
                )}
                {existingItem && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20">
                      Na Biblioteca
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05]">
                {media.title}
              </h1>

              {media.tagline && (
                <p className="text-[16px] md:text-[18px] text-emerald-400/70 italic font-light tracking-wide">
                  "{media.tagline}"
                </p>
              )}

              {media.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {media.genres.map((g: string) => (
                    <span
                      key={g}
                      className="px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] text-white/50 border border-white/[0.06] bg-white/[0.02]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ─ Synopsis ─ */}
            {media.overview && (
              <p className="text-[14px] md:text-[15px] text-white/60 leading-[1.8] max-w-[800px] font-light">
                {media.overview}
              </p>
            )}

            {/* ─ Personal Diary Section ─ */}
            <div className="border-y border-white/[0.06] py-10 space-y-8 bg-gradient-to-r from-white/[0.01] to-transparent -mx-6 px-6 md:mx-0 md:px-0">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                <PenLine className="w-3.5 h-3.5" />
                Seu Diário
              </h3>

              <div className="flex flex-col xl:flex-row gap-10">
                {/* Rating */}
                <div className="shrink-0 space-y-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Sua Avaliação</p>
                  <div className="flex gap-1.5 flex-wrap max-w-[200px] xl:max-w-none">
                    {[1,2,3,4,5,6,7,8,9,10].map(val => {
                      const active = rating === val;
                      const filled = rating !== null && val <= rating;
                      return (
                        <button
                          key={val}
                          onClick={() => setRating(val === rating ? null : val)}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-150"
                          style={{
                            background: active ? '#a3e635' : filled ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
                            borderColor: active ? '#a3e635' : filled ? 'rgba(163,230,53,0.35)' : 'rgba(255,255,255,0.08)',
                            color: active ? '#000' : filled ? '#a3e635' : 'rgba(255,255,255,0.3)',
                            transform: active ? 'scale(1.15)' : 'none',
                          }}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="flex-1 space-y-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Anotações Privadas</p>
                  <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder="Escreva seus pensamentos, detalhes que gostou, críticas..."
                    maxLength={1000}
                    rows={3}
                    className="w-full bg-transparent border-b border-white/[0.1] focus:border-emerald-400/50 resize-none text-[13px] md:text-[14px] text-white/80 placeholder-white/20 pb-2 transition-colors focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Tags inline */}
              <div className="space-y-3 pt-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Tags
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map(t => (
                    <span key={t} className="group flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-md">
                      {t}
                      <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-emerald-500/50 hover:text-emerald-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text" value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    placeholder="+ Adicionar tag (Enter)"
                    className="bg-transparent text-[11px] font-bold uppercase tracking-wider text-white/60 placeholder-white/20 focus:outline-none min-w-[150px] px-2 py-1.5"
                  />
                </div>
              </div>
            </div>

            {/* ─ Production Info ─ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { label: 'Direção',    value: media.director },
                { label: 'Roteiro',    value: media.writer },
                { label: 'Lançamento', value: releaseFormatted },
                { label: 'Produção',   value: media.production },
              ].filter(r => r.value).map(row => (
                <div key={row.label}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">{row.label}</p>
                  <p className="text-[12px] font-semibold text-white/80 mt-1.5 leading-snug">{row.value}</p>
                </div>
              ))}
            </div>

            {/* ─ Cast List ─ */}
            {media.cast?.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-white/[0.06]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Elenco Principal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-4">
                  {media.cast.slice(0, 12).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.06] shrink-0 flex items-center justify-center">
                        {p.profilePath ? (
                          <img src={p.profilePath} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white/90 truncate">{p.name}</p>
                        <p className="text-[10px] text-white/40 truncate">{p.character || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
