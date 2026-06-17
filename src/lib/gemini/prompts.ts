export const STYLE_PRESETS = {
  "japanese-zen": "Transform the landscaping into a serene Japanese Zen garden with raked gravel, moss, bamboo, stone lanterns, and carefully pruned shrubs and bonsai trees",
  "english-cottage": "Create a lush English cottage garden with overflowing flower beds, climbing roses, lavender, hollyhocks, and a mix of colorful perennial wildflowers",
  "modern-minimalist": "Design a clean modern minimalist landscape with structured low-maintenance ornamental grasses, concrete planters, geometric hedges, and simple ground cover",
  "mediterranean": "Apply a sun-drenched Mediterranean style with drought-tolerant lavender, rosemary, olive trees, terracotta pots, and warm-toned stone pathways",
  "tropical-paradise": "Transform into a lush tropical landscape with bold palm trees, bird of paradise, giant elephant ears, ferns, and dense colorful tropical foliage",
  "drought-tolerant": "Create a beautiful drought-tolerant xeriscape with native succulents, cacti, agave, ornamental grasses, and decorative gravel mulch",
  "cottage-wildflower": "Design a naturalistic wildflower meadow garden with native perennials, grasses, and flowering plants that attract pollinators",
  "formal-french": "Create a formal French parterre garden with precisely clipped boxwood hedges, symmetrical beds, topiary, and elegant flowering borders",
  "rustic-farmhouse": "Apply a charming rustic farmhouse style with a white picket fence, herb gardens, sunflowers, and a mix of classic cottage flowers",
  "woodland-shade": "Design a peaceful woodland shade garden with hostas, ferns, astilbe, woodland wildflowers, and layered shade-tolerant plantings",
  "coastal-beach": "Create a coastal beach garden with ornamental grasses, sea oats, beach roses, drift wood accents, and salt-tolerant coastal plants",
  "prairie-native": "Transform into a native prairie landscape with tall grasses, coneflowers, black-eyed Susans, wild bergamot, and native prairie plants",
  "asian-contemporary": "Design a contemporary Asian-inspired garden with clean lines, ornamental bamboo, Japanese maple, moss, and architectural stone features",
  "lush-tropical-resort": "Create a luxurious resort-style tropical landscape with dramatic palms, flowering tropical shrubs, water features, and resort-quality planting",
  "english-formal": "Apply a formal English garden style with structured rose beds, clipped yew hedges, herbaceous borders, and classic English garden geometry",
  "southwest-desert": "Design an authentic Southwest desert landscape with saguaro cactus, palo verde trees, desert marigold, and colorful desert wildflowers",
} as const;

export type StylePreset = keyof typeof STYLE_PRESETS;

const SYSTEM_CONTEXT =
  "You are a professional landscape designer. Transform the landscaping in this photo while preserving the existing architecture, structures, driveway, fencing, and all non-landscape elements exactly as they appear.";

export interface GenerationParams {
  stylePreset?: StylePreset;
  timeOfDay?: string;
  season?: string;
  weather?: string;
  customPrompt?: string;
  isInpainting?: boolean;
  maskDescription?: string;
}

function buildEnvironmentContext(params: GenerationParams): string {
  const parts: string[] = [];
  if (params.timeOfDay) parts.push(`time of day: ${params.timeOfDay}`);
  if (params.season) parts.push(`season: ${params.season}`);
  if (params.weather) parts.push(`weather: ${params.weather}`);
  return parts.length ? `Render with these environmental conditions — ${parts.join(", ")}.` : "";
}

function buildInpaintingContext(maskDescription?: string): string {
  if (!maskDescription) return "";
  return `Focus changes ONLY on this specific area: ${maskDescription}. Leave all other parts of the yard completely unchanged.`;
}

export function buildPrompt(params: GenerationParams): string {
  const parts = [
    SYSTEM_CONTEXT,
    params.stylePreset ? STYLE_PRESETS[params.stylePreset] : "",
    buildEnvironmentContext(params),
    params.customPrompt ?? "",
    params.isInpainting ? buildInpaintingContext(params.maskDescription) : "",
  ];
  return parts.filter(Boolean).join("\n\n");
}
