import { AlertTriangle, ChevronDown, Dna, Factory, Leaf } from 'lucide-react';
import {
  NOVA_LABELS,
  hasFoodQualityFlags,
  type FoodQuality,
  type GmoStatus,
  type NovaGroup,
  type QualityBasis,
} from '@shared/foodQuality';

const NOVA_STYLE: Record<NovaGroup, string> = {
  1: 'bg-green-100 text-green-800 ring-green-300',
  2: 'bg-stone-100 text-stone-700 ring-stone-300',
  3: 'bg-amber-100 text-amber-900 ring-amber-300',
  4: 'bg-red-100 text-red-800 ring-red-300',
};

const NOVA_DETAIL: Record<NovaGroup, string> = {
  1: 'Whole or minimally processed: nothing added beyond drying, cooking, freezing or similar.',
  2: 'A culinary ingredient like oil, butter, sugar or salt, used to cook whole foods.',
  3: 'Processed: whole foods preserved or prepared with salt, sugar, oil or fermentation.',
  4: 'Ultra-processed (UPF): industrial formulations with ingredients you wouldn’t cook with at home, like emulsifiers, flavorings or modified starches.',
};

const GMO_CHIP: Record<GmoStatus, { label: string; style: string }> = {
  organic: { label: 'Organic', style: 'bg-green-100 text-green-800 ring-green-300' },
  'non-gmo': { label: 'Non-GMO', style: 'bg-green-100 text-green-800 ring-green-300' },
  bioengineered: { label: 'Bioengineered (GMO)', style: 'bg-violet-100 text-violet-800 ring-violet-300' },
  'may-contain': { label: 'May contain GMOs', style: 'bg-violet-50 text-violet-800 ring-violet-200' },
};

const BASIS_NOTE: Record<QualityBasis, string> = {
  label: 'from the product’s label data',
  ingredients: 'from the ingredient list',
  estimate: 'estimated from the name — check the package to be sure',
};

const chip = 'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4';
/** Estimates get a dashed outline so they read as less certain than label data. */
const outline = (basis: QualityBasis | null) => (basis === 'estimate' ? 'border border-dashed border-current' : 'ring-1');

function gmoDetail(quality: FoodQuality): string {
  switch (quality.gmo) {
    case 'organic':
      return 'Certified organic foods can’t use genetically modified ingredients.';
    case 'non-gmo':
      return 'Labeled non-GMO.';
    case 'bioengineered':
      return 'The label discloses bioengineered (genetically modified) ingredients.';
    case 'may-contain':
      return `Made with crops that are mostly genetically modified in the US unless organic: ${quality.gmoSources.join(', ')}.`;
    default:
      return '';
  }
}

/** Processing level, GMO status and additives of concern for one food. */
export function FoodQualityTags({
  quality,
  ingredients,
  className = '',
}: {
  quality: FoodQuality | null | undefined;
  ingredients?: string | null;
  className?: string;
}) {
  if (!hasFoodQualityFlags(quality)) return null;

  const { nova, novaBasis, gmo, gmoBasis, concerns } = quality;
  const shownConcerns = concerns.slice(0, 2);

  return (
    <details className={`group ${className}`} data-testid="food-quality-tags">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-1.5 [&::-webkit-details-marker]:hidden">
        {nova !== null && (
          <span className={`${chip} ${NOVA_STYLE[nova]} ${outline(novaBasis)}`} title={NOVA_DETAIL[nova]}>
            {nova === 4 ? <Factory className="h-3 w-3" /> : nova === 1 ? <Leaf className="h-3 w-3" /> : null}
            {novaBasis === 'estimate' ? `Likely ${NOVA_LABELS[nova].toLowerCase()}` : NOVA_LABELS[nova]}
          </span>
        )}
        {gmo && (
          <span className={`${chip} ${GMO_CHIP[gmo].style} ${outline(gmoBasis)}`} title={gmoDetail(quality)}>
            {gmo === 'organic' ? <Leaf className="h-3 w-3" /> : <Dna className="h-3 w-3" />}
            {GMO_CHIP[gmo].label}
          </span>
        )}
        {shownConcerns.map((concern) => (
          <span
            key={concern.id}
            className={`${chip} bg-orange-50 text-orange-800 ring-orange-300 ${outline(concern.basis)}`}
            title={concern.detail}
          >
            <AlertTriangle className="h-3 w-3" />
            {concern.label}
          </span>
        ))}
        {concerns.length > shownConcerns.length && (
          <span className={`${chip} bg-orange-50 text-orange-800 ring-1 ring-orange-300`}>+{concerns.length - shownConcerns.length} more</span>
        )}
        <span
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#1f4aa6] underline-offset-2 hover:underline"
          data-testid="food-quality-why"
        >
          Why?
          <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
        </span>
      </summary>

      <div className="mt-2 space-y-2 rounded-lg bg-amber-50/70 p-3 text-xs leading-relaxed text-gray-800 ring-1 ring-amber-200">
        {nova !== null && novaBasis && (
          <p>
            <span className="font-semibold">NOVA {nova} of 4.</span> {NOVA_DETAIL[nova]}{' '}
            {quality.novaMarkers.length > 0 && nova === 4 && <>Found: {quality.novaMarkers.join(', ')}. </>}
            <span className="text-gray-600">({BASIS_NOTE[novaBasis]})</span>
          </p>
        )}
        {gmo && gmoBasis && (
          <p>
            <span className="font-semibold">{GMO_CHIP[gmo].label}.</span> {gmoDetail(quality)}{' '}
            <span className="text-gray-600">({BASIS_NOTE[gmoBasis]})</span>
          </p>
        )}
        {concerns.length > 0 && (
          <ul className="space-y-1">
            {concerns.map((concern) => (
              <li key={concern.id}>
                <span className="font-semibold">{concern.label}:</span> {concern.detail}{' '}
                <span className="text-gray-600">({BASIS_NOTE[concern.basis]})</span>
              </li>
            ))}
          </ul>
        )}
        {ingredients && (
          <details>
            <summary className="cursor-pointer font-semibold">Ingredients</summary>
            <p className="mt-1 text-gray-700">{ingredients}</p>
          </details>
        )}
      </div>
    </details>
  );
}

/** A tiny marker for tight spaces like menu tiles; only ultra-processed foods get one. */
export function UpfMarker({ quality }: { quality: FoodQuality | null | undefined }) {
  if (quality?.nova !== 4) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded bg-red-100 px-1 text-[8px] font-bold uppercase leading-[14px] tracking-wide text-red-800"
      title="Likely ultra-processed"
      data-testid="upf-marker"
    >
      UPF
    </span>
  );
}
