/**
 * USDA Microbe Database
 * Probiotic and microorganism data for enhanced nutrition tracking
 */

interface MicrobeRecord {
  id: string;
  foodId: string;
  method: string;
  microbeCode: string;
  minValue: string;
  maxValue: string;
  unitOfMeasure: string;
}

interface ProbioticInfo {
  strain: string;
  benefits: string[];
  cfuCount?: number;
  category: 'probiotic' | 'pathogen' | 'neutral';
}

// Common probiotic strains found in foods
export const PROBIOTIC_STRAINS: Record<string, ProbioticInfo> = {
  "LACTICASEIBACILLUS_PARACASEI": {
    strain: "Lacticaseibacillus paracasei",
    benefits: [
      "Digestive health support",
      "Immune system enhancement",
      "Lactose tolerance improvement"
    ],
    category: "probiotic"
  },
  "LACTOBACILLUS_ACIDOPHILUS": {
    strain: "Lactobacillus acidophilus",
    benefits: [
      "Gut flora balance",
      "Nutrient absorption",
      "Digestive enzyme production"
    ],
    category: "probiotic"
  },
  "BIFIDOBACTERIUM_LONGUM": {
    strain: "Bifidobacterium longum",
    benefits: [
      "Intestinal health",
      "Vitamin synthesis",
      "Pathogen resistance"
    ],
    category: "probiotic"
  },
  "LACTOBACILLUS_RHAMNOSUS": {
    strain: "Lactobacillus rhamnosus",
    benefits: [
      "Immune function",
      "Antibiotic recovery",
      "Respiratory health"
    ],
    category: "probiotic"
  }
};

/**
 * Foods commonly containing probiotics
 */
export const PROBIOTIC_FOODS = [
  "yogurt", "kefir", "kombucha", "sauerkraut", "kimchi", 
  "miso", "tempeh", "pickles", "cheese", "sourdough"
];

/**
 * Check if food contains probiotics
 */
export function containsProbiotics(foodName: string): boolean {
  const name = foodName.toLowerCase();
  return PROBIOTIC_FOODS.some(food => name.includes(food));
}

/**
 * Get probiotic information for food
 */
export function getProbioticInfo(foodName: string): ProbioticInfo[] {
  const name = foodName.toLowerCase();
  const probiotics: ProbioticInfo[] = [];
  
  if (name.includes('yogurt') || name.includes('kefir')) {
    probiotics.push(
      PROBIOTIC_STRAINS.LACTICASEIBACILLUS_PARACASEI,
      PROBIOTIC_STRAINS.LACTOBACILLUS_ACIDOPHILUS,
      PROBIOTIC_STRAINS.BIFIDOBACTERIUM_LONGUM
    );
  }
  
  if (name.includes('kombucha') || name.includes('fermented')) {
    probiotics.push(PROBIOTIC_STRAINS.LACTOBACILLUS_RHAMNOSUS);
  }
  
  return probiotics;
}

/**
 * Calculate probiotic health score
 */
export function calculateProbioticScore(foodName: string): number {
  const probiotics = getProbioticInfo(foodName);
  
  if (probiotics.length === 0) return 0;
  
  // Base score for containing probiotics
  let score = 20;
  
  // Add points for each strain
  score += probiotics.length * 15;
  
  // Bonus for fermented foods
  if (foodName.toLowerCase().includes('fermented')) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

/**
 * Get health benefits from probiotics
 */
export function getProbioticBenefits(foodName: string): string[] {
  const probiotics = getProbioticInfo(foodName);
  const allBenefits = new Set<string>();
  
  probiotics.forEach(probiotic => {
    probiotic.benefits.forEach(benefit => allBenefits.add(benefit));
  });
  
  return Array.from(allBenefits);
}