/**
 * Food-quality flags: processing level (NOVA 1–4), GMO status and additives of concern.
 * Label data (Open Food Facts NOVA group, additive and certification tags) is trusted first,
 * then the ingredient list, then the food's name.
 */

export type NovaGroup = 1 | 2 | 3 | 4;
export type QualityBasis = 'label' | 'ingredients' | 'estimate';
export type GmoStatus = 'organic' | 'non-gmo' | 'bioengineered' | 'may-contain';

export interface FoodConcern {
  id: string;
  label: string;
  detail: string;
  basis: QualityBasis;
}

export interface FoodQuality {
  nova: NovaGroup | null;
  novaBasis: QualityBasis | null;
  /** Ingredients that pushed the NOVA group up, e.g. "maltodextrin". */
  novaMarkers: string[];
  gmo: GmoStatus | null;
  gmoBasis: QualityBasis | null;
  gmoSources: string[];
  concerns: FoodConcern[];
}

export interface FoodQualityInput {
  name: string;
  ingredients?: string | null;
  novaGroup?: number | null;
  additiveTags?: string[] | null;
  labelTags?: string[] | null;
}

export const NOVA_LABELS: Record<NovaGroup, string> = {
  1: 'Minimally processed',
  2: 'Culinary ingredient',
  3: 'Processed',
  4: 'Ultra-processed',
};

const BASIS_RANK: Record<QualityBasis, number> = { estimate: 1, ingredients: 2, label: 3 };

type ConcernDef = { id: string; label: string; detail: string; eNumbers: string[]; pattern?: RegExp };

const CONCERNS: ConcernDef[] = [
  {
    id: 'synthetic-dyes',
    label: 'Synthetic dyes',
    detail: 'Petroleum-based colors such as Red 40 and Yellow 5, linked to hyperactivity in some children. Red 3 is being phased out in the US.',
    eNumbers: ['e102', 'e104', 'e110', 'e122', 'e124', 'e127', 'e129', 'e132', 'e133', 'e142', 'e143', 'e151', 'e155'],
    pattern: /\b(red|yellow|blue|green)\s*(no\.?\s*)?\d{1,2}\b|fd&c|tartrazine|allura red|sunset yellow|erythrosine?|brilliant blue|indigo carmine|ponceau|carmoisine|quinoline yellow/,
  },
  {
    id: 'titanium-dioxide',
    label: 'Titanium dioxide',
    detail: 'Whitening agent banned as a food additive in the EU since 2022 over concerns it may damage DNA.',
    eNumbers: ['e171'],
    pattern: /titanium dioxide/,
  },
  {
    id: 'nitrites',
    label: 'Nitrites / nitrates',
    detail: 'Curing salts in processed meats that can form nitrosamines. The WHO classes processed meat as a cause of colorectal cancer.',
    eNumbers: ['e249', 'e250', 'e251', 'e252'],
    pattern: /(sodium|potassium) nitr[ai]te|celery (juice )?powder/,
  },
  {
    id: 'synthetic-antioxidants',
    label: 'BHA / BHT / TBHQ',
    detail: 'Synthetic preservatives. BHA is listed by the US National Toxicology Program as reasonably anticipated to be a human carcinogen.',
    eNumbers: ['e319', 'e320', 'e321'],
    pattern: /\bbh[at]\b|tbhq|butylated hydroxy|butylhydroquinone/,
  },
  {
    id: 'potassium-bromate',
    label: 'Potassium bromate',
    detail: 'Flour improver banned in the EU, UK and Canada; a possible human carcinogen.',
    eNumbers: ['e924'],
    pattern: /potassium bromate|bromated (wheat )?flour/,
  },
  {
    id: 'azodicarbonamide',
    label: 'Azodicarbonamide',
    detail: 'Dough conditioner not permitted in food in the EU.',
    eNumbers: ['e927a'],
    pattern: /azodicarbonamide/,
  },
  {
    id: 'trans-fat',
    label: 'Partially hydrogenated oil',
    detail: 'The main source of artificial trans fat, which raises heart-disease risk.',
    eNumbers: [],
    pattern: /partially hydrogenated/,
  },
  {
    id: 'brominated-oil',
    label: 'Brominated vegetable oil',
    detail: 'Its use in food was revoked by the FDA in 2024.',
    eNumbers: ['e443'],
    pattern: /brominated vegetable oil/,
  },
  {
    id: 'hfcs',
    label: 'High-fructose corn syrup',
    detail: 'A highly refined added sugar common in sodas and sweets.',
    eNumbers: [],
    pattern: /high[- ]fructose corn syrup|glucose[- ]fructose syrup|isoglucose/,
  },
  {
    id: 'artificial-sweeteners',
    label: 'Artificial sweeteners',
    detail: 'The WHO advises against non-sugar sweeteners for weight control and classes aspartame as possibly carcinogenic.',
    eNumbers: ['e950', 'e951', 'e954', 'e955', 'e961', 'e962'],
    pattern: /aspartame|sucralose|acesulfame|saccharin|neotame/,
  },
  {
    id: 'caramel-color',
    label: 'Caramel color',
    detail: 'Ammonia-processed caramel color (E150c/d) can contain 4-MEI, a possible carcinogen.',
    eNumbers: ['e150c', 'e150d'],
    pattern: /caramel colou?r/,
  },
  {
    id: 'parabens',
    label: 'Propylparaben',
    detail: 'Preservative no longer permitted in food in the EU over hormone-disruption concerns.',
    eNumbers: ['e216', 'e217'],
    pattern: /propyl ?paraben/,
  },
  {
    id: 'sodium-benzoate',
    label: 'Sodium benzoate',
    detail: 'Preservative that can form small amounts of benzene when combined with vitamin C.',
    eNumbers: ['e211'],
    pattern: /sodium benzoate/,
  },
  {
    id: 'carrageenan',
    label: 'Carrageenan',
    detail: 'Seaweed-derived thickener that may irritate the gut in some people.',
    eNumbers: ['e407', 'e407a'],
    pattern: /carrageenan/,
  },
  {
    id: 'gut-emulsifiers',
    label: 'Polysorbate 80 / CMC',
    detail: 'Emulsifiers linked in studies to gut inflammation and changes to gut bacteria.',
    eNumbers: ['e433', 'e466'],
    pattern: /polysorbate[- ]?80|carboxymethyl ?cellulose|cellulose gum/,
  },
];

