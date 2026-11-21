import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductGallery } from './components/ProductGallery';
import { BlueprintExplorer } from './components/BlueprintExplorer';
import { WorkshopFilmAndGallery } from './components/WorkshopFilmAndGallery';
import { CommissionSection } from './components/CommissionSection';
import { Footer } from './components/Footer';
import { ResilientImage } from './components/ResilientImage';
import type { QuoteCatalogItem } from './data/studioData';

interface LightboxItem {
  image: string;
  title: string;
  caption: string;
}

export default function App() {
  const [lightboxItem, setLightboxItem] = useState<LightboxItem | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<QuoteCatalogItem['id']>('sillon-e01');

  useEffect(() => {
    if (!lightboxItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem]);

  const scrollToCommission = () => {
    const el = document.getElementById('encargos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectForQuote = (productId: QuoteCatalogItem['id']) => {
    setSelectedQuoteId(productId);
    scrollToCommission();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1C1612]">
      <Navbar onRequestCommission={scrollToCommission} />

      <main className="flex-1">
        <HeroSection />
        <ProductGallery
          onInspectImage={(image, title, caption) =>
            setLightboxItem({ image, title, caption })
          }
          onSelectForQuote={handleSelectForQuote}
        />
        <BlueprintExplorer
          onInspectImage={(image, title, caption) =>
            setLightboxItem({ image, title, caption })
          }
        />
        <WorkshopFilmAndGallery
          onInspectImage={(image, title, caption) =>
            setLightboxItem({ image, title, caption })
          }
        />
        <CommissionSection
          selectedQuoteId={selectedQuoteId}
          onSelectQuoteId={setSelectedQuoteId}
        />
      </main>

      <Footer />

      {/* Fullscreen Lightbox Modal */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#181310] border border-white/15 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/10">
              <div>
                <h3 className="font-display text-xl font-semibold text-[#F7F5F0]">
                  {lightboxItem.title}
                </h3>
                <p className="text-xs text-[#C6BDB2]">{lightboxItem.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="Cerrar visor"
                className="w-10 h-10 rounded-md flex items-center justify-center text-[#F7F5F0] hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] bg-[#0F0C0A] flex items-center justify-center overflow-hidden">
              <ResilientImage
                src={lightboxItem.image}
                alt={lightboxItem.title}
                className="max-h-[75vh] w-auto object-contain"
                fallbackTitle={lightboxItem.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
