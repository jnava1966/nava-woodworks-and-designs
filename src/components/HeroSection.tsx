import { useState } from 'react';
import { ArrowDownRight, Play } from 'lucide-react';
import { BRAND_INFO, HERO_ASSETS, HERO_SPECS } from '../data/studioData';
import { ResilientImage } from './ResilientImage';

export function HeroSection() {
  const [heroMode, setHeroMode] = useState<'studio' | 'branded'>('studio');

  const activeHero = heroMode === 'studio' ? HERO_ASSETS.studioView : HERO_ASSETS.brandedView;

  return (
    <section id="obra" className="border-b border-[#1C1612]/10">
      <div className="max-w-[1240px] mx-auto px-6 pt-12 pb-14 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Typographic Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#6B5E52] tracking-wide">
                <span>{BRAND_INFO.location}</span>
                <span aria-hidden="true">·</span>
                <span>{BRAND_INFO.craftsman}</span>
                <span aria-hidden="true">·</span>
                <span>{BRAND_INFO.role}</span>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.05] tracking-tight text-[#1C1612]"
                style={{ textWrap: 'balance' }}
              >
                Artesanía funcional en madera y acero
              </h1>

              <p className="text-base sm:text-[17px] leading-relaxed text-[#4A4037] max-w-[58ch]">
                Desde nuestro taller en Bahía de Kino frente al Mar de Cortés, diseñamos y construimos
                piezas arquitectónicas, bases ornamentales y mobiliario híbrido donde los ensambles
                tradicionales por fricción dialogan con el metal cepillado.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#ingenieria"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#F7F5F0] bg-[#1C1612] hover:bg-[#33271F] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A6B2F]"
                >
                  <span>Explorar Plano Tipo S-01</span>
                  <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                </a>

                <a
                  href="#taller"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#1C1612] bg-[#EFECE5] hover:bg-[#E5E0D6] border border-[#1C1612]/15 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A6B2F]"
                >
                  <Play className="w-3.5 h-3.5 text-[#9A6B2F]" aria-hidden="true" />
                  <span>Recorrido Bahía de Kino</span>
                </a>
              </div>

              <div className="pt-4 border-t border-[#1C1612]/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#6B5E52]">
                  {BRAND_INFO.tagline} · {BRAND_INFO.hybridTagline}
                </span>
                <span className="font-mono text-xs text-[#6B5E52] tabular-nums">
                  {BRAND_INFO.coordinates}
                </span>
              </div>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative flex-1 min-h-[340px] lg:min-h-[470px] rounded-xl overflow-hidden bg-[#1C1612] border border-[#1C1612]/10">
              <ResilientImage
                src={activeHero.src}
                alt={activeHero.alt}
                className="w-full h-full lg:h-full object-cover transition-opacity duration-200"
                fallbackTitle="Base de Exhibición Tipo S-01"
              />

              {/* Subtle Bottom Contrast Scrim with Caption + View Toggle */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-[#E4D7C5] font-medium">Pieza Destacada</p>
                  <p className="font-display text-xl sm:text-2xl text-white font-medium mt-0.5">
                    {activeHero.caption}
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Selector de fotografía"
                  className="inline-flex items-center p-1 bg-black/55 backdrop-blur-sm border border-white/15 rounded-lg self-start sm:self-auto shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setHeroMode('studio')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      heroMode === 'studio'
                        ? 'bg-[#F7F5F0] text-[#1C1612]'
                        : 'text-[#E4D7C5] hover:text-white'
                    }`}
                  >
                    Vista de Estudio
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroMode('branded')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      heroMode === 'branded'
                        ? 'bg-[#F7F5F0] text-[#1C1612]'
                        : 'text-[#E4D7C5] hover:text-white'
                    }`}
                  >
                    Sello Oficial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Specification Strip Below Hero Split */}
        <div className="mt-10 pt-8 border-t border-[#1C1612]/12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {HERO_SPECS.map((spec) => (
            <div key={spec.label} className="space-y-1">
              <p className="text-xs text-[#6B5E52]">{spec.label}</p>
              <p className="text-sm sm:text-base font-semibold text-[#1C1612] tabular-nums">
                {spec.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
