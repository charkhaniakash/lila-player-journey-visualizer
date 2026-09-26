import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { worldToPixel } from './coords.js';

const AMBROSE_VALLEY = {
  id: 'AmbroseValley' as const,
  label: 'Ambrose Valley',
  scale: 900,
  originX: -370,
  originZ: -473,
  imageWidth: 1024,
  imageHeight: 1024,
  minimapPath: '/minimaps/ambrose_valley.webp',
};

describe('worldToPixel', () => {
  it('maps AmbroseValley (-301.45, -355.55) to approximately (78, 890)', () => {
    const result = worldToPixel(-301.45, -355.55, AMBROSE_VALLEY);
    assert.equal(Math.round(result.px), 78);
    assert.equal(Math.round(result.py), 890);
  });

  it('maps origin corner to (0, imageHeight)', () => {
    const result = worldToPixel(-370, -473, AMBROSE_VALLEY);
    assert.equal(Math.round(result.px), 0);
    assert.equal(Math.round(result.py), 1024);
  });

  it('maps far corner to (imageWidth, 0)', () => {
    const result = worldToPixel(-370 + 900, -473 + 900, AMBROSE_VALLEY);
    assert.equal(Math.round(result.px), 1024);
    assert.equal(Math.round(result.py), 0);
  });
});
