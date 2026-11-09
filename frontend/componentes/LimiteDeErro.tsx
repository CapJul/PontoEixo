'use client';

import { Component, type ReactNode } from 'react';

/**
 * Isola uma parte da tela: se ela falhar, mostra `substituto` em vez de
 * derrubar a página inteira.
 *
 * Usado no 3D para o ambiente de iluminação (Environment), que baixa uma
 * textura de uma CDN externa e pode falhar sem internet.
 */
export default class LimiteDeErro extends Component<
  { children: ReactNode; substituto?: ReactNode },
  { falhou: boolean }
> {
  state = { falhou: false };

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  render() {
    return this.state.falhou ? (this.props.substituto ?? null) : this.props.children;
  }
}
