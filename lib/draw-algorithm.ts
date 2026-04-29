/**
 * Draw Algorithm Utilities
 * Supports both random and weighted number selection for monthly draws
 */

/**
 * Generate 5 unique random numbers between 1 and 50 (Random Mode)
 */
export function generateRandomWinningNumbers(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 50) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

/**
 * Generate weighted winning numbers based on participant selections
 * Favors less commonly chosen numbers to reduce multiple winners
 */
export function generateWeightedWinningNumbers(
  participantNumbers: number[][]
): number[] {
  // Count frequency of each number (1-50)
  const frequency = new Map<number, number>()
  for (let i = 1; i <= 50; i++) {
    frequency.set(i, 0)
  }

  participantNumbers.forEach((numbers) => {
    numbers.forEach((num) => {
      frequency.set(num, (frequency.get(num) || 0) + 1)
    })
  })

  // Create weighted pool - less frequent numbers have higher weight
  const weightedPool: number[] = []
  frequency.forEach((count, number) => {
    // Inverse weighting: less chosen = more weight
    const weight = Math.max(1, 100 - count * 10)
    for (let i = 0; i < weight; i++) {
      weightedPool.push(number)
    }
  })

  // Select 5 unique numbers from weighted pool
  const selected = new Set<number>()
  while (selected.size < 5 && weightedPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * weightedPool.length)
    const number = weightedPool[randomIndex]
    selected.add(number)
    // Remove all instances of this number from pool
    weightedPool.splice(
      0,
      weightedPool.length,
      ...weightedPool.filter((n) => n !== number)
    )
  }

  return Array.from(selected).sort((a, b) => a - b)
}

/**
 * Calculate matches between selected numbers and winning numbers
 */
export function calculateMatches(
  selectedNumbers: number[],
  winningNumbers: number[]
): number {
  return selectedNumbers.filter((num) => winningNumbers.includes(num)).length
}

/**
 * Determine prize tier based on match count
 */
export function getPrizeTier(matchCount: number): number {
  if (matchCount === 5) return 5
  if (matchCount === 4) return 4
  if (matchCount === 3) return 3
  return 0
}

/**
 * Calculate prize distribution based on total pool and winners
 * 5-match: 40%, 4-match: 35%, 3-match: 25%
 */
export function calculatePrizeDistribution(
  totalPool: number,
  winnersByTier: { tier5: number; tier4: number; tier3: number }
): { tier5Prize: number; tier4Prize: number; tier3Prize: number; rollover: number } {
  const tier5Pool = totalPool * 0.4
  const tier4Pool = totalPool * 0.35
  const tier3Pool = totalPool * 0.25

  const tier5Prize = winnersByTier.tier5 > 0 ? tier5Pool / winnersByTier.tier5 : 0
  const tier4Prize = winnersByTier.tier4 > 0 ? tier4Pool / winnersByTier.tier4 : 0
  const tier3Prize = winnersByTier.tier3 > 0 ? tier3Pool / winnersByTier.tier3 : 0

  // Rollover if no 5-match winner
  const rollover = winnersByTier.tier5 === 0 ? tier5Pool : 0

  return {
    tier5Prize,
    tier4Prize,
    tier3Prize,
    rollover,
  }
}
