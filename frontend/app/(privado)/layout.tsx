import type { ReactNode } from 'react';

import GuardaSessao from '@/componentes/GuardaSessao';

/** Layout das páginas que exigem login (home, contratos, inquilinos, IR...). */
export default function LayoutPrivado({ children }: { children: ReactNode }) {
  return <GuardaSessao>{children}</GuardaSessao>;
}
