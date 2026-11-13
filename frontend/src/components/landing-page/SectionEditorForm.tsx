import React from 'react';
import { Plus, Trash2, Film, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  LandingPage,
  SectionBlock,
  SectionType,
  DbPackage,
  DbVoucher,
  CustomFieldType,
  CustomFormField,
} from '@/types/landingPage';
import {
  getDefaultSectionLabel,
  parseVideoEmbed,
  CUSTOM_FIELD_PRESETS,
  createCustomFormField,
  resolveCustomFormFields,
} from '@/utils/landingPageMedia';
import { MediaUploaderField } from './MediaUploaderField';

interface SectionEditorFormProps {
  section: SectionBlock;
  page: LandingPage;
  dbPackages: DbPackage[];
  dbVouchers: DbVoucher[];
  onUpdateSection: (sectionId: string, updater: (prev: SectionBlock) => SectionBlock) => void;
  onUpdatePage: (updater: (prev: LandingPage) => LandingPage) => void;
}

export const SectionEditorForm: React.FC<SectionEditorFormProps> = ({
  section,
  page,
  dbPackages,
  dbVouchers,
  onUpdateSection,
  onUpdatePage,
}) => {
  const type = (section.type || section.id) as SectionType;
  const data = section.data || {};

  const updateData = (patch: Record<string, any>) => {
    onUpdateSection(section.id, (prev) => ({
      ...prev,
      data: { ...prev.data, ...patch },
    }));
  };

  const updateArrayItem = (key: string, index: number, patch: Record<string, any>) => {
    const items = Array.isArray(data[key]) ? [...data[key]] : [];
    items[index] = { ...items[index], ...patch };
    updateData({ [key]: items });
  };

  const addArrayItem = (key: string, newItem: any) => {
    const items = Array.isArray(data[key]) ? [...data[key]] : [];
    items.push(newItem);
    updateData({ [key]: items });
  };

  const removeArrayItem = (key: string, index: number) => {
    const items = Array.isArray(data[key]) ? [...data[key]] : [];
    items.splice(index, 1);
    updateData({ [key]: items });
  };

  const parsedHeroVideo = data.heroVideoUrl ? parseVideoEmbed(data.heroVideoUrl) : null;
  const parsedVideo = data.videoUrl ? parseVideoEmbed(data.videoUrl) : null;

  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
      {/* Header + Dynamic Section Title */}
      <div className="space-y-2 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
            Tipe: {type}
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            {section.enabled ? '● Aktif' : '○ Nonaktif'}
          </span>
        </div>

        <div>
          <Label className="text-[11px] font-bold text-gray-700">
            Nama Bagian di Daftar (Bisa Diubah Bebas)
          </Label>
          <Input
            value={section.title !== undefined ? section.title : getDefaultSectionLabel(section)}
            onChange={(e) =>
              onUpdateSection(section.id, (prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Contoh: Video Penjelasan TikTok..."
            className="mt-1 bg-white text-xs font-semibold"
          />
        </div>
      </div>

      {/* 1. HERO FORM */}
      {type === 'hero' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badgeText || ''}
              onChange={(e) => updateData({ badgeText: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Headline Utama (Hook Iklan)</Label>
            <Textarea
              rows={2}
              value={data.headline || ''}
              onChange={(e) => updateData({ headline: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Subheadline Penjelas</Label>
            <Textarea
              rows={3}
              value={data.subheadline || ''}
              onChange={(e) => updateData({ subheadline: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <MediaUploaderField
            label="Gambar Hero (Upload atau URL)"
            accept="image"
            value={data.heroImage || ''}
            onChange={(url) => updateData({ heroImage: url })}
          />

          <MediaUploaderField
            label="Video Hero Opsional (YouTube, TikTok, IG Reels, MP4)"
            accept="video"
            value={data.heroVideoUrl || ''}
            onChange={(url) => updateData({ heroVideoUrl: url })}
            helperText={
              parsedHeroVideo
                ? `Terdeteksi: ${parsedHeroVideo.platformLabel}`
                : 'Kosongkan jika hanya ingin menampilkan gambar hero.'
            }
          />

          <div>
            <Label className="text-[11px] text-gray-600">Teks Tombol CTA Utama</Label>
            <Input
              value={data.ctaText || ''}
              onChange={(e) => updateData({ ctaText: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Teks Rating / Social Proof Bawah CTA</Label>
            <Input
              value={data.statsText || ''}
              onChange={(e) => updateData({ statsText: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
        </div>
      )}

      {/* 2. VIDEO SECTION FORM */}
      {type === 'video' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Bagian Video</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Subjudul / Pengantar Video</Label>
            <Textarea
              rows={2}
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <MediaUploaderField
            label="Link Video Sosmed atau Upload MP4"
            accept="video"
            value={data.videoUrl || ''}
            onChange={(url) => updateData({ videoUrl: url })}
            helperText={
              parsedVideo ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <Film className="w-3 h-3" /> Terdeteksi platform: {parsedVideo.platformLabel}
                </span>
              ) : (
                'Mendukung YouTube, YouTube Shorts, TikTok, Instagram Reels/Post, Facebook, Vimeo, atau upload MP4.'
              )
            }
          />

          <div>
            <Label className="text-[11px] text-gray-600">Rasio Tampilan Video</Label>
            <select
              value={data.aspectRatio || 'auto'}
              onChange={(e) => updateData({ aspectRatio: e.target.value })}
              className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs"
            >
              <option value="auto">Otomatis (Ikuti Platform: Vertikal untuk TikTok/Reels/Shorts)</option>
              <option value="16:9">16:9 Landscape (YouTube / Video Lebar)</option>
              <option value="9:16">9:16 Vertikal Penuh (TikTok / Reels / Shorts)</option>
              <option value="4:5">4:5 Portrait Feed (Instagram Feed Ads)</option>
              <option value="1:1">1:1 Persegi (Square)</option>
            </select>
          </div>

          <div>
            <Label className="text-[11px] text-gray-600">Caption Bawah Video (Opsional)</Label>
            <Input
              value={data.caption || ''}
              onChange={(e) => updateData({ caption: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <Label className="text-[11px] text-gray-700">Tampilkan Tombol CTA di Bawah Video</Label>
            <Switch
              checked={Boolean(data.showCta)}
              onCheckedChange={(val) => updateData({ showCta: val })}
            />
          </div>

          {data.showCta && (
            <div>
              <Label className="text-[11px] text-gray-600">Teks Tombol CTA</Label>
              <Input
                value={data.ctaText || ''}
                onChange={(e) => updateData({ ctaText: e.target.value })}
                className="mt-1 bg-white text-xs font-semibold"
              />
            </div>
          )}
        </div>
      )}

      {/* 3. MEDIA & RICH CONTENT FORM */}
      {(type === 'mediaContent' || type === 'custom') && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Konten</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Paragraf / Isi Konten</Label>
            <Textarea
              rows={4}
              value={data.content || ''}
              onChange={(e) => updateData({ content: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <MediaUploaderField
            label="Gambar Konten (Upload atau URL)"
            accept="image"
            value={data.imageUrl || ''}
            onChange={(url) => updateData({ imageUrl: url })}
          />

          <div>
            <Label className="text-[11px] text-gray-600">Posisi Gambar</Label>
            <select
              value={data.layout || 'image-top'}
              onChange={(e) => updateData({ layout: e.target.value })}
              className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs"
            >
              <option value="image-top">Gambar di Atas Teks</option>
              <option value="image-bottom">Gambar di Bawah Teks</option>
              <option value="image-left">Gambar di Kiri (Desktop/Tablet)</option>
              <option value="image-right">Gambar di Kanan (Desktop/Tablet)</option>
            </select>
          </div>

          {/* Dynamic Bullet Points */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700">Daftar Poin Checklist</Label>
              <button
                type="button"
                onClick={() =>
                  updateData({ bullets: [...(data.bullets || []), 'Poin keunggulan baru'] })
                }
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Tambah Poin
              </button>
            </div>
            {(data.bullets || []).map((bullet: string, idx: number) => (
              <div key={idx} className="flex gap-1.5">
                <Input
                  value={bullet}
                  onChange={(e) => {
                    const next = [...(data.bullets || [])];
                    next[idx] = e.target.value;
                    updateData({ bullets: next });
                  }}
                  className="bg-white text-xs h-8"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('bullets', idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Label className="text-[11px] text-gray-700">Tampilkan Tombol CTA</Label>
            <Switch
              checked={Boolean(data.showCta)}
              onCheckedChange={(val) => updateData({ showCta: val })}
            />
          </div>
          {data.showCta && (
            <div>
              <Label className="text-[11px] text-gray-600">Teks Tombol CTA</Label>
              <Input
                value={data.ctaText || ''}
                onChange={(e) => updateData({ ctaText: e.target.value })}
                className="mt-1 bg-white text-xs font-semibold"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. GALLERY FORM */}
      {type === 'gallery' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Galeri</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Subjudul Galeri</Label>
            <Input
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Jumlah Kolom</Label>
            <select
              value={data.columns || 2}
              onChange={(e) => updateData({ columns: Number(e.target.value) })}
              className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs"
            >
              <option value={2}>2 Kolom (Grid)</option>
              <option value={1}>1 Kolom (Penuh ke Bawah)</option>
            </select>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700">Daftar Foto Galeri</Label>
              <button
                type="button"
                onClick={() => addArrayItem('items', { imageUrl: '', caption: 'Keterangan gambar' })}
                className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Foto
              </button>
            </div>
            {(data.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">Foto #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('items', idx)}
                    className="text-[10px] text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
                <MediaUploaderField
                  label="Gambar"
                  accept="image"
                  value={item.imageUrl || ''}
                  onChange={(url) => updateArrayItem('items', idx, { imageUrl: url })}
                />
                <Input
                  placeholder="Caption gambar..."
                  value={item.caption || ''}
                  onChange={(e) => updateArrayItem('items', idx, { caption: e.target.value })}
                  className="text-xs h-8"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PAIN POINTS FORM */}
      {type === 'painPoints' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Masalah</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Sub-judul Masalah</Label>
            <Textarea
              rows={2}
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700">Daftar Poin Masalah</Label>
              <button
                type="button"
                onClick={() =>
                  addArrayItem('items', {
                    title: 'Masalah Baru',
                    desc: 'Penjelasan singkat kendala yang dialami audiens.',
                  })
                }
                className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Poin
              </button>
            </div>
            {(data.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">Masalah #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('items', idx)}
                    className="text-[10px] text-rose-600 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
                <Input
                  placeholder="Judul masalah"
                  value={item.title || ''}
                  onChange={(e) => updateArrayItem('items', idx, { title: e.target.value })}
                  className="text-xs font-semibold h-8"
                />
                <Textarea
                  rows={2}
                  placeholder="Deskripsi"
                  value={item.desc || ''}
                  onChange={(e) => updateArrayItem('items', idx, { desc: e.target.value })}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CHARACTER ARCHETYPES / CARDS FORM */}
      {type === 'characterArchetypes' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Kartu / Karakter</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Sub-judul</Label>
            <Textarea
              rows={2}
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700">
                Item Kartu ({(data.items || []).length})
              </Label>
              <button
                type="button"
                onClick={() =>
                  addArrayItem('items', {
                    name: 'Karakter / Item Baru',
                    badge: 'Highlight',
                    color: '#6366F1',
                    desc: 'Deskripsi karakteristik dan potensinya.',
                    imageUrl: '',
                  })
                }
                className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Kartu
              </button>
            </div>
            {(data.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">Kartu #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('items', idx)}
                    className="text-[10px] text-rose-600 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
                <Input
                  placeholder="Nama Kartu"
                  value={item.name || ''}
                  onChange={(e) => updateArrayItem('items', idx, { name: e.target.value })}
                  className="text-xs font-semibold h-8"
                />
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Label Badge"
                    value={item.badge || ''}
                    onChange={(e) => updateArrayItem('items', idx, { badge: e.target.value })}
                    className="text-xs h-8 flex-1"
                  />
                  <input
                    type="color"
                    value={item.color || '#6366F1'}
                    onChange={(e) => updateArrayItem('items', idx, { color: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200 shrink-0"
                    title="Warna Badge"
                  />
                </div>
                <Textarea
                  rows={2}
                  placeholder="Deskripsi"
                  value={item.desc || ''}
                  onChange={(e) => updateArrayItem('items', idx, { desc: e.target.value })}
                  className="text-xs"
                />
                <MediaUploaderField
                  label="Gambar Kartu (Opsional)"
                  accept="image"
                  value={item.imageUrl || ''}
                  onChange={(url) => updateArrayItem('items', idx, { imageUrl: url })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. BENEFITS FORM */}
      {type === 'benefits' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Manfaat</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Sub-judul</Label>
            <Textarea
              rows={2}
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <MediaUploaderField
            label="Gambar Mockup / Ilustrasi Laporan (Opsional)"
            accept="image"
            value={data.imageUrl || ''}
            onChange={(url) => updateData({ imageUrl: url })}
          />

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700">Daftar Manfaat</Label>
              <button
                type="button"
                onClick={() =>
                  addArrayItem('items', {
                    title: 'Manfaat Baru',
                    desc: 'Penjelasan singkat manfaat yang diperoleh peserta.',
                  })
                }
                className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Manfaat
              </button>
            </div>
            {(data.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">Manfaat #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('items', idx)}
                    className="text-[10px] text-rose-600 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
                <Input
                  placeholder="Judul manfaat"
                  value={item.title || ''}
                  onChange={(e) => updateArrayItem('items', idx, { title: e.target.value })}
                  className="text-xs font-semibold h-8"
                />
                <Textarea
                  rows={2}
                  placeholder="Deskripsi manfaat"
                  value={item.desc || ''}
                  onChange={(e) => updateArrayItem('items', idx, { desc: e.target.value })}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TESTIMONIALS FORM */}
      {type === 'testimonials' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Testimoni</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Sub-judul</Label>
            <Input
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <div className="space-y-2.5 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700">Daftar Testimoni</Label>
              <button
                type="button"
                onClick={() =>
                  addArrayItem('items', {
                    name: 'Nama Peserta',
                    role: 'Profesi / Kota',
                    avatar: '',
                    rating: 5,
                    comment: 'Hasil asesmennya sangat akurat dan membuka wawasan baru!',
                    proofImageUrl: '',
                  })
                }
                className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Testimoni
              </button>
            </div>
            {(data.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">Testimoni #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('items', idx)}
                    className="text-[10px] text-rose-600 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
                <Input
                  placeholder="Nama"
                  value={item.name || ''}
                  onChange={(e) => updateArrayItem('items', idx, { name: e.target.value })}
                  className="text-xs font-semibold h-8"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Kota / Profesi"
                    value={item.role || ''}
                    onChange={(e) => updateArrayItem('items', idx, { role: e.target.value })}
                    className="text-xs h-8 flex-1"
                  />
                  <select
                    value={item.rating || 5}
                    onChange={(e) =>
                      updateArrayItem('items', idx, { rating: Number(e.target.value) })
                    }
                    className="bg-white border border-gray-200 rounded-lg px-2 text-xs h-8"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} ★
                      </option>
                    ))}
                  </select>
                </div>
                <Textarea
                  rows={2}
                  placeholder="Isi komentar testimoni..."
                  value={item.comment || ''}
                  onChange={(e) => updateArrayItem('items', idx, { comment: e.target.value })}
                  className="text-xs"
                />
                <MediaUploaderField
                  label="Foto Avatar Peserta (Upload/URL)"
                  accept="image"
                  value={item.avatar || ''}
                  onChange={(url) => updateArrayItem('items', idx, { avatar: url })}
                />
                <MediaUploaderField
                  label="Screenshot Bukti Chat WA (Opsional)"
                  accept="image"
                  value={item.proofImageUrl || ''}
                  onChange={(url) => updateArrayItem('items', idx, { proofImageUrl: url })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. FAQ FORM */}
      {type === 'faq' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul FAQ</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Sub-judul</Label>
            <Input
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700">Daftar Pertanyaan</Label>
              <button
                type="button"
                onClick={() =>
                  addArrayItem('items', {
                    question: 'Pertanyaan baru?',
                    answer: 'Jawaban penjelasan lengkap di sini.',
                  })
                }
                className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah FAQ
              </button>
            </div>
            {(data.items || []).map((faq: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">FAQ #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('items', idx)}
                    className="text-[10px] text-rose-600 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
                <Input
                  placeholder="Pertanyaan"
                  value={faq.question || ''}
                  onChange={(e) => updateArrayItem('items', idx, { question: e.target.value })}
                  className="text-xs font-semibold h-8"
                />
                <Textarea
                  rows={2}
                  placeholder="Jawaban"
                  value={faq.answer || ''}
                  onChange={(e) => updateArrayItem('items', idx, { answer: e.target.value })}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. CTA BANNER FORM */}
      {type === 'ctaBanner' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Banner</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Sub-judul</Label>
            <Textarea
              rows={2}
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <MediaUploaderField
            label="Gambar Banner (Opsional)"
            accept="image"
            value={data.imageUrl || ''}
            onChange={(url) => updateData({ imageUrl: url })}
          />
          <div>
            <Label className="text-[11px] text-gray-600">Teks Tombol CTA</Label>
            <Input
              value={data.ctaText || ''}
              onChange={(e) => updateData({ ctaText: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
        </div>
      )}

      {/* 11. ORDER FORM (FORMULIR.COM STYLE) */}
      {type === 'orderForm' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Badge Atas</Label>
            <Input
              value={data.badge || ''}
              onChange={(e) => updateData({ badge: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Judul Formulir</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Sub-judul Formulir</Label>
            <Textarea
              rows={2}
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Teks Tombol Checkout</Label>
            <Input
              value={page.formConfig?.ctaButtonText || 'AMBIL TES SEKARANG'}
              onChange={(e) =>
                onUpdatePage((prev) => ({
                  ...prev,
                  formConfig: { ...prev.formConfig, ctaButtonText: e.target.value },
                }))
              }
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Teks Garansi Bawah Tombol</Label>
            <Input
              value={page.formConfig?.guaranteeText || ''}
              onChange={(e) =>
                onUpdatePage((prev) => ({
                  ...prev,
                  formConfig: { ...prev.formConfig, guaranteeText: e.target.value },
                }))
              }
              placeholder="🔒 Pembayaran Terverifikasi Otomatis (QRIS, VA Bank & E-Wallet)"
              className="mt-1 bg-white text-xs"
            />
          </div>

          {/* Opsi Metode Pembayaran WhatsApp */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[11px] font-bold text-gray-700 block">
                  Opsi Pembayaran via WhatsApp
                </Label>
                <span className="text-[10px] text-gray-500 block leading-tight">
                  Aktifkan jika ingin menyediakan opsi chat admin manual selain Payment Gateway
                </span>
              </div>
              <Switch
                checked={Boolean(page.formConfig?.enableWhatsappCheckout)}
                onCheckedChange={(val) =>
                  onUpdatePage((prev) => ({
                    ...prev,
                    formConfig: { ...prev.formConfig, enableWhatsappCheckout: val },
                  }))
                }
              />
            </div>

            {page.formConfig?.enableWhatsappCheckout && (
              <div className="pt-1.5">
                <Label className="text-[10px] font-semibold text-gray-600">
                  Nomor WhatsApp Admin (Format Internasional contoh: 6281234567890)
                </Label>
                <Input
                  value={page.formConfig?.whatsappAdminNumber ?? ''}
                  onChange={(e) =>
                    onUpdatePage((prev) => ({
                      ...prev,
                      formConfig: { ...prev.formConfig, whatsappAdminNumber: e.target.value },
                    }))
                  }
                  placeholder="Contoh: 6281234567890"
                  className="mt-1 bg-white text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Pengaturan Field Inti Checkout */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <Label className="text-[11px] font-bold text-gray-700 block">
              Field Wajib Checkout (Label & Placeholder):
            </Label>
            <div className="space-y-1.5 bg-white p-2 rounded border border-gray-200">
              {(
                [
                  { key: 'fullName', defaultLabel: 'Nama Lengkap', defaultPlaceholder: 'Nama Lengkap Anda' },
                  { key: 'whatsapp', defaultLabel: 'Nomor WhatsApp', defaultPlaceholder: 'Nomor WhatsApp (Contoh: 08123456789)' },
                  { key: 'email', defaultLabel: 'Alamat Email', defaultPlaceholder: 'Alamat Email Aktif' },
                ] as const
              ).map((core) => {
                const currentCore = page.formConfig?.coreFields?.[core.key] || {};
                return (
                  <div key={core.key} className="grid grid-cols-2 gap-1.5">
                    <Input
                      value={currentCore.label ?? core.defaultLabel}
                      onChange={(e) =>
                        onUpdatePage((prev) => ({
                          ...prev,
                          formConfig: {
                            ...prev.formConfig,
                            coreFields: {
                              ...prev.formConfig?.coreFields,
                              [core.key]: {
                                ...prev.formConfig?.coreFields?.[core.key],
                                label: e.target.value,
                              },
                            },
                          },
                        }))
                      }
                      className="text-[11px] h-7"
                      placeholder={`Label ${core.defaultLabel}`}
                    />
                    <Input
                      value={currentCore.placeholder ?? core.defaultPlaceholder}
                      onChange={(e) =>
                        onUpdatePage((prev) => ({
                          ...prev,
                          formConfig: {
                            ...prev.formConfig,
                            coreFields: {
                              ...prev.formConfig?.coreFields,
                              [core.key]: {
                                ...prev.formConfig?.coreFields?.[core.key],
                                placeholder: e.target.value,
                              },
                            },
                          },
                        }))
                      }
                      className="text-[11px] h-7"
                      placeholder="Placeholder input"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Form Fields Builder */}
          {(() => {
            const customFields: CustomFormField[] = resolveCustomFormFields(page.formConfig);
            const commitFields = (nextFields: CustomFormField[]) => {
              onUpdatePage((prev) => ({
                ...prev,
                formConfig: {
                  ...prev.formConfig,
                  customFields: nextFields,
                },
              }));
            };
            const updateField = (idx: number, patch: Partial<CustomFormField>) => {
              const next = [...customFields];
              next[idx] = { ...next[idx], ...patch };
              commitFields(next);
            };
            const moveField = (idx: number, dir: -1 | 1) => {
              const target = idx + dir;
              if (target < 0 || target >= customFields.length) return;
              const next = [...customFields];
              [next[idx], next[target]] = [next[target], next[idx]];
              commitFields(next);
            };
            const removeField = (idx: number) => {
              commitFields(customFields.filter((_, i) => i !== idx));
            };
            const addField = (presetKey?: string) => {
              commitFields([...customFields, createCustomFormField(presetKey)]);
            };

            return (
              <div className="pt-2 border-t border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-bold text-gray-700">
                    Field Formulir Custom ({customFields.length})
                  </Label>
                  <button
                    type="button"
                    onClick={() => addField()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-600 text-white text-[10px] font-semibold hover:bg-purple-700 transition"
                  >
                    <Plus className="w-3 h-3" /> Tambah Field
                  </button>
                </div>

                {/* Preset Quick-Add Chips */}
                <div className="bg-white p-2 rounded border border-gray-200 space-y-1">
                  <span className="text-[10px] font-semibold text-gray-500 block">
                    Tambah Cepat Preset:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {CUSTOM_FIELD_PRESETS.map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => addField(preset.key)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {customFields.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic text-center py-2 bg-white rounded border border-dashed border-gray-200">
                    Belum ada field custom. Klik "+ Tambah Field" atau pilih preset di atas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customFields.map((field, idx) => {
                      const needsOptions =
                        field.type === 'select' ||
                        field.type === 'radio' ||
                        field.type === 'checkbox';
                      return (
                        <div
                          key={field.id}
                          className={`p-2.5 rounded-lg border space-y-2 ${
                            field.enabled !== false
                              ? 'bg-white border-gray-200'
                              : 'bg-gray-50 border-gray-200 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-purple-700 truncate">
                              #{idx + 1} {field.label || 'Field Tanpa Label'}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveField(idx, -1)}
                                disabled={idx === 0}
                                className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                                title="Naikkan"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveField(idx, 1)}
                                disabled={idx === customFields.length - 1}
                                className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                                title="Turunkan"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeField(idx)}
                                className="p-0.5 text-red-400 hover:text-red-600"
                                title="Hapus Field"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <Label className="text-[10px] text-gray-500">Label Field</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(idx, { label: e.target.value })}
                                className="text-[11px] h-7 mt-0.5"
                                placeholder="Contoh: Instansi / Perusahaan"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-gray-500">Tipe Input</Label>
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const nextType = e.target.value as CustomFieldType;
                                  const patch: Partial<CustomFormField> = { type: nextType };
                                  if (
                                    (nextType === 'select' ||
                                      nextType === 'radio' ||
                                      nextType === 'checkbox') &&
                                    (!field.options || field.options.length === 0)
                                  ) {
                                    patch.options = ['Opsi 1', 'Opsi 2'];
                                  }
                                  updateField(idx, patch);
                                }}
                                className="w-full h-7 mt-0.5 rounded-md border border-gray-200 bg-white px-1.5 text-[11px] text-gray-800"
                              >
                                <option value="text">Teks Singkat</option>
                                <option value="textarea">Teks Panjang / Paragraf</option>
                                <option value="number">Angka</option>
                                <option value="tel">Nomor HP / Telepon</option>
                                <option value="email">Email</option>
                                <option value="date">Tanggal</option>
                                <option value="select">Dropdown Pilihan</option>
                                <option value="radio">Pilihan Tunggal (Radio)</option>
                                <option value="checkbox">Centang / Multi-Pilih</option>
                              </select>
                            </div>
                          </div>

                          {!needsOptions && field.type !== 'date' && (
                            <div>
                              <Label className="text-[10px] text-gray-500">Placeholder</Label>
                              <Input
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                                className="text-[11px] h-7 mt-0.5"
                                placeholder="Teks bantuan di dalam input"
                              />
                            </div>
                          )}

                          {needsOptions && (
                            <div>
                              <Label className="text-[10px] text-gray-500">
                                Daftar Opsi (pisahkan dengan koma atau baris baru)
                              </Label>
                              <Textarea
                                rows={2}
                                value={(field.options || []).join(', ')}
                                onChange={(e) =>
                                  updateField(idx, {
                                    options: e.target.value
                                      .split(/[\n,]+/)
                                      .map((s) => s.trimStart()),
                                  })
                                }
                                onBlur={(e) =>
                                  updateField(idx, {
                                    options: e.target.value
                                      .split(/[\n,]+/)
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                                className="text-[11px] mt-0.5"
                                placeholder="Opsi A, Opsi B, Opsi C"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                            <label className="flex items-center gap-1.5 text-[10px] text-gray-600 cursor-pointer">
                              <Switch
                                checked={field.enabled !== false}
                                onCheckedChange={(val) => updateField(idx, { enabled: val })}
                              />
                              Tampilkan
                            </label>
                            <label className="flex items-center gap-1.5 text-[10px] text-gray-600 cursor-pointer">
                              <Switch
                                checked={Boolean(field.required)}
                                onCheckedChange={(val) => updateField(idx, { required: val })}
                              />
                              Wajib Diisi
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Package Pricing Settings (Otomatis dari Database) */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700 block">
                Pilihan Paket Token (Database Master):
              </Label>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                ✓ Otomatis DB
              </span>
            </div>
            <div className="space-y-1.5">
              {dbPackages.map((pkg) => {
                const isFeatured =
                  (page.formConfig?.featuredPackageId || dbPackages[0]?.id) === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                      isFeatured ? 'border-amber-400 bg-amber-50/50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-gray-900">{pkg.name}</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 rounded">
                          {pkg.defaultTokenAmount} Token
                        </span>
                      </div>
                      <div className="text-xs font-black text-amber-600 mt-0.5">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePage((prev) => ({
                          ...prev,
                          formConfig: { ...prev.formConfig, featuredPackageId: pkg.id },
                        }))
                      }
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        isFeatured
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {isFeatured ? '★ Populer' : 'Pilih Populer'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voucher Settings (Otomatis dari Database) */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-gray-700 block">
                Voucher Diskon Otomatis:
              </Label>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {dbVouchers.length} Voucher Aktif
              </span>
            </div>
            <div className="space-y-1.5">
              {dbVouchers.map((v) => {
                const isDefault = page.formConfig?.defaultVoucherCode === v.code;
                return (
                  <div
                    key={v.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isDefault ? 'border-indigo-600 bg-indigo-50/60' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-indigo-700">{v.code}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        Diskon:{' '}
                        {v.type === 'percentage'
                          ? `${v.value}%`
                          : `Rp ${v.value.toLocaleString('id-ID')}`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePage((prev) => ({
                          ...prev,
                          formConfig: {
                            ...prev.formConfig,
                            defaultVoucherCode: isDefault ? '' : v.code,
                          },
                        }))
                      }
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        isDefault
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {isDefault ? '✓ Otomatis Diterapkan' : 'Set Default'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Social Proof Toggle */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
            <div>
              <Label className="text-[11px] font-bold text-gray-700 block">
                Live Order Ticker (Social Proof):
              </Label>
              <p className="text-[10px] text-gray-400">
                Popup looping nama pembeli live di landing page.
              </p>
            </div>
            <Switch
              checked={page.formConfig?.showLiveOrdersTicker !== false}
              onCheckedChange={(val) =>
                onUpdatePage((prev) => ({
                  ...prev,
                  formConfig: { ...prev.formConfig, showLiveOrdersTicker: val },
                }))
              }
            />
          </div>
        </div>
      )}

      {/* 12. STICKY MOBILE CTA FORM */}
      {type === 'stickyMobileCta' && (
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-gray-600">Teks Tombol Melayang</Label>
            <Input
              value={data.buttonText || ''}
              onChange={(e) => updateData({ buttonText: e.target.value })}
              className="mt-1 bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-600">Sub-teks Promo</Label>
            <Input
              value={data.subtext || ''}
              onChange={(e) => updateData({ subtext: e.target.value })}
              className="mt-1 bg-white text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};

