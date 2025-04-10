/**
 * Lightens or darkens a color by a percentage
 */
export function adjustColor(color: string, amount: number): string {
    // Remove the # if present
    const hex = color.replace("#", "")
  
    // Convert to RGB
    let r = Number.parseInt(hex.substring(0, 2), 16)
    let g = Number.parseInt(hex.substring(2, 4), 16)
    let b = Number.parseInt(hex.substring(4, 6), 16)
  
    // Lighten or darken
    r = Math.min(255, Math.max(0, Math.round(r + amount * 255)))
    g = Math.min(255, Math.max(0, Math.round(g + amount * 255)))
    b = Math.min(255, Math.max(0, Math.round(b + amount * 255)))
  
    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }
  
  /**
   * Generates shadow colors based on a background color
   */
  export function generateShadowColors(bgColor: string): { dark: string; light: string } {
    return {
      dark: adjustColor(bgColor, -0.15), // Darken by 15%
      light: adjustColor(bgColor, 0.10), // Lighten by 15%
    }
  }
  
  /**
   * Determines if a color is light or dark
   */
  export function isLightColor(color: string): boolean {
    const hex = color.replace("#", "")
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)
  
    // Calculate perceived brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
  
    return brightness > 0.5
  }
  
  /**
   * Gets appropriate text color (black or white) based on background color
   */
  export function getTextColor(bgColor: string): string {
    return isLightColor(bgColor) ? "#000000" : "#ffffff"
  }
  
  /**
   * Makes a color slightly darker for better visibility against the background
   */
  export function darkenForToolbar(bgColor: string): string {
    return isLightColor(bgColor)
      ? adjustColor(bgColor, -0.08) // Darken light backgrounds by 8%
      : adjustColor(bgColor, -0.04) // Darken dark backgrounds by 12%
  }
  
  /**
   * Gets appropriate icon color based on background color
   */
  export function getIconColor(bgColor: string): string {
    return isLightColor(bgColor) ? "#333333" : "#f0f0f0"
  }
  