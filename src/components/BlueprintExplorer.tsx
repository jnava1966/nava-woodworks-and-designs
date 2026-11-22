import { useState } from 'react';
import { Crosshair, Download, Maximize2 } from 'lucide-react';
import {
  BLUEPRINT_VIEWS,
  CUTLIST_SHEETS,
  DIGITAL_WORKFLOW_STEPS,
  TYPE_S01_COMPONENTS,
  type BlueprintView,
  type CutlistSheet,
} from '../data/studioData';
import { ResilientImage } from './ResilientImage';
import { publicAssetUrl } from '../utils';

interface BlueprintExplorerProps {
  onInspectImage: (image: string, title: string, caption: string) => void;
}

function calcVolumeCm3(dims: [number, number, number], qty: number): number {
  return (dims[0] * dims[1] * dims[2] * qty) / 1000;
}

export function BlueprintExplorer({ onInspectImage }: BlueprintExplorerProps) {
  const [activeViewId, setActiveViewId] = useState<BlueprintView['id']>('type-s01');
  const [selectedPartId, setSelectedPartId] = useState<string>(TYPE_S01_COMPONENTS[0].id);
  const [activeCutlistId, setActiveCutlistId] = useState<CutlistSheet['id']>('type-s01');

  const activeView = BLUEPRINT_VIEWS.find((v) => v.id === activeViewId) ?? BLUEPRINT_VIEWS[0];
  const selectedPart =
    TYPE_S01_COMPONENTS.find((part) => part.id === selectedPartId) ?? TYPE_S01_COMPONENTS[0];
  const activeCutlist =
    CUTLIST_SHEETS.find((sheet) => sheet.id === activeCutlistId) ?? CUTLIST_SHEETS[0];

  const totalPieces = activeCutlist.items.reduce((acc, item) => acc + item.qty, 0);
  const totalGrossVolumeCm3 = activeCutlist.items.reduce(
    (acc, item) => acc + calcVolumeCm3(item.grossDimsMm, item.qty),
    0
  );
  // 1 board foot (pie tablar) = 2,359.737 cm³
  const totalBoardFeet = totalGrossVolumeCm3 / 2359.737;

  const handleSelectBlueprintView = (viewId: BlueprintView['id']) => {
    setActiveViewId(viewId);
    if (viewId === 'type-s01' || viewId === 'wd-101' || viewId === 'pins-study') {
      setActiveCutlistId('type-s01');
    } else if (viewId === 'chair-bom' || viewId === 'chair-cad') {
      setActiveCutlistId('sillon-e01');
    } else if (viewId === 'banca-bom') {
      setActiveCutlistId('banca');
    } else if (viewId === 'castle-joint') {
      setActiveCutlistId('mobiliario-autor');
    }
  };

  const handleSelectCutlist = (sheet: CutlistSheet) => {
    setActiveCutlistId(sheet.id);
    setActiveViewId(sheet.blueprintViewId);
  };

  return (
    <section id="ingenieria" className="py-16 lg:py-24 border-b border-[#1C1612]/10 bg-[#EFECE5]/60">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header + Mode Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium text-[#9A6B2F] tracking-wide">
              01. Ingeniería de Ensambles
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1612] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Despiece técnico y uniones sin clavos
            </h2>
            <p className="text-[15px] text-[#4A4037] leading-relaxed">
              Cada pieza se proyecta primero en planos de despiece a escala para verificar tolerancias
              de fricción, orientación de la veta y cubicaje de pino antes de tocar el formón.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Láminas técnicas"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#E5E0D6] rounded-lg self-start lg:self-auto"
          >
            {BLUEPRINT_VIEWS.map((view) => {
              const isActive = view.id === activeViewId;
              return (
                <button
                  key={view.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectBlueprintView(view.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#F7F5F0] text-[#1C1612] shadow-sm'
                      : 'text-[#574D44] hover:text-[#1C1612]'
                  }`}
                >
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Blueprint Stage + Component List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Blueprint Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className={`relative rounded-xl overflow-hidden border border-[#1C1612]/12 aspect-[16/9] ${
                activeView.fitMode === 'contain' ? 'bg-white p-2' : 'bg-[#E5E1D8]'
              }`}
            >
              <ResilientImage
                src={activeView.image}
                alt={activeView.alt}
                className={`w-full h-full ${
                  activeView.fitMode === 'contain' ? 'object-contain' : 'object-cover'
                }`}
                fallbackTitle={activeView.label}
              />

              {/* Interactive Pins for Type S-01 Exploded Blueprint */}
              {activeViewId === 'type-s01' &&
                TYPE_S01_COMPONENTS.map((part, idx) => {
                  const isSelected = part.id === selectedPartId;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setSelectedPartId(part.id)}
                      aria-label={`Inspeccionar ${part.name}`}
                      style={{ left: `${part.pin.x}%`, top: `${part.pin.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-medium tabular-nums transition-transform duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A6B2F] ${
                        isSelected
                          ? 'bg-[#9A6B2F] text-white scale-110 shadow-md ring-4 ring-[#9A6B2F]/25'
                          : 'bg-[#1C1612]/85 text-[#F7F5F0] hover:bg-[#9A6B2F] hover:scale-105'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}

              {/* Action Triggers */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {activeView.pdfUrl && (
                  <a
                    href={publicAssetUrl(activeView.pdfUrl)}
                    download="Plano_CAD_Sillon_Ergonomico_E01.pdf"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#9A6B2F] hover:bg-[#7F5623] text-white rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{activeView.pdfLabel ?? 'PDF Técnico'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onInspectImage(activeView.image, activeView.label, activeView.notes)
                  }
                  aria-label="Ampliar lámina técnica"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1C1612]/85 hover:bg-[#1C1612] text-[#F7F5F0] rounded-md transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ampliar Lámina</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#574D44] px-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1C1612]">{activeView.subtitle}</span>
              </div>
              <span className="font-mono tabular-nums">{activeView.scaleLabel}</span>
            </div>
            <p className="text-sm text-[#4A4037] leading-relaxed px-1">{activeView.notes}</p>
          </div>

          {/* Synchronized Component Inspector */}
          <div className="lg:col-span-5 bg-[#F7F5F0] border border-[#1C1612]/12 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1C1612]/10 pb-4">
              <div>
                <p className="text-xs text-[#6B5E52]">Despiece Oficial Tipo S-01</p>
                <h3 className="font-display text-2xl font-semibold text-[#1C1612]">
                  Componentes y Tolerancias
                </h3>
              </div>
              <span className="font-mono text-xs text-[#9A6B2F] tabular-nums">6 piezas</span>
            </div>

            <div className="space-y-2">
              {TYPE_S01_COMPONENTS.map((part, idx) => {
                const isSelected = part.id === selectedPartId;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => {
                      setActiveViewId('type-s01');
                      setSelectedPartId(part.id);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFECE5] border-[#9A6B2F]/60 text-[#1C1612]'
                        : 'bg-transparent border-[#1C1612]/10 text-[#4A4037] hover:border-[#1C1612]/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono text-xs w-5 h-5 rounded-full inline-flex items-center justify-center shrink-0 tabular-nums ${
                            isSelected
                              ? 'bg-[#9A6B2F] text-white'
                              : 'bg-[#1C1612]/10 text-[#1C1612]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-[#1C1612] truncate">
                          {part.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#6B5E52] shrink-0 tabular-nums">
                        {part.quantity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Component Detail Readout */}
            <div className="pt-4 border-t border-[#1C1612]/10 space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#9A6B2F]">
                  <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                  {selectedPart.code} · {selectedPart.joinery}
                </span>
                <span className="font-mono text-[#1C1612] tabular-nums">
                  {selectedPart.tolerance}
                </span>
              </div>
              <p className="text-sm text-[#4A4037] leading-relaxed">{selectedPart.description}</p>
            </div>
          </div>
        </div>

        {/* Technical Cutlist & Lumber Volume Sheet (Madera de Pino) */}
        <div className="mt-12 bg-[#F7F5F0] border border-[#1C1612]/12 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#1C1612]/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#9A6B2F]">{activeCutlist.subtitle}</p>
                <h3 className="font-display text-2xl font-semibold text-[#1C1612]">
                  {activeCutlist.title}
                </h3>
              </div>

              <a
                href={publicAssetUrl(activeCutlist.csvPath)}
                download={activeCutlist.csvFilename}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#1C1612] bg-[#EFECE5] hover:bg-[#E5E0D6] border border-[#1C1612]/15 rounded-md transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-[#9A6B2F]" aria-hidden="true" />
                <span>Descargar Hoja Técnica (CSV)</span>
              </a>
            </div>

            <div
              role="tablist"
              aria-label="Seleccionar lista de corte"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#E5E0D6] rounded-lg"
            >
              {CUTLIST_SHEETS.map((sheet) => {
                const isSelected = sheet.id === activeCutlist.id;
                return (
                  <button
                    key={sheet.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCutlist(sheet)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C1612] text-[#F7F5F0] shadow-sm'
                        : 'text-[#574D44] hover:text-[#1C1612]'
                    }`}
                  >
                    {sheet.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1C1612]/10 bg-[#EFECE5]/50 text-xs font-medium text-[#574D44]">
                  <th className="py-3.5 px-5 whitespace-nowrap">Pieza</th>
                  <th className="py-3.5 px-5">Descripción del Componente</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Cant.</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Dimensión Bruta</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Dimensión Neta Acabada</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap">Cubicaje Bruto</th>
                  <th className="py-3.5 px-5">Tipo de Ensamble y Mecanizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1612]/10 text-sm">
                {activeCutlist.items.map((row) => {
                  const rowVol = calcVolumeCm3(row.grossDimsMm, row.qty);
                  const isRowSelected =
                    activeCutlist.id === 'type-s01' &&
                    (selectedPartId === row.componentId ||
                      selectedPart.linkedCutCode === row.code);

                  return (
                    <tr
                      key={row.code}
                      onClick={() => {
                        if (activeCutlist.id === 'type-s01') {
                          setActiveViewId('type-s01');
                          setSelectedPartId(row.componentId);
                        }
                      }}
                      className={`transition-colors ${
                        activeCutlist.id === 'type-s01' ? 'cursor-pointer' : ''
                      } ${isRowSelected ? 'bg-[#EFECE5]/80' : 'hover:bg-[#EFECE5]/40'}`}
                    >
                      <td className="py-4 px-5 font-mono text-xs font-medium text-[#9A6B2F] whitespace-nowrap tabular-nums">
                        {row.code}
                      </td>
                      <td className="py-4 px-5 font-semibold text-[#1C1612] whitespace-nowrap">
                        {row.description}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-right text-[#1C1612] tabular-nums">
                        {row.qty}
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-[#4A4037] whitespace-nowrap tabular-nums">
                        {row.grossDimensions}
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-[#1C1612] whitespace-nowrap tabular-nums">
                        {row.netDimensions}
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-right text-[#4A4037] whitespace-nowrap tabular-nums">
                        {rowVol.toLocaleString('es-MX', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}{' '}
                        cm³
                      </td>
                      <td className="py-4 px-5 text-xs text-[#4A4037] leading-relaxed min-w-[260px]">
                        {row.machining}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#1C1612]/15 bg-[#EFECE5]/70 text-xs font-medium text-[#1C1612]">
                  <td className="py-3.5 px-5 font-mono">TOTAL</td>
                  <td className="py-3.5 px-5 text-[#574D44]">{activeCutlist.thicknessNote}</td>
                  <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                    {totalPieces}
                  </td>
                  <td className="py-3.5 px-5 text-[#574D44]" colSpan={2}>
                    Cubicaje bruto ({totalBoardFeet.toFixed(2)} pies tablares netos)
                  </td>
                  <td className="py-3.5 px-5 font-mono text-right tabular-nums whitespace-nowrap">
                    {totalGrossVolumeCm3.toLocaleString('es-MX', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{' '}
                    cm³
                  </td>
                  <td className="py-3.5 px-5 text-[#574D44]">
                    {activeCutlist.footerActionNote}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Digital Engineering Workflow (Solidworks / OpenSCAD -> Exploded Views) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {DIGITAL_WORKFLOW_STEPS.map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-xl bg-[#F7F5F0] border border-[#1C1612]/12 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#1C1612]">{item.step}</p>
                <span className="font-mono text-[11px] text-[#9A6B2F]">{item.tool}</span>
              </div>
              <p className="text-xs text-[#4A4037] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
