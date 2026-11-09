import { redirect } from 'next/navigation';

// A raiz leva para a Visão Geral; sem sessão, o layout privado manda para o login.
export default function Inicio() {
  redirect('/home');
}
