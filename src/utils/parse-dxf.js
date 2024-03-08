import DxfParser from 'dxf-parser';

/**
 * @param {import('dxf-parser').IPolylineEntity} polyline
 * @returns {boolean}
*/
function isAxisAlignedRectangle(polyline) {
  // Check if polyline has exactly 4 vertices
  if (polyline.vertices.length !== 4) {
    return false;
  }

  // Check if each pair of consecutive vertices are aligned with the axes
  for (let i = 0; i < 4; i++) {
    const nextIndex = (i + 1) % 4;
    const dx = polyline.vertices[i].x - polyline.vertices[nextIndex].x;
    const dy = polyline.vertices[i].y - polyline.vertices[nextIndex].y;
    if (dx !== 0 && dy !== 0) {
      return false;
    }
  }

  // If all checks passed, it's an axis-aligned rectangle
  return true;
}

/**
 * @typedef {import('@schema').Layout} Layout
 * @param {string} dxfString The stringify DXF file content
 * @returns {Promise<Layout>} The parsed layout
 */
export async function parseDxfFile(dxfString) {
  /**  @type {import('@schema').Layout} */
  const result = [];

  const parser = new DxfParser();

  const parsedDxf = await parser.parse(dxfString);

  if (!parsedDxf) {
    throw new Error('Invalid DXF file');
  }

  /** @type {import('dxf-parser').ICircleEntity[]} */
  // @ts-expect-error filter can not handled the type
  const buttons = parsedDxf.entities.filter(entity =>
    entity.layer === 'button'
    && entity.type === 'CIRCLE',
  );

  for (const button of buttons) {
    const center = button.center;
    const x = Number(center.x.toFixed(2));
    const y = Number(center.y.toFixed(2));
    const radius = button.radius;

    if (radius === 12) {
      result.push({x, y, t: 'obsf24', mount: 'aboveClearPlate'});
    }

    if (radius === 15) {
      result.push({x, y, t: 'obsf30', mount: 'aboveClearPlate'});
    }
  }

  /** @type {import('dxf-parser').ICircleEntity[]} */
  // @ts-expect-error filter can not handled the type
  const sticks = parsedDxf.entities.filter(entity =>
    entity.layer === 'stick'
    && entity.type === 'CIRCLE',
  );

  for (const stick of sticks) {
    result.push({
      x: stick.center.x,
      y: stick.center.y,
      t: 'stick',
    });
  }

  /** @type {import('dxf-parser').IPolylineEntity[]} */
  // @ts-expect-error filter can not handled the type
  const brooks = parsedDxf.entities.filter(entity =>
    entity.layer === 'brook'
    && ['LWPOLYLINE', 'POLYLINE'].includes(entity.type)
    // @ts-expect-error filter can not handled the type
    && isAxisAlignedRectangle(entity),
  );

  for (const brook of brooks) {
    const pts = brook.vertices;
    const leftX = Math.min(...pts.map(p => p.x));
    const bottomY = Math.min(...pts.map(p => p.y));
    const rightX = Math.max(...pts.map(p => p.x));
    const topY = Math.max(...pts.map(p => p.y));
    const width = rightX - leftX;
    const height = topY - bottomY;

    result.push({
      x: leftX,
      y: bottomY,
      t: 'brook',
      r: width > height ? 0 : 90,
    });
  }

  return result;
}