/** Ingredients that only appear in industrial formulations (the NOVA 4 "markers"). */
const UPF_MARKERS: RegExp[] = [
  /high[- ]fructose corn syrup|glucose[- ]fructose syrup|corn syrup( solids)?|glucose syrup/,
  /invert sugar|maltodextrin|\bdextrose\b|\bfructose\b/,
  /(partially )?hydrogenated|interesterified/,
  /hydroly[sz]ed [a-z]+ protein|hydroly[sz]ed|protein isolate|protein concentrate|textured (vegetable|soy|wheat) protein|mechanically separated/,
  /modified (food |corn |tapioca |potato |wheat )?starch/,
  /(natural|artificial|smoke) flavou?rs?|flavou?ring/,
  /colou?r(s|ing)? added|artificial colou?rs?|caramel colou?r|\b(red|yellow|blue) \d{1,2}\b|annatto|titanium dioxide/,
  /mono-? ?and diglycerides|polysorbate( \d+)?|(soy |sunflower )?lecithin|sodium stearoyl lactylate|\bdatem\b|carboxymethyl ?cellulose|cellulose gum|sucrose esters/,
  /carrageenan|xanthan gum|guar gum|gellan gum|locust bean gum|cellulose gel/,
  /sucralose|aspartame|acesulfame( potassium| k)?|saccharin|neotame|steviol glycosides|rebaudioside a?|erythritol|sorbitol|maltitol|xylitol/,
  /monosodium glutamate|\bmsg\b|disodium (inosinate|guanylate)|yeast extract/,
  /anti-?caking agent|glazing agent|humectant|sequestrant|firming agent|dough conditioners?|azodicarbonamide/,
];

