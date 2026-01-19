// Zone validation utilities for preventing conflicts and ensuring proper layout

interface Zone {
  zone_id: string
  name: string
  x: number      // 0-100 percentage
  y: number      // 0-100 percentage
  width: number  // 0-100 percentage
  height: number // 0-100 percentage
  z_index: number
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ZoneValidator {
  static validateZone(zone: Omit<Zone, 'zone_id'>, existingZones: Zone[] = []): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic boundary validation
    if (zone.x < 0 || zone.x > 100) {
      errors.push('X position must be between 0 and 100')
    }
    if (zone.y < 0 || zone.y > 100) {
      errors.push('Y position must be between 0 and 100')
    }
    if (zone.width <= 0 || zone.width > 100) {
      errors.push('Width must be between 1 and 100')
    }
    if (zone.height <= 0 || zone.height > 100) {
      errors.push('Height must be between 1 and 100')
    }

    // Check if zone extends beyond canvas
    if (zone.x + zone.width > 100) {
      errors.push('Zone extends beyond right edge of canvas')
    }
    if (zone.y + zone.height > 100) {
      errors.push('Zone extends beyond bottom edge of canvas')
    }

    // Minimum size validation
    if (zone.width < 5) {
      warnings.push('Zone width is very small (less than 5%)')
    }
    if (zone.height < 5) {
      warnings.push('Zone height is very small (less than 5%)')
    }

    // Check for overlaps with existing zones
    for (const existingZone of existingZones) {
      if (this.zonesOverlap(zone, existingZone)) {
        warnings.push(`Zone overlaps with "${existingZone.name}"`)
      }
    }

    // Zone name validation
    if (!zone.name.trim()) {
      errors.push('Zone name is required')
    }
    if (zone.name.length > 100) {
      warnings.push('Zone name is very long')
    }

    // Check for duplicate names
    const duplicateName = existingZones.find(z => z.name === zone.name)
    if (duplicateName) {
      warnings.push(`Zone name "${zone.name}" is already used`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateZoneUpdate(
    zoneId: string,
    updates: Partial<Zone>,
    existingZones: Zone[]
  ): ValidationResult {
    const currentZone = existingZones.find(z => z.zone_id === zoneId)
    if (!currentZone) {
      return {
        isValid: false,
        errors: ['Zone not found'],
        warnings: []
      }
    }

    const updatedZone = { ...currentZone, ...updates }
    const otherZones = existingZones.filter(z => z.zone_id !== zoneId)

    return this.validateZone(updatedZone, otherZones)
  }

  static zonesOverlap(zone1: Omit<Zone, 'zone_id'>, zone2: Zone): boolean {
    const z1Right = zone1.x + zone1.width
    const z1Bottom = zone1.y + zone1.height
    const z2Right = zone2.x + zone2.width
    const z2Bottom = zone2.y + zone2.height

    return !(
      zone1.x >= z2Right ||   // zone1 is to the right of zone2
      z1Right <= zone2.x ||   // zone1 is to the left of zone2
      zone1.y >= z2Bottom ||  // zone1 is below zone2
      z1Bottom <= zone2.y     // zone1 is above zone2
    )
  }

  static getOverlappingZones(zone: Omit<Zone, 'zone_id'>, existingZones: Zone[]): Zone[] {
    return existingZones.filter(existingZone => this.zonesOverlap(zone, existingZone))
  }

  static getTotalCoverage(zones: Zone[]): number {
    // Calculate total screen coverage (with overlaps counted once)
    // This is a simplified calculation - could be more sophisticated
    const totalArea = zones.reduce((total, zone) => {
      return total + (zone.width * zone.height) / 100
    }, 0)
    return Math.min(totalArea, 100)
  }

  static suggestZonePositions(
    desiredZoneCount: number,
    canvasWidth: number = 100,
    canvasHeight: number = 100
  ): Omit<Zone, 'zone_id'>[] {
    const suggestions: Omit<Zone, 'zone_id'>[] = []

    switch (desiredZoneCount) {
      case 1:
        suggestions.push({
          name: 'Main Zone',
          x: 0, y: 0, width: 100, height: 100, z_index: 1
        })
        break

      case 2:
        suggestions.push(
          { name: 'Left Zone', x: 0, y: 0, width: 50, height: 100, z_index: 1 },
          { name: 'Right Zone', x: 50, y: 0, width: 50, height: 100, z_index: 1 }
        )
        break

      case 3:
        suggestions.push(
          { name: 'Main Zone', x: 0, y: 0, width: 70, height: 100, z_index: 1 },
          { name: 'Top Right', x: 70, y: 0, width: 30, height: 50, z_index: 1 },
          { name: 'Bottom Right', x: 70, y: 50, width: 30, height: 50, z_index: 1 }
        )
        break

      case 4:
        suggestions.push(
          { name: 'Top Left', x: 0, y: 0, width: 50, height: 50, z_index: 1 },
          { name: 'Top Right', x: 50, y: 0, width: 50, height: 50, z_index: 1 },
          { name: 'Bottom Left', x: 0, y: 50, width: 50, height: 50, z_index: 1 },
          { name: 'Bottom Right', x: 50, y: 50, width: 50, height: 50, z_index: 1 }
        )
        break

      default:
        // For more than 4 zones, create a grid layout
        const cols = Math.ceil(Math.sqrt(desiredZoneCount))
        const rows = Math.ceil(desiredZoneCount / cols)
        const zoneWidth = Math.floor(100 / cols)
        const zoneHeight = Math.floor(100 / rows)

        for (let i = 0; i < desiredZoneCount; i++) {
          const col = i % cols
          const row = Math.floor(i / cols)
          suggestions.push({
            name: `Zone ${i + 1}`,
            x: col * zoneWidth,
            y: row * zoneHeight,
            width: zoneWidth,
            height: zoneHeight,
            z_index: 1
          })
        }
    }

    return suggestions
  }

  static snapToGrid(value: number, gridSize: number = 5): number {
    return Math.round(value / gridSize) * gridSize
  }

  static getZoneCenter(zone: Zone): { x: number; y: number } {
    return {
      x: zone.x + zone.width / 2,
      y: zone.y + zone.height / 2
    }
  }

  static isZoneVisible(zone: Zone): boolean {
    return zone.width > 0 && zone.height > 0 &&
           zone.x >= 0 && zone.y >= 0 &&
           zone.x < 100 && zone.y < 100
  }
}