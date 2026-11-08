/** Caixa de mensagem usada nos formulários (erro em vermelho, sucesso em verde). */
export default function AvisoErro({
  mensagem,
  tipo = 'erro',
}: {
  mensagem: string | null;
  tipo?: 'erro' | 'sucesso';
}) {
  if (!mensagem) return null;

  const cores =
    tipo === 'erro'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-green-50 border-green-200 text-green-700';

  return (
    <div role={tipo === 'erro' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${cores}`}>
      {mensagem}
    </div>
  );
}
