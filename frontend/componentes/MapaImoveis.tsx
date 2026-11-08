'use client';

/**
 * Mapa geográfico (OpenStreetMap) com um marcador por imóvel.
 *
 * O Leaflet depende do `window`, então este componente é carregado na home
 * com `next/dynamic` e `ssr: false`.
 */

import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { formatarReais } from '@/lib/formatacao';
import { CORES_STATUS, ROTULOS_STATUS, ROTULOS_TIPO, type Imovel } from '@/lib/imoveis';

// Centro da Ilha de São Luís
const CENTRO_PADRAO: [number, number] = [-2.54, -44.18];

function criarIcone(cor: string) {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${cor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function CapturarClique({ aoClicar }: { aoClicar: (latitude: number, longitude: number) => void }) {
  useMapEvents({ click: (e) => aoClicar(e.latlng.lat, e.latlng.lng) });
  return null;
}

interface Props {
  imoveis: Imovel[];
  aoEditar: (imovel: Imovel) => void;
  /** Clique em um ponto vazio do mapa (usado para cadastrar um imóvel naquele local). */
  aoClicarNoMapa: (latitude: number, longitude: number) => void;
}

export default function MapaImoveis({ imoveis, aoEditar, aoClicarNoMapa }: Props) {
  const centro: [number, number] =
    imoveis.length > 0 ? [imoveis[0].latitude, imoveis[0].longitude] : CENTRO_PADRAO;

  return (
    <MapContainer center={centro} zoom={11} style={{ width: '100%', height: '100%' }} zoomControl={false}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CapturarClique aoClicar={aoClicarNoMapa} />
      {imoveis.map((imovel) => (
        <Marker
          key={imovel.id}
          position={[imovel.latitude, imovel.longitude]}
          icon={criarIcone(CORES_STATUS[imovel.status])}
        >
          <Popup offset={[0, -10]}>
            <div className="min-w-[180px] p-1">
              <h3 className="font-bold text-slate-900 text-lg m-0">{imovel.nome}</h3>
              <p className="text-slate-500 text-xs mb-3 mt-1 uppercase">
                {ROTULOS_TIPO[imovel.tipo]} · {ROTULOS_STATUS[imovel.status]}
              </p>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200 mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase">Valor</span>
                <span className="font-bold text-slate-800">{formatarReais(imovel.valor_aluguel)}/mês</span>
              </div>
              <button
                onClick={() => aoEditar(imovel)}
                className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Editar imóvel
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
