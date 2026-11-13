import React from 'react';
import {
  Calendar,
  Phone,
  Mail,
  FileText,
  Hash,
  Check,
  ChevronDown,
} from 'lucide-react';
import { CustomFormField, LandingPageThemeConfig } from '@/types/landingPage';
import { resolveTheme } from '@/utils/landingPageMedia';

interface DynamicFormFieldRendererProps {
  field: CustomFormField;
  value: any;
  onChange?: (value: any) => void;
  theme?: LandingPageThemeConfig;
  disabled?: boolean;
  compact?: boolean;
}

export const DynamicFormFieldRenderer: React.FC<DynamicFormFieldRendererProps> = ({
  field,
  value,
  onChange,
  theme: rawTheme,
  disabled = false,
  compact = false,
}) => {
  const theme = resolveTheme(rawTheme);
  const isLight = theme.isLightCard;

  const inputBg = isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)';
  const inputBorder = isLight ? theme.cardBorderColor || '#E2E8F0' : 'rgba(255, 255, 255, 0.12)';

  const [isFocused, setIsFocused] = React.useState(false);

  const baseContainerStyle: React.CSSProperties = {
    backgroundColor: inputBg,
    borderColor: isFocused ? theme.primaryColor : inputBorder,
    color: theme.textColor,
    boxShadow: isFocused ? `0 0 0 3px ${theme.primaryColor}22` : '0 1px 2px rgba(0,0,0,0.03)',
  };

  const optionsList = Array.isArray(field.options)
    ? field.options.filter((o) => o && o.trim() !== '')
    : [];

  const renderIcon = () => {
    const iconClass = 'w-4 h-4 shrink-0 transition';
    const iconStyle = { color: isFocused ? theme.primaryColor : theme.mutedTextColor };

    switch (field.type) {
      case 'date':
        return <Calendar className={iconClass} style={iconStyle} />;
      case 'tel':
        return <Phone className={iconClass} style={iconStyle} />;
      case 'email':
        return <Mail className={iconClass} style={iconStyle} />;
      case 'number':
        return <Hash className={iconClass} style={iconStyle} />;
      case 'textarea':
        return <FileText className={iconClass} style={iconStyle} />;
      default:
        return null;
    }
  };

  return (
    <div className="text-left space-y-1.5">
      <label
        style={{ color: theme.textColor }}
        className="text-xs font-semibold flex items-center justify-between"
      >
        <span className="flex items-center gap-1.5">
          {field.label}
          {field.required && (
            <span className="text-rose-500 font-bold" title="Wajib diisi">
              *
            </span>
          )}
        </span>
        {field.required && (
          <span
            style={{ color: theme.mutedTextColor }}
            className="text-[10px] font-normal opacity-75"
          >
            Wajib
          </span>
        )}
      </label>

      {/* TEXTAREA */}
      {field.type === 'textarea' && (
        <div
          style={baseContainerStyle}
          className={`w-full border rounded-xl transition-all duration-200 p-2.5 sm:p-3 flex gap-2.5 items-start`}
        >
          <div className="pt-0.5">{renderIcon()}</div>
          <textarea
            rows={compact ? 2 : 3}
            disabled={disabled}
            required={field.required && !disabled}
            placeholder={field.placeholder || 'Tulis pesan atau catatan di sini...'}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ color: theme.textColor }}
            className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm focus:outline-none resize-none placeholder:text-gray-400"
          />
        </div>
      )}

      {/* SELECT DROPDOWN */}
      {field.type === 'select' && (
        <div
          style={baseContainerStyle}
          className="relative w-full border rounded-xl transition-all duration-200"
        >
          <select
            disabled={disabled}
            required={field.required && !disabled}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              color: value ? theme.textColor : theme.mutedTextColor,
              backgroundColor: isLight ? '#FFFFFF' : '#0F172A',
            }}
            className={`w-full appearance-none bg-transparent border-0 text-xs sm:text-sm ${
              compact ? 'px-3 py-2.5' : 'px-4 py-3'
            } pr-9 rounded-xl focus:outline-none cursor-pointer`}
          >
            <option value="" style={{ color: theme.mutedTextColor }}>
              {field.placeholder || `Pilih salah satu ${field.label}...`}
            </option>
            {optionsList.map((opt, idx) => (
              <option
                key={idx}
                value={opt}
                style={{
                  backgroundColor: isLight ? '#FFFFFF' : '#0F172A',
                  color: isLight ? '#0F172A' : '#F8FAFC',
                }}
              >
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            style={{ color: theme.mutedTextColor }}
            className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      )}

      {/* RADIO BUTTONS (MODERN PILLS / CARDS) */}
      {field.type === 'radio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          {optionsList.length > 0 ? (
            optionsList.map((opt, idx) => {
              const checked = value === opt;
              return (
                <div
                  key={idx}
                  onClick={() => !disabled && onChange?.(opt)}
                  style={{
                    borderColor: checked ? theme.primaryColor : inputBorder,
                    backgroundColor: checked
                      ? isLight
                        ? `${theme.primaryColor}0C`
                        : `${theme.primaryColor}22`
                      : inputBg,
                    boxShadow: checked ? `0 4px 12px ${theme.primaryColor}18` : 'none',
                  }}
                  className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
                    disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01]'
                  }`}
                >
                  <span
                    style={{
                      color: checked ? (isLight ? theme.primaryColor : '#FFFFFF') : theme.textColor,
                      fontWeight: checked ? 700 : 500,
                    }}
                    className="text-xs"
                  >
                    {opt}
                  </span>
                  <div
                    style={{
                      borderColor: checked ? theme.primaryColor : isLight ? '#CBD5E1' : 'rgba(255,255,255,0.25)',
                      backgroundColor: checked ? theme.primaryColor : 'transparent',
                    }}
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2"
                  >
                    {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })
          ) : (
            <span style={{ color: theme.mutedTextColor }} className="text-xs italic">
              Belum ada opsi pilihan radio.
            </span>
          )}
        </div>
      )}

      {/* CHECKBOXES (MODERN TOGGLES / CARDS) */}
      {field.type === 'checkbox' && (
        <div className="space-y-2 pt-0.5">
          {optionsList.length > 0 ? (
            optionsList.map((opt, idx) => {
              const selectedArr: string[] = Array.isArray(value) ? value : [];
              const checked = selectedArr.includes(opt);
              const toggleOpt = () => {
                if (disabled || !onChange) return;
                if (checked) {
                  onChange(selectedArr.filter((v) => v !== opt));
                } else {
                  onChange([...selectedArr, opt]);
                }
              };

              return (
                <div
                  key={idx}
                  onClick={toggleOpt}
                  style={{
                    borderColor: checked ? theme.primaryColor : inputBorder,
                    backgroundColor: checked
                      ? isLight
                        ? `${theme.primaryColor}0C`
                        : `${theme.primaryColor}22`
                      : inputBg,
                    boxShadow: checked ? `0 4px 12px ${theme.primaryColor}18` : 'none',
                  }}
                  className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
                    disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.005]'
                  }`}
                >
                  <span
                    style={{
                      color: checked ? (isLight ? theme.primaryColor : '#FFFFFF') : theme.textColor,
                      fontWeight: checked ? 700 : 500,
                    }}
                    className="text-xs"
                  >
                    {opt}
                  </span>
                  <div
                    style={{
                      borderColor: checked ? theme.primaryColor : isLight ? '#CBD5E1' : 'rgba(255,255,255,0.25)',
                      backgroundColor: checked ? theme.primaryColor : 'transparent',
                    }}
                    className="w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ml-2 transition"
                  >
                    {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              onClick={() => !disabled && onChange?.(value ? '' : 'Ya')}
              style={{
                borderColor: value ? theme.primaryColor : inputBorder,
                backgroundColor: value
                  ? isLight
                    ? `${theme.primaryColor}0C`
                    : `${theme.primaryColor}22`
                  : inputBg,
              }}
              className="p-3 rounded-xl border transition flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div
                style={{
                  borderColor: value ? theme.primaryColor : isLight ? '#CBD5E1' : 'rgba(255,255,255,0.25)',
                  backgroundColor: value ? theme.primaryColor : 'transparent',
                }}
                className="w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0"
              >
                {Boolean(value) && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </div>
              <span style={{ color: theme.textColor }} className="text-xs font-medium">
                {field.placeholder || 'Ya, saya mengonfirmasi data di atas.'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* STANDARD INPUTS: text, number, tel, email, date */}
      {['text', 'number', 'tel', 'email', 'date'].includes(field.type) && (
        <div
          style={baseContainerStyle}
          className={`w-full border rounded-xl transition-all duration-200 flex items-center gap-2.5 ${
            compact ? 'px-3 py-2' : 'px-4 py-3'
          }`}
        >
          {renderIcon()}
          <input
            type={field.type}
            disabled={disabled}
            required={field.required && !disabled}
            placeholder={field.placeholder || ''}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ color: theme.textColor }}
            className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm focus:outline-none placeholder:text-gray-400"
          />
        </div>
      )}
    </div>
  );
};
