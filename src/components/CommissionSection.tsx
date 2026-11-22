import { useEffect, useState } from 'react';
import { Check, Download, Mail, Minus, Plus } from 'lucide-react';
import {
  BRAND_INFO,
  E01_QUOTATION_BREAKDOWN,
  E01_QUOTE_SOURCE_PATH,
  METAL_OPTIONS,
  QUOTE_CATALOG,
  SURFACE_FINISH_OPTIONS,
  T01_QUOTATION_BREAKDOWN,
  T01_QUOTE_SOURCE_PATH,
  WOOD_OPTIONS,
  type QuoteCatalogItem,
} from '../data/studioData';
import { publicAssetUrl } from '../utils';

interface CommissionSectionProps {
  selectedQuoteId: QuoteCatalogItem['id'];
  onSelectQuoteId: (id: QuoteCatalogItem['id']) => void;
}

function getVolumeDiscountRate(quantity: number): { rate: number; label: string } {
  if (quantity >= 10) {
    return { rate: 0.15, label: '15% descuento por volumen (10+ piezas · Cabañas / Hospitalidad)' };
  }
  if (quantity >= 4) {
    return { rate: 0.08, label: '8% descuento por volumen (4–9 piezas · Residencial)' };
  }
  return { rate: 0, label: 'Tarifa oficial v8.0 de taller (1–3 piezas)' };
}

function getMetalUnitAddon(metalId: string): number {
  if (metalId === 'brushed-brass') return 450;
  if (metalId === 'brushed-steel') return 650;
  if (metalId === 'steel-concrete') return 750;
  return 0;
}

