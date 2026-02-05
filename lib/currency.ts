/**
 * Format number to Indonesian Rupiah (IDR) currency
 * @param amount - The amount to format (number or string)
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "Rp 1.234.567")
 */
export function formatToIDR(
  amount: number | string,
  options: {
    showSymbol?: boolean
    useSpace?: boolean
    showDecimals?: boolean
  } = {}
): string {
  const {
    showSymbol = true,
    useSpace = true,
    showDecimals = false,
  } = options

  // Convert to number if string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount

  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return showSymbol ? "Rp 0" : "0"
  }

  // Format the number
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })

  let formatted = formatter.format(numAmount)

  // Remove default "IDR" text and replace with "Rp"
  formatted = formatted.replace("IDR", "Rp")

  // Adjust spacing based on preference
  if (!useSpace) {
    formatted = formatted.replace("Rp ", "Rp")
  }

  // Remove symbol if not needed
  if (!showSymbol) {
    formatted = formatted.replace("Rp ", "").replace("Rp", "")
  }

  return formatted.trim()
}

/**
 * Parse Indonesian Rupiah string to number
 * @param idrString - The IDR string to parse (e.g., "Rp 1.234.567" or "Rp1.234.567")
 * @returns The numeric value
 */
export function parseIDR(idrString: string): number {
  // Remove "Rp", spaces, and dots (thousand separators)
  const cleaned = idrString
    .replace(/Rp/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".") // Replace comma with dot for decimals

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format number with Indonesian thousand separator (dots)
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1.234.567")
 */
export function formatNumber(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return "0"
  }

  return new Intl.NumberFormat("id-ID").format(numAmount)
}

/**
 * Abbreviate large numbers with K, M, B suffixes
 * @param amount - The amount to abbreviate
 * @returns Abbreviated string (e.g., "Rp 1,2 Jt" for 1.200.000)
 */
export function abbreviateIDR(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return "Rp 0"
  }

  const abs = Math.abs(numAmount)

  if (abs >= 1_000_000_000) {
    return `Rp ${(numAmount / 1_000_000_000).toFixed(1)} M` // Miliar
  } else if (abs >= 1_000_000) {
    return `Rp ${(numAmount / 1_000_000).toFixed(1)} Jt` // Juta
  } else if (abs >= 1_000) {
    return `Rp ${(numAmount / 1_000).toFixed(1)} Rb` // Ribu
  }

  return formatToIDR(numAmount)
}
