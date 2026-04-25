import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroItem {
  id: number;
  type: string;
  title: string;
  backdropPath: string;
  overview: string;
  voteAverage: number;
  releaseDate: string;
  genres: string[];
}

interface HeroCarouselProps {
  items: HeroItem[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextStep();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextStep = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (!items.length) return null;

  const current = items[currentIndex];

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[25/9] rounded-[2rem] overflow-hidden group border border-white/5 shadow-2xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image with Cinematic Overlay */}
          <div className="absolute inset-0">
            <img
              src={current.backdropPath}
              alt={current.title}
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full">
                  <Star className="w-3 h-3 text-blue-400 fill-blue-400" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    {current.voteAverage.toFixed(1)} Rating
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                  <Calendar className="w-3 h-3 text-white/50" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    {new Date(current.releaseDate).getFullYear()}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-none">
                {current.title}
              </h1>

              <p className="text-sm md:text-base text-white/60 line-clamp-3 mb-8 max-w-xl font-medium leading-relaxed">
                {current.overview}
              </p>

              <div className="flex items-center gap-4">
                <Link
                  to={`/item/${current.type}-${current.id}`}
                  state={{ media: current }}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform duration-300"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Assistir Agora
                </Link>
                <Link
                  to={`/item/${current.type}-${current.id}`}
                  state={{ media: current }}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-all duration-300"
                >
                  <Info className="w-4 h-4" />
                  Mais Detalhes
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-8 md:right-16 flex items-center gap-4 z-20">
        <button
          onClick={prevStep}
          className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextStep}
          className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-8 md:left-16 flex items-center gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 rounded-full transition-all duration-500 ${
              idx === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
