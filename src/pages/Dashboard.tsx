import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { PlayCircle, Eye, Star, Clock, TrendingUp, BarChart2, Layers, Heart, Sparkles, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { motion } from 'motion/react';
import { cascadeContainer, cinematicItem } from '../lib/animations';

// ─── Recharts custom tooltip ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,10,16,0.95)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 10,
      padding: '8px 14px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
      backdropFilter: 'blur(16px)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
        Nota {label}
      </p>
      <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
        {payload[0].value} {payload[0].value === 1 ? 'filme' : 'filmes'}
      </p>
    </div>
  );
};

// ─── Custom pie legend ────────────────────────────────────────────────────────
const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3">
    {payload?.map((entry: any, i: number) => (
      <span key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
        <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
        {entry.value}
      </span>
    ))}
  </div>
);

export default function Dashboard() {
  const library = useLibraryStore(state => state.library);
  const user = useAuthStore(state => state.user);
  
  const items = useMemo(() => Object.values(library), [library]);

  const statsData = useMemo(() => {
    const watched   = items.filter(i => i.status === 'watched');
    const watching  = items.filter(i => i.status === 'watching');
    const planned   = items.filter(i => i.status === 'plan_to_watch');
    const favorites = items.filter(i => i.isFavorite);
    
    const totalMin  = watched.reduce((acc, curr) => acc + (curr.media.runtime || 120), 0);
    const daysSpent = (totalMin / 60 / 24).toFixed(1);

    const ratedItems = watched.filter(w => w.rating);
    const avgRating  = ratedItems.length
      ? (ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length).toFixed(1)
      : '—';

    // Genre distribution
    const genresCount: Record<string, number> = {};
    items.forEach(item => item.media.genres.forEach(g => { genresCount[g] = (genresCount[g] || 0) + 1; }));
    const genreData = Object.entries(genresCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Ratings distribution
    const ratingsCount: Record<number, number> = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0 };
    ratedItems.forEach(item => { if (item.rating) ratingsCount[item.rating]++; });
    const ratingData = Object.entries(ratingsCount).map(([r, c]) => ({ rating: r, count: c }));

    return {
      watched,
      watching,
      planned,
      favorites,
      daysSpent,
      avgRating,
      genreData,
      ratingData
    };
  }, [items]);

  const { watched, watching, planned, favorites, genreData, ratingData } = statsData;

  const { data: trending } = useQuery({
    queryKey: ['trending-all'],
    queryFn: () => api.getTrendingMedia('all'),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const CHART_COLORS = ['#3b82f6','#06b6d4','#8b5cf6','#f59e0b','#10b981'];

  const stats = [
    {
      label: 'Assistidos',    value: statsData.watched.length,   icon: Eye,        accent: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)',
    },
    {
      label: 'Assistindo',   value: statsData.watching.length,  icon: PlayCircle,  accent: '#06b6d4',
      bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.18)',
    },
    {
      label: 'Nota Média',   value: statsData.avgRating,        icon: Star,         accent: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)',
    },
    {
      label: 'Favoritos',    value: statsData.favorites.length, icon: Heart,        accent: '#ec4899',
      bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.18)',
    },
  ];

  const firstName = user?.name?.split(' ')[0] || 'Cinéfilo';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="min-h-screen">
      <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 pb-24">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.2em]">Visão Geral</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {greeting}, <span className="text-blue-400">{firstName}</span> 👋
          </h1>
          <p className="text-[13px] text-white/40 mt-1">
            Você tem <span className="text-white/70 font-medium">{items.length}</span> títulos na sua coleção.
          </p>
        </motion.header>

        {/* ── Stats Cards ─────────────────────────────────────────── */}
        <motion.div
          variants={cascadeContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={cinematicItem}>
              <div
                className="relative rounded-xl p-5 flex flex-col gap-4 overflow-hidden border transition-all duration-300 hover:scale-[1.02]"
                style={{ background: stat.bg, borderColor: stat.border }}
              >
                {/* Glow orb */}
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
                  style={{ background: stat.accent }}
                />

                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.15em]">
                    {stat.label}
                  </p>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${stat.accent}20`, border: `1px solid ${stat.accent}30` }}
                  >
                    <stat.icon className="w-4 h-4" style={{ color: stat.accent }} strokeWidth={1.8} />
                  </div>
                </div>

                <p
                  className="text-4xl font-bold tracking-tight"
                  style={{ color: stat.accent, textShadow: `0 0 30px ${stat.accent}60` }}
                >
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Charts Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Bar chart — wider */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <div
              className="rounded-xl border p-6 h-full"
              style={{
                background: 'rgba(255,255,255,0.025)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-4 h-4 text-blue-400/70" />
                <h3 className="text-[12px] font-semibold text-white/60 uppercase tracking-[0.12em]">
                  Distribuição de Notas
                </h3>
              </div>
              <div className="h-[220px]">
                {watched.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <XAxis
                        dataKey="rating"
                        axisLine={false} tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false} tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                      <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={34}>
                        {ratingData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={`rgba(59,130,246,${0.3 + (Number(entry.rating) / 10) * 0.65})`}
                            stroke={`rgba(59,130,246,${0.2 + (Number(entry.rating) / 10) * 0.4})`}
                            strokeWidth={1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-white/20">
                    <Star className="w-9 h-9 stroke-[1]" />
                    <p className="text-[11px] font-medium uppercase tracking-widest">Avalie um título para ver o gráfico</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Pie chart — narrower */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <div
              className="rounded-xl border p-6 h-full flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.025)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-amber-400/70" />
                <h3 className="text-[12px] font-semibold text-white/60 uppercase tracking-[0.12em]">
                  Gêneros Favoritos
                </h3>
              </div>
              <div className="flex-1 min-h-[200px]">
                {genreData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <RechartsTooltip
                        contentStyle={{
                          background: 'rgba(10,10,16,0.95)',
                          border: '1px solid rgba(255,255,255,0.09)',
                          borderRadius: 10,
                          padding: '8px 14px',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(16px)',
                          fontFamily: 'Inter',
                          fontSize: 12,
                        }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Pie
                        data={genreData}
                        cx="50%" cy="46%"
                        innerRadius={45}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={3}
                        cornerRadius={4}
                        stroke="none"
                      >
                        {genreData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />
                        ))}
                      </Pie>
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-white/20">
                    <Layers className="w-9 h-9 stroke-[1]" />
                    <p className="text-[11px] font-medium uppercase tracking-widest text-center">
                      Adicione filmes para ver os seus gêneros
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Progress Bar: Lista de pendências ──────────────────── */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.15em] mb-4">Progresso da Coleção</p>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'Assistidos',   count: watched.length,   color: '#3b82f6' },
                { label: 'Assistindo',   count: watching.length,  color: '#06b6d4' },
                { label: 'Quero Ver',    count: planned.length,   color: '#8b5cf6' },
                { label: 'Favoritos',    count: favorites.length, color: '#f59e0b' },
              ].map(seg => {
                const pct = items.length > 0 ? Math.round((seg.count / items.length) * 100) : 0;
                return (
                  <div key={seg.label} className="flex-1 min-w-[100px]">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] text-white/40 font-medium">{seg.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: seg.color }}>{seg.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5, duration: 0.9, ease: [0.22,1,0.36,1] }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${seg.color}99, ${seg.color})` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Trending Section ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-[13px] font-semibold text-white/70">Tendências da Semana</h3>
            </div>
            <Link to="/discover" className="text-[10px] font-bold text-blue-400/60 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-1 group">
              Ver tudo <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {trending?.slice(0, 6).map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
              >
                <Link
                  to={`/item/${item.id}`}
                  state={{ media: item }}
                  className="group relative block aspect-[2/3] rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300"
                >
                  <img
                    src={item.posterPath}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[9px] font-bold text-white/90">{item.voteAverage.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {!trending && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-white/[0.03] animate-pulse border border-white/[0.05]" />
            ))}
          </div>
        </motion.div>

        {/* ── Recent Activity ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-0.5 h-4 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
            <h3 className="text-[13px] font-semibold text-white/70">Atividade Recente</h3>
            <span className="text-[9px] text-white/20 font-medium bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 rounded-full uppercase tracking-widest ml-auto">
              {items.length} títulos
            </span>
          </div>

          {items.length === 0 ? (
            <div
              className="rounded-xl border p-16 text-center"
              style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex flex-col items-center gap-4 text-white/20">
                <Eye className="w-10 h-10 stroke-[1]" />
                <p className="text-[11px] font-medium uppercase tracking-[0.15em]">Sua atividade aparecerá aqui</p>
                <Link to="/search" className="text-[10px] text-blue-400/60 hover:text-blue-400 transition-colors uppercase tracking-[0.15em] font-semibold">
                  Buscar filmes →
                </Link>
              </div>
            </div>
          ) : (
            <motion.div
              variants={cascadeContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {items
                .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                .slice(0, 6)
                .map((item) => {
                  const statusLabel = item.status === 'watched' ? 'Assistido' : item.status === 'watching' ? 'Assistindo' : 'Quero ver';
                  const statusColor = item.status === 'watched' ? '#3b82f6' : item.status === 'watching' ? '#06b6d4' : '#8b5cf6';
                  return (
                    <motion.div key={item.id} variants={cinematicItem}>
                      <Link
                        to={`/item/${item.id}`}
                        className="flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200 group hover:scale-[1.01]"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          borderColor: 'rgba(255,255,255,0.06)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                      >
                        {item.media.posterPath ? (
                          <img
                            src={item.media.posterPath}
                            alt={item.media.title}
                            className="w-11 h-11 rounded-lg object-cover shrink-0 shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 border border-white/[0.06]">
                            <span className="text-[8px] font-bold text-white/20 uppercase">{item.media.title.substring(0,3)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">
                            {item.media.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}30` }}
                            >
                              {statusLabel}
                            </span>
                            {item.rating && (
                              <span className="text-[10px] text-amber-400/70 font-medium">★ {item.rating}</span>
                            )}
                          </div>
                        </div>
                        {item.isFavorite && (
                          <Heart className="w-3.5 h-3.5 text-pink-400/60 fill-pink-400/30 shrink-0" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
