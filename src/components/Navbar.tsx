import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BRAND_INFO } from '../data/studioData';

interface NavbarProps {
  onRequestCommission: () => void;
}

const NAV_LINKS = [
  { href: '#colecciones', label: 'Colecciones' },
  { href: '#ingenieria', label: 'Ingeniería' },
  { href: '#taller', label: 'Taller' },
  { href: '#identidad', label: 'Identidad' },
];

export function Navbar({ onRequestCommission }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0]/95 backdrop-blur-sm border-b border-[#1C1612]/10">
      <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#obra"
          className="font-display text-2xl font-semibold tracking-tight text-[#1C1612] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A6B2F]"
        >
          {BRAND_INFO.wordmark}
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#574D44]"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="py-1 border-b border-transparent hover:text-[#1C1612] hover:border-[#9A6B2F] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A6B2F]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRequestCommission}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#F7F5F0] bg-[#1C1612] hover:bg-[#33271F] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A6B2F]"
          >
            Solicitar Encargo
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-[#1C1612] hover:bg-[#1C1612]/5 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1C1612]/10 bg-[#F7F5F0] px-6 py-4 space-y-2">
          <nav aria-label="Menú móvil" className="flex flex-col space-y-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleMobileLinkClick}
                className="py-2.5 text-base font-medium text-[#1C1612] hover:text-[#9A6B2F] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-[#1C1612]/10">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestCommission();
              }}
              className="w-full py-3 px-4 text-sm font-medium text-[#F7F5F0] bg-[#1C1612] rounded-md text-center cursor-pointer"
            >
              Solicitar Encargo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
