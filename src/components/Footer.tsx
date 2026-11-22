import { BRAND_INFO } from '../data/studioData';
import { ResilientImage } from './ResilientImage';
import { publicAssetUrl } from '../utils';

export function Footer() {
  return (
    <footer className="border-t border-[#1C1612]/12 bg-[#EFECE5] py-12">
      <div className="max-w-[1240px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#1C1612]/15 shrink-0">
            <ResilientImage
              src={publicAssetUrl('/assets/aistudio/Logo_Nava_Woodworks_2_4626c698.png')}
              alt="Escudo Nava Woodworks"
              className="w-full h-full object-cover"
              fallbackTitle="NW"
            />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-[#1C1612]">
              {BRAND_INFO.fullTitle}
            </p>
            <p className="text-xs text-[#574D44]">
              {BRAND_INFO.craftsman} · {BRAND_INFO.role} · {BRAND_INFO.location}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#574D44]">
          <a href="#colecciones" className="hover:text-[#1C1612] transition-colors">
            Colecciones
          </a>
          <a href="#ingenieria" className="hover:text-[#1C1612] transition-colors">
            Ingeniería
          </a>
          <a href="#taller" className="hover:text-[#1C1612] transition-colors">
            Taller
          </a>
          <a href="#identidad" className="hover:text-[#1C1612] transition-colors">
            Identidad
          </a>
          <a
            href={`mailto:${BRAND_INFO.email}`}
            className="text-[#1C1612] underline hover:text-[#9A6B2F] transition-colors"
          >
            {BRAND_INFO.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