function formatMxn(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const DIMENSION_PRESETS: Record<
  string,
  { widthCm: number; depthCm: number; heightCm: number }
> = {
  'Sillón Ergonómico (E-01)': { widthCm: 95, depthCm: 60, heightCm: 90 },
  'Banca Ergonómica': { widthCm: 142, depthCm: 60, heightCm: 90 },
  'Mesas de Autor': { widthCm: 180, depthCm: 90, heightCm: 75 },
  'Estanterías Modulares': { widthCm: 120, depthCm: 38, heightCm: 180 },
  'Cabañas y Decks': { widthCm: 300, depthCm: 250, heightCm: 45 },
};

function calcDimensionFactor(widthCm: number, depthCm: number, heightCm: number): number {
  const refMetric = 95 * 0.55 + 60 * 0.25 + 90 * 0.2;
  const currentMetric = widthCm * 0.55 + depthCm * 0.25 + heightCm * 0.2;
  return Math.max(0.75, currentMetric / refMetric);
}

export function CommissionSection({
  selectedQuoteId,
  onSelectQuoteId,
}: CommissionSectionProps) {
  const selectedWood = WOOD_OPTIONS[0];
  const [quantity, setQuantity] = useState<number>(1);
  const [includePackaging, setIncludePackaging] = useState<boolean>(false);
  const [selectedMetalId, setSelectedMetalId] = useState(METAL_OPTIONS[0].id);
  const [selectedFinishId, setSelectedFinishId] = useState(SURFACE_FINISH_OPTIONS[1].id);
  const [archCategory, setArchCategory] = useState('Sillón Ergonómico (E-01)');
  const [widthCm, setWidthCm] = useState<number>(95);
  const [depthCm, setDepthCm] = useState<number>(60);
  const [heightCm, setHeightCm] = useState<number>(90);
  const [breakdownTab, setBreakdownTab] = useState<'materials' | 'labor' | 'commercial'>('commercial');
  const [breakdownModel, setBreakdownModel] = useState<'t01-s01' | 'e01'>(
    selectedQuoteId === 'sillon-e01' || selectedQuoteId === 'proyecto-medida' ? 'e01' : 't01-s01'
  );

  useEffect(() => {
    if (selectedQuoteId === 'sillon-e01') {
      setBreakdownModel('e01');
      if (archCategory !== 'Sillón Ergonómico (E-01)' && archCategory !== 'Banca Ergonómica') {
        setArchCategory('Sillón Ergonómico (E-01)');
        setWidthCm(95);
        setDepthCm(60);
        setHeightCm(90);
      }
    } else if (selectedQuoteId === 'proyecto-medida') {
      setBreakdownModel('e01');
      if (archCategory === 'Sillón Ergonómico (E-01)') {
        setArchCategory('Mesas de Autor');
        setWidthCm(180);
        setDepthCm(90);
        setHeightCm(75);
      }
    } else if (selectedQuoteId === 'taburete-t01' || selectedQuoteId === 'soporte-s01') {
      setBreakdownModel('t01-s01');
    }
  }, [selectedQuoteId, archCategory]);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedProduct =
    QUOTE_CATALOG.find((item) => item.id === selectedQuoteId) ?? QUOTE_CATALOG[0];
  const selectedMetal = METAL_OPTIONS.find((m) => m.id === selectedMetalId) ?? METAL_OPTIONS[0];
  const selectedFinish =
    SURFACE_FINISH_OPTIONS.find((f) => f.id === selectedFinishId) ?? SURFACE_FINISH_OPTIONS[0];

  const activeProductBreakdown =
    selectedProduct.isCustomQuote ? E01_QUOTATION_BREAKDOWN : T01_QUOTATION_BREAKDOWN;

  const activeBreakdown =
    breakdownModel === 'e01' ? E01_QUOTATION_BREAKDOWN : T01_QUOTATION_BREAKDOWN;
  const activeBreakdownCsvPath =
    breakdownModel === 'e01' ? E01_QUOTE_SOURCE_PATH : T01_QUOTE_SOURCE_PATH;
  const activeBreakdownCsvName =
    breakdownModel === 'e01'
      ? 'Tabulador_Sillon_Banca_Mobiliario_Autor_Pino_v8.csv'
      : 'Cotizacion_Taburete_Tipo_T01_Pino_v8.csv';

  const isStandardPiece = !selectedProduct.isCustomQuote;
  const volumeTier = getVolumeDiscountRate(quantity);
  const metalAddon = getMetalUnitAddon(selectedMetal.id);
  const packagingUnit = includePackaging ? activeProductBreakdown.packagingAddonWithIva : 0;

  // Same material & labor base schedule for Sillón Ergonómico, Banca, and Mobiliario de Autor scaled by requested dimensions
  const dimensionFactor = selectedProduct.isCustomQuote
    ? calcDimensionFactor(widthCm, depthCm, heightCm)
    : 1;
  const scaledCustomMaterials = Number(
    (E01_QUOTATION_BREAKDOWN.materialsTotal * dimensionFactor).toFixed(2)
  );
  const scaledCustomLabor = Number(
    (E01_QUOTATION_BREAKDOWN.laborTotal * dimensionFactor).toFixed(2)
  );
  const scaledCustomHours = Number(
    (E01_QUOTATION_BREAKDOWN.laborTotalHours * dimensionFactor).toFixed(1)
  );
  const scaledCustomBoardFeet = Math.round(18 * dimensionFactor);
  // Base final factor (direct * 1.15 indirect * 1.10 margin * 1.16 IVA) matches E01_QUOTATION_BREAKDOWN exactly
  const scaledCustomUnitWithIva = Number(
    ((scaledCustomMaterials + scaledCustomLabor) * 1.15 * 1.1 * 1.16).toFixed(2)
  );

  const baseUnitPrice = selectedProduct.isCustomQuote
    ? scaledCustomUnitWithIva
    : selectedProduct.unitPriceMxn;
  const baseUnitWithMetal = baseUnitPrice + metalAddon;
  const discountedUnit = Number(
    (baseUnitWithMetal * (1 - volumeTier.rate) + packagingUnit).toFixed(2)
  );
  const estimatedSubtotal = Number((discountedUnit * quantity).toFixed(2));

  const volumeWeeks = quantity >= 8 ? 2 : quantity >= 4 ? 1 : 0;
  const dimensionWeeks = selectedProduct.isCustomQuote && dimensionFactor >= 1.6 ? 1 : 0;
  const estimatedWeeks =
    selectedProduct.baseWeeks + selectedMetal.extraWeeks + volumeWeeks + dimensionWeeks;

  const deliveryTimeLabel =
    isStandardPiece && quantity === 1 && selectedMetal.extraWeeks === 0
      ? activeProductBreakdown.leadTime
      : `${estimatedWeeks} ${estimatedWeeks === 1 ? 'semana est.' : 'semanas est.'}`;

  const handleSelectProduct = (id: QuoteCatalogItem['id']) => {
    onSelectQuoteId(id);
    if (id === 'sillon-e01' || id === 'proyecto-medida') {
      setBreakdownModel('e01');
    } else if (id === 'taburete-t01' || id === 'soporte-s01') {
      setBreakdownModel('t01-s01');
    }
  };

  const handleSelectSpecialty = (cat: string) => {
    setArchCategory(cat);
    const preset = DIMENSION_PRESETS[cat];
    if (preset) {
      setWidthCm(preset.widthCm);
      setDepthCm(preset.depthCm);
      setHeightCm(preset.heightCm);
    }
  };

  const updateQuantity = (next: number) => {
    const clamped = Math.max(1, Math.min(60, Math.round(next) || 1));
    setQuantity(clamped);
  };

  const updateDimension = (setter: (v: number) => void, raw: number, min: number, max: number) => {
    const next = Math.max(min, Math.min(max, Math.round(raw) || min));
    setter(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) {
      setFormError('Por favor ingresa tu nombre y correo electrónico para preparar la cotización.');
      return;
    }
    setFormError(null);
    const code = `NW-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedRef(code);

    const subject = selectedProduct.isCustomQuote
      ? `Cotización ${code} - ${quantity}x ${archCategory} (${widthCm}×${depthCm}×${heightCm} cm)`
      : `Cotización ${code} - ${quantity}x ${selectedProduct.name}`;

    const body = [
      `Folio: ${code}`,
      `Nombre: ${clientName}`,
      `Correo del cliente: ${clientEmail}`,
      `Línea: ${selectedProduct.name}`,
      selectedProduct.isCustomQuote ? `Pieza / Especialidad: ${archCategory}` : null,
      selectedProduct.isCustomQuote
        ? `Medidas Solicitadas: ${widthCm} cm largo × ${depthCm} cm fondo × ${heightCm} cm alto`
        : null,
      `Cantidad: ${quantity} piezas (${volumeTier.label})`,
      `Madera: ${selectedWood.name}`,
      `Construcción: ${selectedMetal.name}`,
      `Acabado: ${selectedFinish.name}`,
      `Empaque de Protección: ${includePackaging ? `Sí (+${formatMxn(activeProductBreakdown.packagingAddonWithIva)} MXN c/IVA por unidad)` : 'No (Entrega en Taller Bahía de Kino)'}`,
      `Estimado con IVA (16%): ${formatMxn(estimatedSubtotal)} MXN (${formatMxn(discountedUnit)}/pza${selectedProduct.isCustomQuote ? ' · sujeto a plano final según medidas' : ''})`,
      `Notas: ${notes || 'Sin notas adicionales'}`,
    ].filter(Boolean).join('\n');

    window.location.href = `mailto:${BRAND_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const mailSubject = selectedProduct.isCustomQuote
    ? `Cotización ${submittedRef ?? ''} - ${quantity}x ${archCategory} (${widthCm}×${depthCm}×${heightCm} cm)`
    : `Cotización ${submittedRef ?? ''} - ${quantity}x ${selectedProduct.name}`;

  const mailBody = [
    `Nombre: ${clientName}`,
    `Línea: ${selectedProduct.name}`,
    selectedProduct.isCustomQuote ? `Pieza / Especialidad: ${archCategory}` : null,
    selectedProduct.isCustomQuote
      ? `Medidas Solicitadas: ${widthCm} cm largo × ${depthCm} cm fondo × ${heightCm} cm alto`
      : null,
    `Cantidad: ${quantity} piezas (${volumeTier.label})`,
    `Madera: ${selectedWood.name}`,
    `Construcción: ${selectedMetal.name}`,
    `Acabado: ${selectedFinish.name}`,
    `Empaque de Protección: ${includePackaging ? `Sí (+${formatMxn(activeProductBreakdown.packagingAddonWithIva)} MXN c/IVA por unidad)` : 'No (Entrega en Taller Bahía de Kino)'}`,
    `Estimado con IVA (16%): ${formatMxn(estimatedSubtotal)} MXN (${formatMxn(discountedUnit)}/pza${selectedProduct.isCustomQuote ? ' · sujeto a plano final según medidas' : ''})`,
    `Notas: ${notes}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <section id="encargos" className="py-16 lg:py-24 bg-[#F7F5F0]">
      <div className="max-w-[1240px] mx-auto px-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Interactive Volume Quote & Specification Configurator */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#9A6B2F] tracking-wide">
                04. Cotizador Oficial y Encargos
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1612] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Calcula tu pedido en Pino Regional Macizo
              </h2>
              <p className="text-[15px] text-[#4A4037] leading-relaxed max-w-xl">
                Cotiza según el volumen de taburetes Tipo T-01 o pedestales Tipo S-01 (precio fijo
                v8.0), o calcula tu presupuesto para <strong>Sillón Ergonómico</strong>,{' '}
                <strong>Banca</strong> y <strong>Mobiliario de Autor</strong>, los cuales comparten
                el mismo tabulador de material y mano de obra ajustado a las medidas que solicites.
              </p>
            </div>

            {/* Sole Material Specification: Pino Regional Macizo */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#EFECE5] border border-[#1C1612]/12 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: selectedWood.toneHex }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-[#1C1612] tracking-wide">
                    Madera Única del Taller: {selectedWood.name}
                  </span>
                </div>
                <span className="text-xs text-[#6B5E52]">
                  Garantía 5 años · Sellador higroscópico + UV
                </span>
              </div>
              <p className="text-xs text-[#574D44] leading-relaxed">{selectedWood.grainNote}</p>
            </div>

            {/* Step 1: Product Line Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#1C1612] tracking-wide">
                1. Pieza o Línea de Producción
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUOTE_CATALOG.map((item) => {
                  const active = item.id === selectedProduct.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectProduct(item.id)}
                      className={`text-left p-4 rounded-xl border transition-colors duration-150 cursor-pointer flex flex-col justify-between gap-2 ${
                        active
                          ? 'bg-[#EFECE5] border-[#9A6B2F] text-[#1C1612]'
                          : 'bg-white/60 border-[#1C1612]/12 hover:border-[#1C1612]/30'
                      }`}
                    >
                      <div>
                        <span className="font-mono text-[11px] text-[#9A6B2F]">{item.code}</span>
                        <p className="text-sm font-semibold text-[#1C1612] mt-0.5">{item.name}</p>
                      </div>
                      <p className="font-mono text-xs text-[#574D44] tabular-nums">
                        {item.isCustomQuote
                          ? 'Según medidas solicitadas'
                          : `${formatMxn(item.unitPriceMxn)} c/IVA`}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#574D44]">{selectedProduct.summary}</p>
            </div>

            {/* Step 2: Specialty & Requested Dimensions (for Sillón/Banca/Mobiliario de Autor) + Volume Stepper */}
            <div className="space-y-4">
              {selectedProduct.isCustomQuote && (
                <div className="space-y-4 p-4 sm:p-5 rounded-xl bg-white/75 border border-[#1C1612]/12">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-xs font-semibold text-[#1C1612] tracking-wide">
                        2A. Modelo o Especialidad (Mismo Tabulador Base)
                      </label>
                      <span className="text-[11px] font-medium text-[#9A6B2F]">
                        Mismo costo de material y mano de obra
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'Sillón Ergonómico (E-01)',
                        'Banca Ergonómica',
                        'Mesas de Autor',
                        'Estanterías Modulares',
                        'Cabañas y Decks',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleSelectSpecialty(cat)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-left ${
                            archCategory === cat
                              ? 'bg-[#1C1612] text-[#F7F5F0] border-[#1C1612]'
                              : 'bg-[#F7F5F0] text-[#1C1612] border-[#1C1612]/12 hover:border-[#1C1612]/30'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[#1C1612]/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#1C1612] tracking-wide">
                        2B. Medidas Solicitadas (cm)
                      </span>
                      <span className="font-mono text-[11px] text-[#6B5E52] tabular-nums">
                        Ref. ~{scaledCustomBoardFeet} PT · {scaledCustomHours.toFixed(1)} hrs taller
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor="dim-width"
                          className="block text-[11px] font-medium text-[#574D44] mb-1"
                        >
                          Largo (cm)
                        </label>
                        <input
                          id="dim-width"
                          type="number"
                          min={40}
                          max={450}
                          value={widthCm}
                          onChange={(e) => updateDimension(setWidthCm, Number(e.target.value), 40, 450)}
                          className="w-full px-3 py-2 font-mono text-sm font-semibold bg-[#F7F5F0] border border-[#1C1612]/15 rounded-md text-[#1C1612] tabular-nums focus:outline-none focus:border-[#9A6B2F]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="dim-depth"
                          className="block text-[11px] font-medium text-[#574D44] mb-1"
                        >
                          Fondo (cm)
                        </label>
                        <input
                          id="dim-depth"
                          type="number"
                          min={30}
                          max={350}
                          value={depthCm}
                          onChange={(e) => updateDimension(setDepthCm, Number(e.target.value), 30, 350)}
                          className="w-full px-3 py-2 font-mono text-sm font-semibold bg-[#F7F5F0] border border-[#1C1612]/15 rounded-md text-[#1C1612] tabular-nums focus:outline-none focus:border-[#9A6B2F]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="dim-height"
                          className="block text-[11px] font-medium text-[#574D44] mb-1"
                        >
                          Alto (cm)
                        </label>
                        <input
                          id="dim-height"
                          type="number"
                          min={35}
                          max={260}
                          value={heightCm}
                          onChange={(e) => updateDimension(setHeightCm, Number(e.target.value), 35, 260)}
                          className="w-full px-3 py-2 font-mono text-sm font-semibold bg-[#F7F5F0] border border-[#1C1612]/15 rounded-md text-[#1C1612] tabular-nums focus:outline-none focus:border-[#9A6B2F]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="volume-quantity"
                    className="block text-xs font-semibold text-[#1C1612] tracking-wide"
                  >
                    {selectedProduct.isCustomQuote ? '2C.' : '2.'} Volumen del Pedido (Piezas)
                  </label>
                  <span className="text-xs font-medium text-[#9A6B2F]">{volumeTier.label}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center border border-[#1C1612]/20 bg-white rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(quantity - 1)}
                      aria-label="Disminuir cantidad"
                      className="w-11 h-11 flex items-center justify-center text-[#1C1612] hover:bg-[#EFECE5] transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      id="volume-quantity"
                      type="number"
                      min={1}
                      max={60}
                      value={quantity}
                      onChange={(e) => updateQuantity(Number(e.target.value))}
                      className="w-16 h-11 text-center font-mono text-sm font-semibold text-[#1C1612] tabular-nums focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(quantity + 1)}
                      aria-label="Aumentar cantidad"
                      className="w-11 h-11 flex items-center justify-center text-[#1C1612] hover:bg-[#EFECE5] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Batch Presets */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[1, 4, 8, 12, 20].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={`px-3 py-2 font-mono text-xs rounded-md border transition-colors tabular-nums cursor-pointer ${
                          quantity === preset
                            ? 'bg-[#1C1612] text-[#F7F5F0] border-[#1C1612]'
                            : 'bg-white/60 text-[#4A4037] border-[#1C1612]/15 hover:border-[#1C1612]/35'
                        }`}
                      >
                        {preset} {preset === 1 ? 'pza' : 'pzas'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Protective Packaging for Freight (MAT-05 from v8.0) */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-white/70 border border-[#1C1612]/12 cursor-pointer hover:border-[#1C1612]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={includePackaging}
                  onChange={(e) => setIncludePackaging(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#9A6B2F] cursor-pointer"
                />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-xs font-semibold text-[#1C1612] block">
                      Empaque y Embalaje de Protección (MAT-05 para Envíos Flete)
                    </span>
                    <span className="text-xs text-[#574D44]">
                      Opcional si el pedido no se recoge directo en Taller Bahía de Kino.
                    </span>
                  </div>
                  <span className="font-mono text-xs font-medium text-[#9A6B2F] tabular-nums shrink-0">
                    +{formatMxn(activeProductBreakdown.packagingAddonWithIva)} / pza
                  </span>
                </div>
              </label>
            </div>

            {/* Step 3: Hybrid Metal Accent */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#1C1612] tracking-wide">
                3. Construcción Híbrida y Herrajes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {METAL_OPTIONS.map((metal) => {
                  const active = metal.id === selectedMetalId;
                  const addon = getMetalUnitAddon(metal.id);
                  return (
                    <button
                      key={metal.id}
                      type="button"
                      onClick={() => setSelectedMetalId(metal.id)}
                      className={`text-left p-4 rounded-xl border transition-colors duration-150 cursor-pointer ${
                        active
                          ? 'bg-[#EFECE5] border-[#9A6B2F] text-[#1C1612]'
                          : 'bg-white/60 border-[#1C1612]/12 hover:border-[#1C1612]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="w-4 h-4 rounded-sm border border-black/15 shrink-0"
                          style={{ backgroundColor: metal.swatchHex }}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-[11px] text-[#6B5E52] tabular-nums">
                          {addon === 0 ? 'Incluido' : `+${formatMxn(addon)}/pza`}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#1C1612]">{metal.name}</p>
                      <p className="text-xs text-[#574D44] mt-1">{metal.finish}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Surface Finish & UV Protection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#1C1612] tracking-wide">
                4. Acabado y Protección Costera
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SURFACE_FINISH_OPTIONS.map((finish) => {
                  const active = finish.id === selectedFinishId;
                  return (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => setSelectedFinishId(finish.id)}
                      className={`text-left p-4 rounded-xl border transition-colors duration-150 cursor-pointer ${
                        active
                          ? 'bg-[#EFECE5] border-[#9A6B2F] text-[#1C1612]'
                          : 'bg-white/60 border-[#1C1612]/12 hover:border-[#1C1612]/30'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#1C1612]">{finish.name}</p>
                      <p className="text-xs text-[#574D44] mt-1 leading-relaxed">
                        {finish.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Contiguous Summary & Inquiry Form */}
          <div className="lg:col-span-5 bg-[#EFECE5] border border-[#1C1612]/12 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#1C1612]/12 pb-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-2xl font-semibold text-[#1C1612]">
                  Cotización Comercial
                </h3>
                <span className="font-mono text-xs text-[#9A6B2F] tabular-nums">
                  {deliveryTimeLabel}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-[#F7F5F0] border border-[#1C1612]/10 space-y-1.5">
                {selectedProduct.isCustomQuote && (
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#1C1612]/10">
                    <span className="text-[11px] font-semibold text-[#9A6B2F]">
                      Estimación según medidas ({widthCm} × {depthCm} × {heightCm} cm)
                    </span>
                    <span className="font-mono text-[11px] text-[#574D44] tabular-nums">
                      {archCategory}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-[#6B5E52]">
                    {selectedProduct.isCustomQuote
                      ? `Estimado c/IVA 16% (${quantity} ${quantity === 1 ? 'pza' : 'pzas'})`
                      : `Total con IVA 16% (${quantity} ${quantity === 1 ? 'pza' : 'pzas'})`}
                  </span>
                  <span className="font-display text-3xl font-semibold text-[#1C1612] tabular-nums">
                    {formatMxn(estimatedSubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#574D44] tabular-nums">
                  <span>
                    {selectedProduct.isCustomQuote
                      ? 'Referencia unitaria (mismo tabulador)'
                      : 'Precio unitario final'}
                  </span>
                  <span className="font-mono font-medium text-[#1C1612]">
                    {formatMxn(discountedUnit)} MXN / pza
                  </span>
                </div>
                {selectedProduct.isCustomQuote && (
                  <p className="text-[11px] text-[#6B5E52] pt-1">
                    Materiales est. {formatMxn(scaledCustomMaterials)} + Mano de obra est.{' '}
                    {formatMxn(scaledCustomLabor)} ({scaledCustomHours.toFixed(1)} hrs) antes de
                    indirectos, margen e IVA.
                  </p>
                )}
              </div>

              <dl className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between gap-4 py-1 border-b border-[#1C1612]/8">
                  <dt className="text-[#6B5E52]">Pieza / Línea</dt>
                  <dd className="font-medium text-[#1C1612] text-right">
                    {selectedProduct.isCustomQuote ? archCategory : selectedProduct.name}
                  </dd>
                </div>
                {selectedProduct.isCustomQuote && (
                  <div className="flex justify-between gap-4 py-1 border-b border-[#1C1612]/8">
                    <dt className="text-[#6B5E52]">Medidas Solicitadas</dt>
                    <dd className="font-mono font-medium text-[#1C1612] text-right tabular-nums">
                      {widthCm} × {depthCm} × {heightCm} cm
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 py-1 border-b border-[#1C1612]/8">
                  <dt className="text-[#6B5E52]">Madera</dt>
                  <dd className="font-medium text-[#1C1612] text-right">{selectedWood.name}</dd>
                </div>
                <div className="flex justify-between gap-4 py-1 border-b border-[#1C1612]/8">
                  <dt className="text-[#6B5E52]">Construcción</dt>
                  <dd className="font-medium text-[#1C1612] text-right">{selectedMetal.name}</dd>
                </div>
                <div className="flex justify-between gap-4 py-1 border-b border-[#1C1612]/8">
                  <dt className="text-[#6B5E52]">Entrega / Empaque</dt>
                  <dd className="font-medium text-[#1C1612] text-right">
                    {includePackaging ? 'Envío con embalaje (+MAT-05)' : 'Taller Bahía de Kino'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-1">
                  <dt className="text-[#6B5E52]">Garantía Estructural</dt>
                  <dd className="font-medium text-[#1C1612] text-right">
                    5 años en ensambles
                  </dd>
                </div>
              </dl>
            </div>

            {submittedRef ? (
              <div className="bg-[#F7F5F0] border border-[#9A6B2F]/40 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2.5 text-[#1C1612]">
                  <span className="w-7 h-7 rounded-full bg-[#9A6B2F] text-white inline-flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      Solicitud {submittedRef} Preparada
                    </p>
                    <p className="text-xs text-[#574D44]">
                      Taller Nava Woodworks · Bahía de Kino
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#4A4037] leading-relaxed">
                  Gracias, <span className="font-medium text-[#1C1612]">{clientName}</span>. Hemos
                  registrado tu solicitud para{' '}
                  {selectedProduct.isCustomQuote
                    ? `${quantity} × ${archCategory} (${widthCm}×${depthCm}×${heightCm} cm · est. ${formatMxn(estimatedSubtotal)} MXN c/IVA)`
                    : `${quantity} × ${selectedProduct.name} (${formatMxn(estimatedSubtotal)} MXN c/IVA)`}
                  . Juan Nava responderá a <span className="font-medium">{clientEmail}</span> con
                  planos y orden de fabricación.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={`mailto:${BRAND_INFO.email}?subject=${encodeURIComponent(
                      mailSubject
                    )}&body=${encodeURIComponent(mailBody)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#F7F5F0] bg-[#1C1612] rounded-md hover:bg-[#33271F] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Abrir en Correo</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRef(null);
                      setNotes('');
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#1C1612] border border-[#1C1612]/20 rounded-md hover:bg-[#E5E0D6] transition-colors cursor-pointer"
                  >
                    Nueva Cotización
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="client-name" className="block text-xs font-medium text-[#4A4037] mb-1.5">
                      Nombre completo
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#1C1612]/15 rounded-md text-[#1C1612] placeholder:text-[#8E8276] focus:outline-none focus:border-[#9A6B2F]"
                    />
                  </div>
                  <div>
                    <label htmlFor="client-email" className="block text-xs font-medium text-[#4A4037] mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      id="client-email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="nombre@correo.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#1C1612]/15 rounded-md text-[#1C1612] placeholder:text-[#8E8276] focus:outline-none focus:border-[#9A6B2F]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="project-notes" className="block text-xs font-medium text-[#4A4037] mb-1.5">
                    Dimensiones aproximadas o destino del pedido
                  </label>
                  <textarea
                    id="project-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Altura deseada de barra, medidas de deck o detalles de flete..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#1C1612]/15 rounded-md text-[#1C1612] placeholder:text-[#8E8276] focus:outline-none focus:border-[#9A6B2F]"
                  />
                </div>

                {formError && (
                  <p className="text-xs font-medium text-[#9B2C2C]" role="alert">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-5 text-sm font-medium text-[#F7F5F0] bg-[#1C1612] hover:bg-[#33271F] rounded-md transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A6B2F]"
                >
                  {selectedProduct.isCustomQuote
                    ? 'Solicitar Cotización de Proyecto'
                    : `Registrar Pedido de ${quantity} ${quantity === 1 ? 'Pieza' : 'Piezas'}`}
                </button>

                <p className="text-xs text-[#6B5E52] text-center">
                  Entrega en Taller Bahía de Kino o envío por flete ·{' '}
                  <a
                    href={`mailto:${BRAND_INFO.email}`}
                    className="underline hover:text-[#1C1612]"
                  >
                    {BRAND_INFO.email}
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Official v8.0 Production Cost & Labor Breakdown */}
        <div className="bg-[#EFECE5]/65 border border-[#1C1612]/12 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#1C1612]/10 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#9A6B2F]">
                  {activeBreakdown.version} · {activeBreakdown.delivery}
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#1C1612]">
                  Presupuesto Oficial de Producción — {activeBreakdown.model}
                </h3>
              </div>

              {/* Model Breakdown Switcher */}
              <div
                role="tablist"
                aria-label="Seleccionar modelo de presupuesto"
                className="inline-flex items-center gap-1 p-1 bg-[#E5E0D6] rounded-lg self-start lg:self-auto"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={breakdownModel === 'e01'}
                  onClick={() => setBreakdownModel('e01')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    breakdownModel === 'e01'
                      ? 'bg-[#1C1612] text-[#F7F5F0] shadow-sm'
                      : 'text-[#574D44] hover:text-[#1C1612]'
                  }`}
                >
                  Sillón / Banca / Mobiliario de Autor
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={breakdownModel === 't01-s01'}
                  onClick={() => setBreakdownModel('t01-s01')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    breakdownModel === 't01-s01'
                      ? 'bg-[#1C1612] text-[#F7F5F0] shadow-sm'
                      : 'text-[#574D44] hover:text-[#1C1612]'
                  }`}
                >
                  Taburete T-01 / Pedestal S-01
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Desglose oficial v8.0"
                className="inline-flex items-center gap-1 p-1 bg-[#E5E0D6] rounded-lg"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={breakdownTab === 'commercial'}
                  onClick={() => setBreakdownTab('commercial')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    breakdownTab === 'commercial'
                      ? 'bg-[#F7F5F0] text-[#1C1612] shadow-sm'
                      : 'text-[#574D44] hover:text-[#1C1612]'
                  }`}
                >
                  Resumen Comercial
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={breakdownTab === 'materials'}
                  onClick={() => setBreakdownTab('materials')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    breakdownTab === 'materials'
                      ? 'bg-[#F7F5F0] text-[#1C1612] shadow-sm'
                      : 'text-[#574D44] hover:text-[#1C1612]'
                  }`}
                >
                  Materia Prima
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={breakdownTab === 'labor'}
                  onClick={() => setBreakdownTab('labor')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    breakdownTab === 'labor'
                      ? 'bg-[#F7F5F0] text-[#1C1612] shadow-sm'
                      : 'text-[#574D44] hover:text-[#1C1612]'
                  }`}
                >
                  Mano de Obra ({activeBreakdown.laborTotalHours.toFixed(0)} hrs)
                </button>
              </div>

              <a
                href={publicAssetUrl(activeBreakdownCsvPath)}
                download={activeBreakdownCsvName}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#1C1612] bg-[#F7F5F0] hover:bg-[#E5E0D6] border border-[#1C1612]/15 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-[#9A6B2F]" aria-hidden="true" />
                <span>Descargar CSV v8.0</span>
              </a>
            </div>
          </div>

          {breakdownTab === 'commercial' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F7F5F0]/70">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#1C1612]">
                  Estructura de Costos y Margen por Unidad
                </p>
                <dl className="divide-y divide-[#1C1612]/10 text-xs">
                  {activeBreakdown.commercialSummary.slice(0, 6).map((row) => (
                    <div key={row.label} className="py-2.5 flex items-center justify-between gap-4">
                      <dt className="text-[#4A4037]">{row.label}</dt>
                      <dd className="font-mono text-[#1C1612] font-medium tabular-nums">
                        {formatMxn(row.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#1C1612]">
                  Precios Finales de Venta (IVA 16% Incluido)
                </p>
                <div className="space-y-2.5">
                  {activeBreakdown.commercialSummary.slice(6).map((row) => (
                    <div
                      key={row.label}
                      className={`p-3.5 rounded-lg border flex items-center justify-between gap-4 ${
                        row.highlight
                          ? 'bg-[#EFECE5] border-[#9A6B2F]/40 text-[#1C1612]'
                          : 'bg-white/60 border-[#1C1612]/10 text-[#4A4037]'
                      }`}
                    >
                      <span className="text-xs font-medium">{row.label}</span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#1C1612] whitespace-nowrap">
                        {formatMxn(row.value)} MXN
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#574D44] pt-1">
                  {activeBreakdown.warranty} · {activeBreakdown.leadTime}.
                </p>
              </div>
            </div>
          )}

          {breakdownTab === 'materials' && (
            <div className="overflow-x-auto bg-[#F7F5F0]/70">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1C1612]/10 bg-[#EFECE5]/60 text-xs font-medium text-[#574D44]">
                    <th className="py-3 px-5">Código</th>
                    <th className="py-3 px-5">Concepto / Material (Exclusivo Pino Regional)</th>
                    <th className="py-3 px-4">Unidad</th>
                    <th className="py-3 px-4 text-right">Cant.</th>
                    <th className="py-3 px-4 text-right">P.U. (MXN)</th>
                    <th className="py-3 px-5 text-right">Subtotal (MXN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1612]/10 text-xs">
                  {activeBreakdown.materials.map((m) => (
                    <tr key={m.code}>
                      <td className="py-3 px-5 font-mono text-[#9A6B2F] font-medium whitespace-nowrap">
                        {m.code}
                      </td>
                      <td className="py-3 px-5 font-medium text-[#1C1612]">{m.concept}</td>
                      <td className="py-3 px-4 text-[#574D44] whitespace-nowrap">{m.unit}</td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums">{m.qty}</td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums">
                        {formatMxn(m.unitPrice)}
                      </td>
                      <td className="py-3 px-5 font-mono text-right font-medium text-[#1C1612] tabular-nums">
                        {formatMxn(m.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#1C1612]/15 bg-[#EFECE5]/70 text-xs font-semibold text-[#1C1612]">
                    <td className="py-3 px-5" colSpan={5}>
                      TOTAL MATERIALES DIRECTOS BASE (SIN EMPAQUE)
                    </td>
                    <td className="py-3 px-5 font-mono text-right tabular-nums">
                      {formatMxn(activeBreakdown.materialsTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {breakdownTab === 'labor' && (
            <div className="overflow-x-auto bg-[#F7F5F0]/70">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1C1612]/10 bg-[#EFECE5]/60 text-xs font-medium text-[#574D44]">
                    <th className="py-3 px-5">Código</th>
                    <th className="py-3 px-5">Proceso de Manufactura / Ebanistería</th>
                    <th className="py-3 px-4 text-right">Horas Taller</th>
                    <th className="py-3 px-4 text-right">Costo / Hora</th>
                    <th className="py-3 px-5 text-right">Subtotal (MXN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1612]/10 text-xs">
                  {activeBreakdown.labor.map((l) => (
                    <tr key={l.code}>
                      <td className="py-3 px-5 font-mono text-[#9A6B2F] font-medium whitespace-nowrap">
                        {l.code}
                      </td>
                      <td className="py-3 px-5 font-medium text-[#1C1612]">{l.process}</td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums">
                        {l.hours.toFixed(1)} hrs
                      </td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums">
                        {formatMxn(l.hourlyRate)}
                      </td>
                      <td className="py-3 px-5 font-mono text-right font-medium text-[#1C1612] tabular-nums">
                        {formatMxn(l.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#1C1612]/15 bg-[#EFECE5]/70 text-xs font-semibold text-[#1C1612]">
                    <td className="py-3 px-5" colSpan={2}>
                      TOTAL MANO DE OBRA ESPECIALIZADA
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums">
                      {activeBreakdown.laborTotalHours.toFixed(1)} hrs
                    </td>
                    <td className="py-3 px-4" />
                    <td className="py-3 px-5 font-mono text-right tabular-nums">
                      {formatMxn(activeBreakdown.laborTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
