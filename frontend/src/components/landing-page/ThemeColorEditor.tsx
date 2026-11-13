import React from 'react';
import { Flame, Sparkles, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LandingPageThemeConfig } from '@/types/landingPage';
import { THEME_PRESETS, resolveTheme } from '@/utils/landingPageMedia';
import { MediaUploaderField } from './MediaUploaderField';

interface ThemeColorEditorProps {
  themeConfig?: LandingPageThemeConfig;
  onChange: (nextTheme: LandingPageThemeConfig) => void;
}

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const ColorRow: React.FC<ColorRowProps> = ({ label, value, onChange }) => {
  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#1E293B';
  return (
    <div>
      <Label className="text-[11px] font-semibold text-gray-700">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="color"
          value={safeHex}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 shrink-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs h-8 bg-white"
        />
      </div>
    </div>
  );
};

export const ThemeColorEditor: React.FC<ThemeColorEditorProps> = ({
  themeConfig,
  onChange,
}) => {
  const resolved = resolveTheme(themeConfig);

  const patchTheme = (patch: Partial<LandingPageThemeConfig>) => {
    onChange({ ...(themeConfig || {}), ...patch });
  };

  return (
    <div className="space-y-5 text-xs">
      {/* 1. Preset Tema Cepat */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Preset Tema Siap Pakai (1-Klik)
        </Label>
        <div className="grid grid-cols-1 gap-1.5">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => patchTheme(preset.config)}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-indigo-400 bg-white text-left flex items-center justify-between gap-2 transition group"
            >
              <div>
                <div className="font-bold text-xs text-gray-800 group-hover:text-indigo-600">
                  {preset.name}
                </div>
                <div className="text-[10px] text-gray-500 line-clamp-1">
                  {preset.description}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: preset.config.backgroundColor }}
                />
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: preset.config.primaryColor }}
                />
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: preset.config.accentColor }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Kustomisasi Warna Lengkap */}
      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
        <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-600" />
          Kustomisasi Warna Halaman & Komponen
        </Label>

        <div className="grid grid-cols-2 gap-2.5">
          <ColorRow
            label="Background Halaman"
            value={resolved.backgroundColor}
            onChange={(val) => patchTheme({ backgroundColor: val })}
          />
          <ColorRow
            label="Background Kartu"
            value={resolved.cardBackgroundColor}
            onChange={(val) => patchTheme({ cardBackgroundColor: val })}
          />
          <ColorRow
            label="Border Kartu"
            value={resolved.cardBorderColor}
            onChange={(val) => patchTheme({ cardBorderColor: val })}
          />
          <ColorRow
            label="Teks Utama"
            value={resolved.textColor}
            onChange={(val) => patchTheme({ textColor: val })}
          />
          <ColorRow
            label="Teks Deskripsi"
            value={resolved.mutedTextColor}
            onChange={(val) => patchTheme({ mutedTextColor: val })}
          />
          <ColorRow
            label="Warna Utama (Primary)"
            value={resolved.primaryColor}
            onChange={(val) => patchTheme({ primaryColor: val })}
          />
          <ColorRow
            label="Warna Sekunder"
            value={resolved.secondaryColor}
            onChange={(val) => patchTheme({ secondaryColor: val })}
          />
          <ColorRow
            label="Tombol CTA (Accent)"
            value={resolved.accentColor}
            onChange={(val) => patchTheme({ accentColor: val })}
          />
          <ColorRow
            label="Teks Tombol CTA"
            value={resolved.buttonTextColor}
            onChange={(val) => patchTheme({ buttonTextColor: val })}
          />
        </div>
      </div>

      {/* 3. Tipografi, Bentuk & Pola Background */}
      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
        <Label className="text-xs font-bold text-gray-700 block">
          Tipografi, Sudut & Gaya Tampilan
        </Label>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label className="text-[11px] text-gray-600">Jenis Font</Label>
            <select
              value={resolved.fontFamily}
              onChange={(e) => patchTheme({ fontFamily: e.target.value })}
              className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Inter">Inter (Modern Clean)</option>
              <option value="Poppins">Poppins (Friendly)</option>
              <option value="Outfit">Outfit (Bold Ads)</option>
              <option value="Montserrat">Montserrat (High Impact)</option>
              <option value="Georgia, serif">Serif (Editorial)</option>
            </select>
          </div>

          <div>
            <Label className="text-[11px] text-gray-600">Bentuk Sudut Tombol</Label>
            <select
              value={resolved.buttonRadius}
              onChange={(e) => patchTheme({ buttonRadius: e.target.value })}
              className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
            >
              <option value="rounded-none">Kotak Tajam</option>
              <option value="rounded-lg">Agak Bulat (8px)</option>
              <option value="rounded-xl">Modern (12px)</option>
              <option value="rounded-2xl">Extra Rounded (16px)</option>
              <option value="rounded-full">Pill / Bulat Penuh</option>
            </select>
          </div>

          <div>
            <Label className="text-[11px] text-gray-600">Sudut Kartu Konten</Label>
            <select
              value={resolved.cardRadius}
              onChange={(e) => patchTheme({ cardRadius: e.target.value })}
              className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
            >
              <option value="rounded-lg">Minimalis (8px)</option>
              <option value="rounded-2xl">Modern (16px)</option>
              <option value="rounded-3xl">Soft Card (24px)</option>
            </select>
          </div>

          <div>
            <Label className="text-[11px] text-gray-600">Pola Background</Label>
            <select
              value={resolved.backgroundPattern}
              onChange={(e) =>
                patchTheme({
                  backgroundPattern: e.target.value as LandingPageThemeConfig['backgroundPattern'],
                })
              }
              className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
            >
              <option value="none">Polos (Solid)</option>
              <option value="radial-glow">Cahaya Gradient (Glow)</option>
              <option value="dots">Titik Halus (Dots)</option>
              <option value="grid">Garis Kotak (Grid)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Top Urgency Countdown Bar */}
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-600" />
            Top Urgency Countdown Bar
          </Label>
          <Switch
            checked={resolved.showUrgencyBar}
            onCheckedChange={(val) => patchTheme({ showUrgencyBar: val })}
          />
        </div>
        <div>
          <Label className="text-[10px] text-amber-800">Teks Promo Urgensi:</Label>
          <Input
            value={resolved.urgencyBarText}
            onChange={(e) => patchTheme({ urgencyBarText: e.target.value })}
            className="mt-1 bg-white text-xs"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-[10px] text-amber-800">Menit:</Label>
            <Input
              type="number"
              value={resolved.urgencyMinutes}
              onChange={(e) =>
                patchTheme({ urgencyMinutes: parseInt(e.target.value) || 15 })
              }
              className="mt-1 bg-white text-xs h-8"
            />
          </div>
          <ColorRow
            label="Gradient Kiri"
            value={resolved.urgencyBarBgFrom}
            onChange={(val) => patchTheme({ urgencyBarBgFrom: val })}
          />
          <ColorRow
            label="Gradient Kanan"
            value={resolved.urgencyBarBgTo}
            onChange={(val) => patchTheme({ urgencyBarBgTo: val })}
          />
        </div>
      </div>

      {/* 5. Logo Header & Footer */}
      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
        <Label className="text-xs font-bold text-gray-700 block">Branding Header & Footer</Label>
        <MediaUploaderField
          label="Logo Header Halaman (Opsional)"
          accept="image"
          value={resolved.headerLogoUrl}
          onChange={(url) => patchTheme({ headerLogoUrl: url })}
        />
        <div>
          <Label className="text-[11px] text-gray-600">Teks Footer</Label>
          <Input
            value={resolved.footerText}
            onChange={(e) => patchTheme({ footerText: e.target.value })}
            className="mt-1 bg-white text-xs"
          />
        </div>
      </div>
    </div>
  );
};

