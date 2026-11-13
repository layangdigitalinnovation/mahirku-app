import React from 'react';
import { Film, AlertCircle, ExternalLink } from 'lucide-react';
import { parseVideoEmbed } from '@/utils/landingPageMedia';

interface VideoEmbedPlayerProps {
  videoUrl?: string;
  aspectRatio?: 'auto' | '16:9' | '9:16' | '4:5' | '1:1';
  cardRadius?: string;
  autoplayMuted?: boolean;
}

export const VideoEmbedPlayer: React.FC<VideoEmbedPlayerProps> = ({
  videoUrl,
  aspectRatio = 'auto',
  cardRadius = 'rounded-2xl',
  autoplayMuted = false,
}) => {
  const parsed = parseVideoEmbed(videoUrl);

  if (!parsed) {
    return (
      <div
        className={`${cardRadius} border border-dashed border-white/20 bg-black/30 p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2`}
      >
        <Film className="w-8 h-8 opacity-60" />
        <span>URL video belum diisi (YouTube, TikTok, Instagram Reels, Facebook, atau MP4)</span>
      </div>
    );
  }

  if (parsed.warning) {
    return (
      <div
        className={`${cardRadius} border border-amber-400/40 bg-amber-500/10 p-4 text-xs text-amber-200 space-y-2`}
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{parsed.warning}</p>
        </div>
        <a
          href={parsed.embedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline font-semibold text-amber-300"
        >
          Buka Video di {parsed.platformLabel} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  // Determine container aspect ratio class
  const effectiveVertical =
    aspectRatio === '9:16' ||
    aspectRatio === '4:5' ||
    (aspectRatio === 'auto' && parsed.isVertical);

  const aspectClass =
    aspectRatio === '1:1'
      ? 'aspect-square max-w-md mx-auto'
      : aspectRatio === '4:5'
      ? 'aspect-[4/5] max-w-sm mx-auto'
      : effectiveVertical
      ? 'aspect-[9/16] max-w-[340px] mx-auto'
      : 'aspect-video w-full';

  if (parsed.platform === 'direct') {
    return (
      <div className={`${cardRadius} overflow-hidden border border-white/15 bg-black shadow-xl ${aspectRatio === '9:16' ? 'max-w-[340px] mx-auto' : 'w-full'}`}>
        <video
          src={parsed.embedUrl}
          controls
          playsInline
          autoPlay={autoplayMuted}
          muted={autoplayMuted}
          loop={autoplayMuted}
          className="w-full h-full object-contain max-h-[540px]"
        />
      </div>
    );
  }

  // TikTok & Instagram embed frames look best with fixed minimum vertical height
  const customContainerStyle: React.CSSProperties | undefined =
    parsed.platform === 'tiktok'
      ? { minHeight: 580 }
      : parsed.platform === 'instagram'
      ? { minHeight: effectiveVertical ? 540 : 460 }
      : undefined;

  return (
    <div className="space-y-1.5">
      <div
        style={customContainerStyle}
        className={`relative overflow-hidden border border-white/15 bg-black shadow-2xl ${cardRadius} ${
          parsed.platform === 'tiktok' || parsed.platform === 'instagram'
            ? 'max-w-[360px] mx-auto w-full'
            : aspectClass
        }`}
      >
        <iframe
          src={parsed.embedUrl}
          title={`${parsed.platformLabel} Video`}
          className="w-full h-full absolute inset-0 border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
};

