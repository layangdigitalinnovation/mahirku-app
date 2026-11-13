import React, { useRef, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Film, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadLandingPageMedia } from '@/services/api/landingPage';

interface MediaUploaderFieldProps {
  label: string;
  value?: string;
  onChange: (newUrl: string) => void;
  accept?: 'image' | 'video' | 'both';
  placeholder?: string;
  helperText?: React.ReactNode;
}

export const MediaUploaderField: React.FC<MediaUploaderFieldProps> = ({
  label,
  value = '',
  onChange,
  accept = 'image',
  placeholder,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const acceptAttr =
    accept === 'image'
      ? 'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml'
      : accept === 'video'
      ? 'video/mp4,video/webm,video/quicktime'
      : 'image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4,video/webm,video/quicktime';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadLandingPageMedia(file);
      onChange(res.url);
      toast.success('File berhasil diupload dan dipasang!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Gagal mengupload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isVideoFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-semibold text-gray-700">{label}</Label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-rose-600 hover:text-rose-700 flex items-center gap-0.5 font-medium"
          >
            <Trash2 className="w-3 h-3" />
            Hapus
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-1.5">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            (accept === 'video'
              ? 'Paste link YouTube, TikTok, IG Reels, FB, atau upload MP4...'
              : 'Paste URL gambar atau klik Upload...')
          }
          className="bg-white text-[11px] font-mono flex-1 h-8"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition disabled:opacity-50"
          title={accept === 'video' ? 'Upload Video MP4' : 'Upload Gambar dari Perangkat'}
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>{uploading ? 'Upload...' : 'Upload'}</span>
        </button>
      </div>

      {helperText && <p className="text-[10px] text-gray-500 leading-tight">{helperText}</p>}

      {value && !isVideoFile && !/youtube\.com|youtu\.be|tiktok\.com|instagram\.com|vimeo\.com|facebook\.com|fb\.watch/i.test(value) && (
        <div className="relative mt-1.5 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 h-24 flex items-center justify-center group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition"
          >
            <ExternalLink className="w-2.5 h-2.5" /> Buka
          </a>
        </div>
      )}

      {value && isVideoFile && (
        <div className="mt-1.5 rounded-lg overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
          <video src={value} controls className="w-full max-h-28" />
        </div>
      )}

      {!value && accept === 'image' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 border border-dashed border-gray-300 hover:border-indigo-400 rounded-lg py-2 px-3 text-center cursor-pointer bg-white/60 hover:bg-indigo-50/30 transition flex items-center justify-center gap-1.5 text-[10px] text-gray-500"
        >
          <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
          <span>Klik untuk upload gambar (JPG, PNG, WEBP)</span>
        </div>
      )}

      {!value && accept === 'video' && (
        <div className="mt-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] text-gray-600 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Support link YouTube / Shorts, TikTok, Instagram Reels / Post, Facebook, Vimeo, atau upload MP4.</span>
        </div>
      )}
    </div>
  );
};

