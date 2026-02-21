import { describe, it, expect } from 'vitest'
import { ZoneValidator } from './zone-validation'

describe('ZoneValidator', () => {
  describe('validateZone', () => {
    it('accepts a valid full-screen zone', () => {
      const result = ZoneValidator.validateZone({
        name: 'Main Zone',
        x: 0, y: 0, width: 100, height: 100, z_index: 1,
      })
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects zone with x out of bounds', () => {
      const result = ZoneValidator.validateZone({
        name: 'Bad Zone',
        x: -5, y: 0, width: 50, height: 50, z_index: 1,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('X position must be between 0 and 100')
    })

    it('rejects zone with y out of bounds', () => {
      const result = ZoneValidator.validateZone({
        name: 'Bad Zone',
        x: 0, y: 105, width: 50, height: 50, z_index: 1,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Y position must be between 0 and 100')
    })

    it('rejects zero width', () => {
      const result = ZoneValidator.validateZone({
        name: 'Zero Width',
        x: 0, y: 0, width: 0, height: 50, z_index: 1,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Width must be between 1 and 100')
    })

    it('rejects zone extending beyond right edge', () => {
      const result = ZoneValidator.validateZone({
        name: 'Overflow Right',
        x: 60, y: 0, width: 50, height: 50, z_index: 1,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Zone extends beyond right edge of canvas')
    })

    it('rejects zone extending beyond bottom edge', () => {
      const result = ZoneValidator.validateZone({
        name: 'Overflow Bottom',
        x: 0, y: 70, width: 50, height: 40, z_index: 1,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Zone extends beyond bottom edge of canvas')
    })

    it('warns about very small zones', () => {
      const result = ZoneValidator.validateZone({
        name: 'Tiny Zone',
        x: 0, y: 0, width: 3, height: 3, z_index: 1,
      })
      expect(result.isValid).toBe(true) // warnings don't prevent validity
      expect(result.warnings).toContain('Zone width is very small (less than 5%)')
      expect(result.warnings).toContain('Zone height is very small (less than 5%)')
    })

    it('rejects empty zone name', () => {
      const result = ZoneValidator.validateZone({
        name: '  ',
        x: 0, y: 0, width: 50, height: 50, z_index: 1,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Zone name is required')
    })

    it('warns about overlap with existing zones', () => {
      const existingZones = [
        { zone_id: 'z1', name: 'Left', x: 0, y: 0, width: 50, height: 100, z_index: 1 },
      ]
      const result = ZoneValidator.validateZone(
        { name: 'Overlapping', x: 25, y: 0, width: 50, height: 100, z_index: 1 },
        existingZones,
      )
      expect(result.isValid).toBe(true) // overlap is only a warning
      expect(result.warnings).toContain('Zone overlaps with "Left"')
    })

    it('warns about duplicate zone names', () => {
      const existingZones = [
        { zone_id: 'z1', name: 'Main Zone', x: 0, y: 0, width: 50, height: 100, z_index: 1 },
      ]
      const result = ZoneValidator.validateZone(
        { name: 'Main Zone', x: 50, y: 0, width: 50, height: 100, z_index: 1 },
        existingZones,
      )
      expect(result.warnings).toContain('Zone name "Main Zone" is already used')
    })
  })

  describe('validateZoneUpdate', () => {
    const existingZones = [
      { zone_id: 'z1', name: 'Left', x: 0, y: 0, width: 50, height: 100, z_index: 1 },
      { zone_id: 'z2', name: 'Right', x: 50, y: 0, width: 50, height: 100, z_index: 1 },
    ]

    it('validates a valid update', () => {
      const result = ZoneValidator.validateZoneUpdate('z1', { width: 40 }, existingZones)
      expect(result.isValid).toBe(true)
    })

    it('returns error for non-existent zone', () => {
      const result = ZoneValidator.validateZoneUpdate('z-missing', { width: 40 }, existingZones)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Zone not found')
    })

    it('detects overlap on update', () => {
      const result = ZoneValidator.validateZoneUpdate('z1', { width: 80 }, existingZones)
      expect(result.warnings.some(w => w.includes('overlaps'))).toBe(true)
    })
  })

  describe('zonesOverlap', () => {
    it('detects overlapping zones', () => {
      const zone1 = { name: 'A', x: 0, y: 0, width: 60, height: 60, z_index: 1 }
      const zone2 = { zone_id: 'z2', name: 'B', x: 30, y: 30, width: 60, height: 60, z_index: 1 }
      expect(ZoneValidator.zonesOverlap(zone1, zone2)).toBe(true)
    })

    it('returns false for non-overlapping zones', () => {
      const zone1 = { name: 'A', x: 0, y: 0, width: 50, height: 100, z_index: 1 }
      const zone2 = { zone_id: 'z2', name: 'B', x: 50, y: 0, width: 50, height: 100, z_index: 1 }
      expect(ZoneValidator.zonesOverlap(zone1, zone2)).toBe(false)
    })
  })

  describe('suggestZonePositions', () => {
    it('suggests single full-screen zone', () => {
      const zones = ZoneValidator.suggestZonePositions(1)
      expect(zones).toHaveLength(1)
      expect(zones[0]).toEqual({ name: 'Main Zone', x: 0, y: 0, width: 100, height: 100, z_index: 1 })
    })

    it('suggests 2 side-by-side zones', () => {
      const zones = ZoneValidator.suggestZonePositions(2)
      expect(zones).toHaveLength(2)
      expect(zones[0].width).toBe(50)
      expect(zones[1].x).toBe(50)
    })

    it('suggests 4-zone grid', () => {
      const zones = ZoneValidator.suggestZonePositions(4)
      expect(zones).toHaveLength(4)
      expect(zones[0]).toMatchObject({ x: 0, y: 0, width: 50, height: 50 })
      expect(zones[3]).toMatchObject({ x: 50, y: 50, width: 50, height: 50 })
    })
  })

  describe('snapToGrid', () => {
    it('snaps to nearest grid value', () => {
      expect(ZoneValidator.snapToGrid(12, 5)).toBe(10)
      expect(ZoneValidator.snapToGrid(13, 5)).toBe(15)
      expect(ZoneValidator.snapToGrid(50, 5)).toBe(50)
    })
  })

  describe('isZoneVisible', () => {
    it('returns true for visible zone', () => {
      expect(ZoneValidator.isZoneVisible({
        zone_id: 'z1', name: 'A', x: 0, y: 0, width: 50, height: 50, z_index: 1,
      })).toBe(true)
    })

    it('returns false for zero-size zone', () => {
      expect(ZoneValidator.isZoneVisible({
        zone_id: 'z1', name: 'A', x: 0, y: 0, width: 0, height: 50, z_index: 1,
      })).toBe(false)
    })
  })
})
