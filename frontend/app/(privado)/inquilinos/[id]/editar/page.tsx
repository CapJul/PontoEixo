import { Suspense } from 'react';

import EditarInquilino from './EditarInquilino';

// O id do inquilino vem da URL (useParams), que só existe em tempo de execução.
// O Suspense deixa o Next pré-renderizar o resto da página e completar depois.
export default function PaginaEditarInquilino() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Carregando...</div>}>
      <EditarInquilino />
    </Suspense>
  );
}
