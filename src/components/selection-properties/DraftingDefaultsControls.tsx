import { BackgroundImageConfig, CADDefaultStyle, ProjectSettings } from '../../types/cad';
import { TELECOM_PALETTE } from '../../utils/stencils';
import { CAD_DRAFTING_PALETTE } from './StrokeFillCustomizer';
import { CADStandardsCustomizer } from './CADStandardsCustomizer';
import { CAD_FONTS, getCADFontById, getSafeFontCss } from '../../utils/cad-fonts';
import { Type, Sparkles } from 'lucide-react';

interface DraftingDefaultsControlsProps {
  defaultStyle: CADDefaultStyle;
  onUpdateDefaultStyle: (partial: Partial<CADDefaultStyle>) => void;
  bgImage: BackgroundImageConfig | null;
  onUpdateBgImage: (partial: Partial<BackgroundImageConfig> | null) => void;
  settings: ProjectSettings;
  onUpdateSettings?: (partial: Partial<ProjectSettings>) => void;
}

export const DraftingDefaultsControls: React.FC<DraftingDefaultsControlsProps> = ({
  defaultStyle,
  onUpdateDefaultStyle,
  bgImage,
  onUpdateBgImage,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="p-3.5 space-y-4 text-xs">
      {/* Default Linework & Drawing Colors */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
          Default Linework &amp; Styling
        </span>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Applied automatically to all newly drawn lines, wires, shapes, and enclosures.
        </p>

        {/* Stroke Width */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Line / Stroke Width</span>
            <span className="font-mono text-sky-300">{defaultStyle.strokeWidth} px</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="12"
            step="0.5"
            value={defaultStyle.strokeWidth}
            onChange={(e) =>
              onUpdateDefaultStyle({ strokeWidth: parseFloat(e.target.value) })
            }
            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 6].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onUpdateDefaultStyle({ strokeWidth: w })}
                className={`flex-1 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                  defaultStyle.strokeWidth === w
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>
        </div>

        {/* Line / Stroke Color */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-300 font-semibold">2D Drafting &amp; Line Color</span>
            <span className="text-[9px] font-mono text-sky-400">Not fixed on black</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={defaultStyle.stroke && defaultStyle.stroke.startsWith('#') ? defaultStyle.stroke : '#38bdf8'}
              onChange={(e) => onUpdateDefaultStyle({ stroke: e.target.value })}
              className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
              title="Pick default 2D drafting color"
            />
            <input
              type="text"
              value={defaultStyle.stroke || '#38bdf8'}
              onChange={(e) => onUpdateDefaultStyle({ stroke: e.target.value })}
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Quick 2D CAD Drafting Colors */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-slate-400 font-medium">CAD Drafting Palette:</span>
            <div className="grid grid-cols-6 gap-1.5">
              {CAD_DRAFTING_PALETTE.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onUpdateDefaultStyle({ stroke: p.color })}
                  title={p.name}
                  style={{ backgroundColor: p.color }}
                  className="w-full h-5 rounded border border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Quick Telecom Signal Presets */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-slate-500">Telecom Signal Presets:</span>
            <div className="grid grid-cols-6 gap-1.5">
              {TELECOM_PALETTE.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onUpdateDefaultStyle({ stroke: p.color })}
                  title={p.name}
                  style={{ backgroundColor: p.color }}
                  className="w-full h-5 rounded border border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Default Fill Color */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Default Shape Fill</span>
            <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-400">
              <input
                type="checkbox"
                checked={defaultStyle.fillEnabled}
                onChange={(e) => onUpdateDefaultStyle({ fillEnabled: e.target.checked })}
                className="accent-sky-500 rounded"
              />
              <span>Fill</span>
            </label>
          </div>
          {defaultStyle.fillEnabled && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={defaultStyle.fill && defaultStyle.fill.startsWith('#') ? defaultStyle.fill : '#1e293b'}
                onChange={(e) => onUpdateDefaultStyle({ fill: e.target.value })}
                className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={defaultStyle.fill || '#1e293b'}
                onChange={(e) => onUpdateDefaultStyle({ fill: e.target.value })}
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Default CAD Typography & Fonts */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-sky-400" />
            Default Drafting Typography
          </span>
          <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/60">
            {getCADFontById(defaultStyle.fontFamily || settings.defaultFontFamily).badge}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Default typeface applied to all newly placed texts, leader callouts, and dimension station tags.
        </p>

        {/* Font Family Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-300 font-semibold block">
            CAD Drafting Font Family
          </label>
          <select
            value={getCADFontById(defaultStyle.fontFamily || settings.defaultFontFamily).id}
            onChange={(e) => {
              const fontId = e.target.value;
              onUpdateDefaultStyle({ fontFamily: fontId });
              if (onUpdateSettings) {
                onUpdateSettings({ defaultFontFamily: fontId });
              }
            }}
            className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
          >
            {CAD_FONTS.map((f) => (
              <option key={f.id} value={f.id} className="bg-slate-900 text-slate-200 py-1">
                {f.name} [{f.badge}] — {f.categoryLabel}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Popular Font Presets */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-medium">Quick Typography Presets:</span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'titillium-web', label: 'Titillium', badge: 'ISO CAD' },
              { id: 'jetbrains-mono', label: 'JetBrains', badge: 'Mono' },
              { id: 'inter', label: 'Inter', badge: 'Modern' },
              { id: 'oswald', label: 'Oswald', badge: 'DIN' },
              { id: 'architects-daughter', label: 'Architect', badge: 'Draft' },
              { id: 'roboto', label: 'Roboto', badge: 'Sans' },
            ].map((preset) => {
              const activeId = getCADFontById(defaultStyle.fontFamily || settings.defaultFontFamily).id;
              const isSelected = activeId === preset.id;
              const fontObj = getCADFontById(preset.id);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onUpdateDefaultStyle({ fontFamily: preset.id });
                    if (onUpdateSettings) {
                      onUpdateSettings({ defaultFontFamily: preset.id });
                    }
                  }}
                  className={`px-1.5 py-1 rounded-md text-[10px] border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span style={{ fontFamily: fontObj.family }} className="truncate max-w-full">
                    {preset.label}
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-mono">{preset.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Typography Preview Specimen */}
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
            <span>SPECIMEN PREVIEW</span>
            <span>{getCADFontById(defaultStyle.fontFamily || settings.defaultFontFamily).name}</span>
          </div>
          <div
            className="text-[13px] text-sky-300 font-medium tracking-wide truncate"
            style={{ fontFamily: getSafeFontCss(defaultStyle.fontFamily || settings.defaultFontFamily) }}
          >
            STA 12+450 • -48V DC BUS • 2400×1800mm
          </div>
          <div
            className="text-[10px] text-slate-400 truncate"
            style={{ fontFamily: getSafeFontCss(defaultStyle.fontFamily || settings.defaultFontFamily) }}
          >
            ISO 128-20 Technical Telecom Site Layout Annotation
          </div>
        </div>

        {/* Default Text Size */}
        <div className="space-y-1 pt-1 border-t border-slate-800/80">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Default Font Size</span>
            <span className="font-mono text-sky-300">{defaultStyle.fontSize || 12}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            value={defaultStyle.fontSize || 12}
            onChange={(e) => onUpdateDefaultStyle({ fontSize: parseInt(e.target.value) })}
            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex items-center gap-1 pt-1">
            {[10, 12, 14, 16, 20].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => onUpdateDefaultStyle({ fontSize: sz })}
                className={`flex-1 py-0.5 rounded text-[9.5px] font-mono border transition-colors cursor-pointer ${
                  (defaultStyle.fontSize || 12) === sz
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Background Image Controls (if image is loaded) */}
      {bgImage && (
        <div className="space-y-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
              Site Floorplan Image
            </span>
            <button
              onClick={() => onUpdateBgImage(null)}
              className="text-rose-400 hover:text-rose-300 text-[10px] underline"
            >
              Remove
            </button>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Tracing Opacity</span>
              <span className="font-mono text-sky-300">
                {Math.round(bgImage.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={bgImage.opacity}
              onChange={(e) =>
                onUpdateBgImage({ opacity: parseFloat(e.target.value) })
              }
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={bgImage.locked}
                onChange={(e) => onUpdateBgImage({ locked: e.target.checked })}
                className="accent-sky-500 rounded"
              />
              <span>Lock image position</span>
            </label>
          </div>
        </div>
      )}

      {/* CAD Drafting Standards & Scale Summary */}
      <CADStandardsCustomizer settings={settings} onUpdateSettings={onUpdateSettings} />
    </div>
  );
};
