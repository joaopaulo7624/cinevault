import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

export function QueryErrorBoundary({ children }: Props) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Não conseguimos carregar os dados. Isso pode ser um problema temporário de conexão ou com a API do TMDB.
              {(error as any)?.message && (
                <code className="block mt-4 p-2 bg-black/50 rounded border border-white/5 text-[10px] text-red-400/80 font-mono">
                  {(error as any).message}
                </code>
              )}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={resetErrorBoundary}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>

              <Link
                to="/"
                onClick={resetErrorBoundary}
                className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white/70 font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <Home className="w-4 h-4" />
                Voltar ao Início
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
