import { useState } from 'react';
import { ArrowRight, Download, Maximize2 } from 'lucide-react';
import {
  ARCHITECTURAL_SUBCOLLECTIONS,
  FURNITURE_COMPARISON_MATRIX,
  OFFICIAL_CATALOG_PATH,
  PRODUCT_LINES,
  type QuoteCatalogItem,
} from '../data/studioData';
import { ResilientImage } from './ResilientImage';
import { publicAssetUrl } from '../utils';

interface ProductGalleryProps {
  onInspectImage: (image: string, title: string, caption: string) => void;
  onSelectForQuote: (productId: QuoteCatalogItem['id']) => void;
}

type GalleryFilter = 'all' | 'pedestales' | 'taburetes' | 'sillones' | 'arquitectonica';

const FILTER_TABS: { id: GalleryFilter; label: string }[] = [
  { id: 'all', label: 'Todas las Líneas' },
  { id: 'pedestales', label: 'Pedestal Tipo S-01' },
  { id: 'taburetes', label: 'Taburete Tipo T-01' },
  { id: 'sillones', label: 'Sillón Tipo E-01' },
  { id: 'arquitectonica', label: 'Carpintería Arquitectónica' },
];

export function ProductGallery({ onInspectImage, onSelectForQuote }: ProductGalleryProps) {
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [mediaIdxByProduct, setMediaIdxByProduct] = useState<Record<string, number>>({});

  const visibleLines =
    filter === 'all'
      ? PRODUCT_LINES
      : PRODUCT_LINES.filter((item) => item.filterCategory === filter);

  return (
    <section id="colecciones" className="py-16 lg:py-24 border-b border-[#1C1612]/10 bg-[#F7F5F0]">
      <div className="max-w-[1240px] mx-auto px-6 space-y-12">
        {/* Section Heading & Functional Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium text-[#9A6B2F] tracking-wide">
              Galería de Productos
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1612] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Piezas principales y líneas arquitectónicas
            </h2>
            <p className="text-[15px] text-[#4A4037] leading-relaxed">
              Construcción exclusiva en Pino Regional Macizo con ensambles mecánicos ocultos,
              selladores higroscópicos y protección UV pensada para ambientes costeros.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filtrar colecciones"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EFECE5] border border-[#1C1612]/10 rounded-lg self-start lg:self-auto"
          >
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1C1612] text-[#F7F5F0]'
                      : 'text-[#574D44] hover:text-[#1C1612]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Line Showcase Cards */}
        <div
          className={`grid grid-cols-1 gap-8 items-stretch ${
            visibleLines.length === 1 ? 'max-w-2xl' : 'md:grid-cols-2'
          }`}
        >
          {visibleLines.map((product) => {
            const hasSwitcher = Boolean(product.secondaryImages?.length);
            const mediaOptions = hasSwitcher
              ? [
                  {
                    label:
                      product.id === 'tipo-s01'
                        ? 'Ficha Promocional'
                        : product.id === 'tipo-e01'
                          ? 'Vista en Taller'
                          : 'Nudo Triaxial',
                    src: product.primaryImage,
                    alt: product.primaryAlt,
                  },
                  ...(product.secondaryImages ?? []),
                ]
              : [{ label: product.code, src: product.primaryImage, alt: product.primaryAlt }];

            const activeMediaIdx = mediaIdxByProduct[product.id] ?? 0;
            const currentMedia =
              hasSwitcher ? mediaOptions[activeMediaIdx] ?? mediaOptions[0] : mediaOptions[0];

            return (
              <article
                key={product.id}
                className="bg-[#EFECE5]/75 border border-[#1C1612]/12 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Media Frame */}
                  <div className="relative aspect-[4/3] bg-[#1C1612] overflow-hidden border-b border-[#1C1612]/10 group">
                    <button
                      type="button"
                      onClick={() =>
                        onInspectImage(currentMedia.src, product.title, product.summary)
                      }
                      aria-label={`Ampliar ${product.title}`}
                      className="w-full h-full block text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A6B2F]"
                    >
                      <ResilientImage
                        src={currentMedia.src}
                        alt={currentMedia.alt}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        fallbackTitle={product.title}
                      />
                      <span className="absolute right-3 top-3 w-8 h-8 rounded-md bg-black/65 group-hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </button>
                  </div>

                  {/* Sub-view Switcher */}
                  {hasSwitcher && (
                    <div className="px-5 pt-3 flex flex-wrap gap-1.5">
                      {mediaOptions.map((opt, idx) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() =>
                            setMediaIdxByProduct((prev) => ({ ...prev, [product.id]: idx }))
                          }
                          className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                            activeMediaIdx === idx
                              ? 'bg-[#1C1612] text-[#F7F5F0] border-[#1C1612]'
                              : 'bg-[#F7F5F0] text-[#574D44] border-[#1C1612]/15 hover:text-[#1C1612]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#6B5E52]">
                        <span className="font-mono font-medium text-[#9A6B2F]">{product.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.materialSpec}</span>
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-[#1C1612] leading-snug">
                        {product.title}
                      </h3>
                      <p className="text-xs font-medium text-[#574D44]">{product.subtitle}</p>
                    </div>

                    <p className="text-sm text-[#4A4037] leading-relaxed">{product.summary}</p>

                    <ul className="space-y-1.5 pt-2 border-t border-[#1C1612]/10 text-xs text-[#4A4037]">
                      {product.highlights.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="text-[#9A6B2F] mt-0.5" aria-hidden="true">
                            —
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-6 pb-6 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectForQuote(product.quoteProductId as QuoteCatalogItem['id'])
                    }
                    className="w-full inline-flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#1C1612] bg-[#F7F5F0] hover:bg-[#1C1612] hover:text-[#F7F5F0] border border-[#1C1612]/15 rounded-md transition-colors duration-150 cursor-pointer"
                  >
                    <span>
                      {product.id === 'tipo-t01'
                        ? 'Cotizar Volumen de Taburetes'
                        : product.id === 'tipo-s01'
                          ? 'Cotizar Pedestal Tipo S-01'
                          : product.id === 'tipo-e01'
                            ? 'Cotizar Sillón Ergonómico'
                            : 'Solicitar Proyecto a Medida'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Structural Carpentry & Comparison Matrix */}
        {(filter === 'all' || filter === 'arquitectonica') && (
          <div className="pt-8 border-t border-[#1C1612]/12 space-y-10">
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-semibold text-[#1C1612]">
                  Carpintería Estructural y Proyectos Arquitectónicos
                </h3>
                <span className="text-xs text-[#6B5E52]">
                  Cabañas · Encofrados Fundacionales · Decks Exteriores
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ARCHITECTURAL_SUBCOLLECTIONS.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-xl bg-[#EFECE5]/60 border border-[#1C1612]/10 space-y-2"
                  >
                    <p className="text-xs text-[#9A6B2F] font-medium">{sub.application}</p>
                    <h4 className="font-display text-xl font-semibold text-[#1C1612]">{sub.name}</h4>
                    <p className="text-xs text-[#4A4037] leading-relaxed">{sub.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Furniture Comparison Matrix */}
            <div className="bg-[#EFECE5]/50 border border-[#1C1612]/12 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#1C1612]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#9A6B2F]">
                    Catálogo Oficial NavaWoodworks
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-[#1C1612]">
                    Matriz Comparativa de Líneas de Mobiliario
                  </h3>
                </div>
                <a
                  href={OFFICIAL_CATALOG_PATH}
                  download="Catalogo_Oficial_NavaWoodworks.txt"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#1C1612] bg-[#F7F5F0] hover:bg-[#E5E0D6] border border-[#1C1612]/15 rounded-md transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-[#9A6B2F]" aria-hidden="true" />
                  <span>Descargar Catálogo Oficial</span>
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1C1612]/10 bg-[#EFECE5]/70 text-xs font-medium text-[#574D44]">
                      <th className="py-3.5 px-5 whitespace-nowrap">Línea de Mobiliario</th>
                      <th className="py-3.5 px-5">Enfoque de Diseño</th>
                      <th className="py-3.5 px-5">Componentes Estructurales</th>
                      <th className="py-3.5 px-5">Acabados y Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1612]/10 text-sm">
                    {FURNITURE_COMPARISON_MATRIX.map((row) => (
                      <tr key={row.line} className="hover:bg-[#F7F5F0]/70 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-[#1C1612] whitespace-nowrap">
                          {row.line}
                        </td>
                        <td className="py-3.5 px-5 text-xs text-[#4A4037]">{row.focus}</td>
                        <td className="py-3.5 px-5 text-xs text-[#4A4037]">{row.structure}</td>
                        <td className="py-3.5 px-5 text-xs text-[#4A4037]">{row.finishes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