const GMO_SOURCES: Array<[RegExp, string]> = [
  [/\bcorn\b|\bmaize\b|cornstarch|cornmeal|\bdextrose\b|maltodextrin|\bgrits\b|polenta/, 'corn'],
  [/\bsoy|\bsoya\b|edamame|\btofu\b|\btempeh\b/, 'soy'],
  [/canola|rapeseed/, 'canola'],
  [/cottonseed/, 'cottonseed oil'],
  [/beet sugar|sugar beet/, 'beet sugar'],
  [/\bvegetable oil/, 'vegetable oil (often soy, corn or canola)'],
  [/papaya/, 'papaya'],
  [/alfalfa/, 'alfalfa'],
];

/** Whole-food words in a dish name, used only when there's no label or ingredient list. */
const NAME_NOVA: Array<[NovaGroup, RegExp]> = [
  [4, /\b(sodas?|cola|coke|pepsi|sprite|fanta|dr\.? ?pepper|mountain dew|root beer|energy drinks?|red bull|monster|gatorade|powerade|sports drinks?|slushies?|slurpee|icee|frozen drinks?|frappuccino|frappe|mocha|caramel latte|caramel macchiato|white chocolate|muffins?|filet-o-fish|mcchicken|orange chicken|general tso'?s?|sesame chicken|sweet (and|&) sour|milkshakes?|shakes?|doritos|cheetos|pringles|takis|funyuns|candy|candies|gumm(y|ies)|skittles|m&ms?|snickers|oreos?|cookies?|brownies?|cakes?|cupcakes?|donuts?|doughnuts?|pastr(y|ies)|danish|cinnamon rolls?|pop-?tarts?|ice cream|frozen yogurt|sundaes?|blizzard|mcflurry|frosty|custard|concrete|soft serve|hot ?dogs?|corn ?dogs?|coneys?|franks?|frankfurters?|wieners?|bologna|salami|pepperoni|pastrami|corned beef|deli meat|lunch ?meat|spam|bacon|ham|smoked sausage|kielbasa|jerky|nuggets?|mcnuggets?|popcorn chicken|chicken (tenders|strips|fingers)|boneless wings|burgers?|cheeseburgers?|whopper|big mac|quarter pounder|baconator|sliders?|pizzas?|calzones?|stromboli|fries|frites|tater tots|hash browns?|onion rings|mozzarella sticks|crunchwrap|chalupa|gordita|mcmuffin|biscuit sandwich|instant noodles|ramen noodles|cup noodles|mac(aroni)? (and|&|n) cheese|breakfast cereal|froot loops|frosted flakes|lucky charms|cheerios|cereal bars?|granola bars?|protein bars?|protein shakes?|margarine|creamer|whipped topping|cool whip|processed cheese|american cheese|cheese sauce|ketchup|bbq sauce|ranch|pancake syrup)\b/],
  [3, /\b(chips|crisps|nachos|queso|cheeses?|cheddar|mozzarella|parmesan|feta|bread|toast|bagels?|baguette|croissants?|buns?|rolls?|tortillas?|pitas?|naan|sourdough|biscuits?|pancakes?|hotcakes?|waffles?|french toast|pies?|patty|patties|loaf|pasta|spaghetti|noodles|smoked salmon|lox|nova|canned|tinned|pickles?|pickled|kimchi|sauerkraut|miso|soy sauce|olives|sardines?|anchov(y|ies)|tuna salad|salted|roasted nuts|peanut butter|almond butter|hummus|tofu|beer|wine|cider|jam|jelly|sausages?|meatballs?|gravy|wings|fried chicken|fried fish|handcutfries|tacos?|burritos?|quesadillas?|enchiladas?|sandwich(es)?|subs?|wraps?|gyros?|dumplings?|curry|stew|soup|chili|lasagna|risotto|fried rice|sushi|yogurt)\b/],
  [2, /\b(olive oil|vegetable oil|coconut oil|oils?|butter|ghee|lard|sugar|honey|maple syrup|agave|salt|vinegar|cornstarch|flour)\b/],
  [1, /\b(apples?|bananas?|oranges?|grapes?|berr(y|ies)|strawberr(y|ies)|blueberr(y|ies)|melon|watermelon|pineapple|mango|papaya|pears?|peaches?|plums?|cherr(y|ies)|kiwi|lemons?|limes?|fruit|avocados?|plantains?|vegetables?|veggies|broccoli|spinach|kale|lettuce|salad greens|greens|carrots?|celery|cucumbers?|tomato(es)?|peppers?|onions?|garlic|mushrooms?|zucchini|squash|cabbage|cauliflower|green beans|peas|corn on the cob|sweet potato(es)?|potato(es)?|yams?|cassava|rice|brown rice|quinoa|oats|oatmeal|barley|beans|lentils|chickpeas|eggs?|chicken breast|grilled chicken|roast(ed)? chicken|chicken|turkey breast|steak|ribeye|sirloin|filet|strip|brisket|ground beef|beef|pork chop|pork|lamb|goat|oxtail|fish|salmon|tuna|cod|tilapia|sea bass|shrimp|crab|lobster|milk|plain yogurt|greek yogurt|nuts|almonds|walnuts|cashews|peanuts|seeds|water|black coffee|coffee|espresso|americano|latte|cappuccino|flat white|cortado|tea|herbs|spices)\b/],
];

const DIET_DRINK = /\b(diet|zero sugar|sugar[- ]free|coke zero|pepsi zero|splenda)\b/;

/** Sizes, cooking methods and filler that don't change what a whole food is. */
const NEUTRAL_NAME_WORDS = /\b(with|and|n|or|of|a|an|the|on|in|side|sides|small|medium|large|regular|kids?|cups?|bowl|plate|serving|pieces?|pc|oz|lbs?|slices?|order|half|full|whole|fresh|plain|raw|grilled|baked|roasted|roast|steamed|boiled|poached|sauteed|sautéed|seared|broiled|scrambled|hard|soft|mashed|sliced|diced|chopped|center|cut|organic|wild|black|white|brown|red|green|yellow|sweet|jerk|mixed|seasonal|garden|house|grande|tall|venti|skim|nonfat|whole milk|unsweetened|iced|hot|mignon|breast|thigh|leg|fillet|filet|egg whites?)\b/g;

const NAME_CONCERNS: Array<[string, RegExp]> = [
  ['nitrites', /\b(bacon|ham|hot ?dogs?|coneys?|franks?|frankfurters?|wieners?|bologna|salami|pepperoni|pastrami|corned beef|deli meat|lunch ?meat|spam|smoked sausage|kielbasa|jerky)\b/],
  ['artificial-sweeteners', DIET_DRINK],
  ['synthetic-dyes', /\b(skittles|m&ms?|froot loops|fruity pebbles|lucky charms|gumm(y|ies)|sour patch|starburst|jolly ranchers?|gatorade|powerade|mountain dew|fanta|kool-?aid|jell-?o|sprinkles|red velvet|frosting|frosted|blue raspberry|slushies?|slurpee|icee|cotton candy|pop-?tarts?)\b/],
  ['caramel-color', /\b(cola|coke|pepsi|dr\.? ?pepper|root beer)\b/],
];

const SUGARY_SODA = /\b(sodas?|cola|coke|pepsi|sprite|fanta|dr\.? ?pepper|mountain dew|root beer|slushies?|slurpee|icee)\b/;

const NAME_GMO: Array<[RegExp, string]> = [
  [/\b(corn ?(syrup|starch|chips?|tortillas?|dogs?|bread|flakes)|cornmeal|cornstarch|tortilla chips|polenta|grits|doritos|fritos|nachos)\b/, 'corn'],
  [/\b(soy|soya|soybeans?|edamame|tofu|tempeh|soy ?milk)\b/, 'soy'],
  [/\b(canola)\b/, 'canola'],
  [/\b(papaya)\b/, 'papaya'],
];

function emptyQuality(): FoodQuality {
  return { nova: null, novaBasis: null, novaMarkers: [], gmo: null, gmoBasis: null, gmoSources: [], concerns: [] };
}

function normalizeTags(tags: string[] | null | undefined): string[] {
  return (tags || []).map((tag) => tag.toLowerCase().replace(/^[a-z]{2}:/, ''));
}

function concernFrom(def: ConcernDef, basis: QualityBasis): FoodConcern {
  return { id: def.id, label: def.label, detail: def.detail, basis };
}

/** Drops "organic …" items so organic corn or soy isn't counted as a likely GMO. */
function withoutOrganicItems(text: string): string {
  return text.replace(/\borganic\b[^,;()\[\]]*/g, ' ');
}

function assessFromIngredients(text: string, quality: FoodQuality) {
  const markers = Array.from(new Set(
    UPF_MARKERS.map((pattern) => text.match(pattern)?.[0].trim()).filter((found): found is string => !!found),
  ));
  const hasENumber = /\be\s?-?\d{3}[a-f]?\b/.test(text);
  if (markers.length || hasENumber) {
    quality.nova = 4;
    quality.novaMarkers = markers.length ? markers.slice(0, 6) : ['additives (E-numbers)'];
  } else {
    const items = text.split(/[,;]/).map((item) => item.trim()).filter(Boolean);
    const hasCulinary = /\b(salt|sugar|cane sugar|oil|syrup|vinegar|honey|butter)\b/.test(text);
    quality.nova = items.length <= 2 && !hasCulinary ? 1 : 3;
  }
  quality.novaBasis = 'ingredients';

  if (/bioengineered|genetically (modified|engineered)|\bgmo\b(?! ?free)/.test(text) && !/non[- ]?gmo|not genetically/.test(text)) {
    quality.gmo = 'bioengineered';
    quality.gmoBasis = 'ingredients';
  } else {
    const conventional = withoutOrganicItems(text);
    const sources = GMO_SOURCES.filter(([pattern]) => pattern.test(conventional)).map(([, label]) => label);
    if (/\bsugar\b/.test(conventional) && !/cane sugar|coconut sugar|beet sugar/.test(conventional)) {
      sources.push('sugar (often from sugar beets unless cane)');
    }
    if (sources.length) {
      quality.gmo = 'may-contain';
      quality.gmoBasis = 'ingredients';
      quality.gmoSources = sources;
    }
  }
}

function assessFromName(name: string, quality: FoodQuality) {
  if (quality.nova === null) {
    // Restaurant fries cut in-house skip the dextrose and coatings of frozen fries
    const text = name.replace(/\b(fresh|hand)[- ]cut fries\b/g, 'handcutfries');
    const matched = NAME_NOVA.filter(([, pattern]) => pattern.test(text)).map(([nova]) => nova);
    const highest = matched.length ? (Math.max(...matched) as NovaGroup) : null;
    if (highest === 3 || highest === 4) {
      quality.nova = highest;
      quality.novaBasis = 'estimate';
    } else if (highest !== null) {
      // Only call a dish whole or culinary when every word is accounted for, so
      // "Baked Apple Pie" isn't read as an apple. Butter or oil with a whole food is cooking.
      const leftover = NAME_NOVA
        .filter(([nova]) => nova <= 2)
        .reduce((rest, [, pattern]) => rest.replace(new RegExp(pattern.source, 'g'), ' '), text)
        .replace(NEUTRAL_NAME_WORDS, ' ')
        .replace(/[^a-z]+/g, '');
      if (!leftover) {
        quality.nova = matched.includes(1) ? 1 : 2;
        quality.novaBasis = 'estimate';
      }
    }
  }

  if (quality.gmo === null) {
    const sources = NAME_GMO.filter(([pattern]) => pattern.test(name)).map(([, label]) => label);
    if (sources.length) {
      quality.gmo = 'may-contain';
      quality.gmoBasis = 'estimate';
      quality.gmoSources = sources;
    } else if (quality.nova === 4 && quality.novaBasis === 'estimate') {
      quality.gmo = 'may-contain';
      quality.gmoBasis = 'estimate';
      quality.gmoSources = ['corn syrup, soybean or canola oil, or beet sugar, common in US processed foods'];
    }
  }

  const names = new Set(quality.concerns.map((concern) => concern.id));
  const add = (id: string) => {
    const def = CONCERNS.find((concern) => concern.id === id);
    if (def && !names.has(id)) {
      quality.concerns.push(concernFrom(def, 'estimate'));
      names.add(id);
    }
  };
  for (const [id, pattern] of NAME_CONCERNS) {
    if (pattern.test(name)) add(id);
  }
  if (SUGARY_SODA.test(name) && !DIET_DRINK.test(name)) add('hfcs');
}

export function assessFoodQuality(input: FoodQualityInput): FoodQuality {
  const quality = emptyQuality();
  const name = (input.name || '').toLowerCase();
  const ingredients = (input.ingredients || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const labels = normalizeTags(input.labelTags);
  const additives = normalizeTags(input.additiveTags);

  if (input.novaGroup && input.novaGroup >= 1 && input.novaGroup <= 4) {
    quality.nova = Math.round(input.novaGroup) as NovaGroup;
    quality.novaBasis = 'label';
  }

  if (ingredients.length >= 3) {
    const labelNova = quality.nova;
    assessFromIngredients(ingredients, quality);
    if (labelNova !== null) {
      quality.nova = labelNova;
      quality.novaBasis = 'label';
    }
  }

  const certified = /\borganic\b/.test(name) && !/\bnon[- ]organic\b/.test(name);
  if (labels.some((tag) => /(^|-)organic$|^organic-|usda-organic|eu-organic/.test(tag)) || certified) {
    quality.gmo = 'organic';
    quality.gmoBasis = labels.length ? 'label' : 'estimate';
    quality.gmoSources = [];
  } else if (labels.some((tag) => /no-gmos?|non-gmo|gmo-free|without-gmo/.test(tag)) || /\bnon[- ]?gmo\b/.test(name)) {
    quality.gmo = 'non-gmo';
    quality.gmoBasis = labels.length ? 'label' : 'estimate';
    quality.gmoSources = [];
  }

  for (const def of CONCERNS) {
    const fromLabel = def.eNumbers.some((code) => additives.some((tag) => tag === code || tag.startsWith(`${code}-`)));
    const fromText = !!def.pattern && ingredients.length > 0 && def.pattern.test(ingredients);
    if (fromLabel || fromText) quality.concerns.push(concernFrom(def, fromLabel ? 'label' : 'ingredients'));
  }

  assessFromName(name, quality);
  return quality;
}

/** Combines several assessments: one product from two sources, or the dishes on a plate. */
export function mergeFoodQuality(qualities: Array<FoodQuality | null | undefined>): FoodQuality | null {
  const list = qualities.filter((quality): quality is FoodQuality => !!quality);
  if (!list.length) return null;

  const merged = emptyQuality();
  for (const quality of list) {
    if (quality.nova !== null && quality.novaBasis) {
      const better = merged.novaBasis === null
        || BASIS_RANK[quality.novaBasis] > BASIS_RANK[merged.novaBasis]
        || (quality.novaBasis === merged.novaBasis && quality.nova > (merged.nova ?? 0));
      if (better) {
        merged.nova = quality.nova;
        merged.novaBasis = quality.novaBasis;
      }
    }
    merged.novaMarkers = Array.from(new Set([...merged.novaMarkers, ...quality.novaMarkers]));

    if (quality.gmo && quality.gmoBasis) {
      const claim = quality.gmo === 'organic' || quality.gmo === 'non-gmo';
      const mergedClaim = merged.gmo === 'organic' || merged.gmo === 'non-gmo';
      const better = merged.gmoBasis === null
        || BASIS_RANK[quality.gmoBasis] > BASIS_RANK[merged.gmoBasis]
        || (quality.gmoBasis === merged.gmoBasis && mergedClaim && !claim);
      if (better) {
        merged.gmo = quality.gmo;
        merged.gmoBasis = quality.gmoBasis;
        merged.gmoSources = [...quality.gmoSources];
      } else if (quality.gmo === merged.gmo) {
        merged.gmoSources = Array.from(new Set([...merged.gmoSources, ...quality.gmoSources]));
      }
    }

    for (const concern of quality.concerns) {
      const existing = merged.concerns.findIndex((item) => item.id === concern.id);
      if (existing === -1) merged.concerns.push(concern);
      else if (BASIS_RANK[concern.basis] > BASIS_RANK[merged.concerns[existing].basis]) merged.concerns[existing] = concern;
    }
  }
  return merged;
}

export function hasFoodQualityFlags(quality: FoodQuality | null | undefined): quality is FoodQuality {
  return !!quality && (quality.nova !== null || quality.gmo !== null || quality.concerns.length > 0);
}
