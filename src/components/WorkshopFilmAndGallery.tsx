import { useEffect, useRef, useState } from 'react';
import { Download, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { BRAND_INFO, GALLERY_ARTIFACTS } from '../data/studioData';
import { ResilientImage } from './ResilientImage';
import { publicAssetUrl } from '../utils';

interface WorkshopFilmAndGalleryProps {
  onInspectImage: (image: string, title: string, caption: string) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

type ArtifactFilter = 'all' | 'identidad' | 'planos' | 'banca';

const ARTIFACT_TABS: { id: ArtifactFilter; label: string }[] = [
  { id: 'all', label: `Todos (${GALLERY_ARTIFACTS.length})` },
  { id: 'identidad', label: 'Identidad' },
  { id: 'planos', label: 'Planos & Despieces' },
  { id: 'banca', label: 'Bancas y Sillones' },
];

export function WorkshopFilmAndGallery({ onInspectImage }: WorkshopFilmAndGalleryProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [artifactFilter, setArtifactFilter] = useState<ArtifactFilter>('all');

  const visibleArtifacts =
    artifactFilter === 'all'
      ? GALLERY_ARTIFACTS
      : GALLERY_ARTIFACTS.filter((item) => item.group === artifactFilter);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const targetTime = Number(e.target.value);
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video && video.requestFullscreen) {
      video.requestFullscreen().catch(() => {});
    }
  };

  return (
    <section id="taller" className="bg-[#1A1512] text-[#F7F5F0] py-16 lg:py-24">
      <div className="max-w-[1240px] mx-auto px-6 space-y-20">
        {/* Part 1: Bahía de Kino Workshop Film */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs font-medium text-[#D29A52] tracking-wide">
              02. Territorio &amp; Taller
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#F7F5F0] leading-tight tracking-wide"
              style={{ textWrap: 'balance' }}
            >
              Llegando a Bahía de Kino, Sonora
            </h2>
            <p className="text-[15px] text-[#D7CEC3] leading-relaxed">
              Entre el desierto sonorense y la costa del Mar de Cortés, el clima marino exige
              maderas estabilizadas, aceros inoxidables y latón trabajado a mano. Este entorno guía
              cada proporción, junta y acabado que sale de nuestro banco de carpintería.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/12">
              <div>
                <p className="text-xs text-[#A89C90]">Ubicación del Taller</p>
                <p className="text-sm font-medium text-[#F7F5F0] mt-1">{BRAND_INFO.location}</p>
              </div>
              <div>
                <p className="text-xs text-[#A89C90]">Especialidad</p>
                <p className="text-sm font-medium text-[#F7F5F0] mt-1">
                  {BRAND_INFO.hybridTagline}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Video Frame */}
          <div className="lg:col-span-7">
            <div className="rounded-xl overflow-hidden border border-white/12 bg-[#120E0C]">
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={publicAssetUrl('/assets/aistudio/Llegando_a_Bahia_de_Kino_00be1f88.mp4')}
                  playsInline
                  muted={isMuted}
                  preload="metadata"
                  onClick={togglePlay}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {!isPlaying && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label="Reproducir video Llegando a Bahía de Kino"
                    className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/25 transition-colors cursor-pointer group"
                  >
                    <span className="w-16 h-16 rounded-full bg-[#F7F5F0]/95 text-[#1C1612] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 ml-0.5" aria-hidden="true" />
                    </span>
                  </button>
                )}
              </div>

              {/* Clean Video Control Bar */}
              <div className="px-4 py-3 bg-[#15110E] border-t border-white/10 flex items-center gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
                  className="w-9 h-9 rounded-md flex items-center justify-center text-[#F7F5F0] hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Progreso del video"
                  className="flex-1 accent-[#D29A52] cursor-pointer h-1.5"
                />

                <span className="font-mono text-xs text-[#C6BDB2] tabular-nums shrink-0">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                  className="w-9 h-9 rounded-md flex items-center justify-center text-[#F7F5F0] hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  aria-label="Pantalla completa"
                  className="w-9 h-9 rounded-md flex items-center justify-center text-[#F7F5F0] hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Identity, Blueprints & Bench Artifacts */}
        <div id="identidad" className="pt-12 border-t border-white/12 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#D29A52] tracking-wide">
                03. Archivo Técnico e Identidad
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F7F5F0]">
                Sello de taller, planos CAD y serie de asientos
              </h2>
              <p className="text-sm text-[#C6BDB2] max-w-xl">
                Artefactos físicos de identidad, lámina ortogonal WD-101, despieces BOM y
                documentación constructiva de bancas y sillones ergonómicos.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filtrar archivo de artefactos"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#251E1A] border border-white/10 rounded-lg self-start lg:self-auto"
            >
              {ARTIFACT_TABS.map((tab) => {
                const active = artifactFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setArtifactFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#F7F5F0] text-[#1C1612]'
                        : 'text-[#C6BDB2] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleArtifacts.map((item) => {
              const isContain = item.fitMode === 'contain';
              return (
                <article
                  key={item.id}
                  className="group bg-[#231C18] border border-white/10 rounded-xl overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => onInspectImage(item.image, item.title, item.caption)}
                    className={`relative aspect-[4/3] w-full overflow-hidden cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D29A52] ${
                      isContain ? 'bg-[#EFECE5] p-2' : 'bg-[#140F0C]'
                    }`}
                  >
                    <ResilientImage
                      src={item.image}
                      alt={item.alt}
                      className={`w-full h-full transition-transform duration-300 group-hover:scale-[1.03] ${
                        isContain ? 'object-contain' : 'object-cover'
                      }`}
                      fallbackTitle={item.title}
                    />
                    <span className="absolute right-3 bottom-3 w-8 h-8 rounded-md bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </button>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#C6BDB2]">
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{item.year}</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#F7F5F0]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#C6BDB2] leading-relaxed">{item.caption}</p>
                    {item.pdfUrl && (
                      <div className="pt-2">
                        <a
                          href={publicAssetUrl(item.pdfUrl)}
                          download="Plano_CAD_Sillon_Ergonomico_E01.pdf"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C1612] bg-[#F7F5F0] hover:bg-[#E5E0D6] rounded-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-[#9A6B2F]" aria-hidden="true" />
                          <span>{item.pdfLabel ?? 'Descargar PDF'}</span>
                        </a>
                      </div>
                    )}
                    {item.pptxUrl && (
                      <div className="pt-2">
                        <a
                          href={publicAssetUrl(item.pptxUrl)}
                          download="Del_Pixel_a_la_Madera.pptx"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C1612] bg-[#F7F5F0] hover:bg-[#E5E0D6] rounded-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-[#9A6B2F]" aria-hidden="true" />
                          <span>{item.pptxLabel ?? 'Descargar Presentación'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
