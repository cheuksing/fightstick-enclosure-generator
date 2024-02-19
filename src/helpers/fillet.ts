import {point, angle, chain, model, models, paths, measure, solvers, type IPoint, type IPathArc, type IModel, type IChain} from 'makerjs';

/**
 * Normalizes a point in 2D space to a unit vector.
 *
 * This function takes a point as input and returns a new point that is normalized.
 * The returned point is on the same line from the origin to the original point, but at a distance of 1 from the origin.
 *
 * @param {IPoint} point - The point to normalize.
 * @returns {IPoint} The normalized point.
 */
function normalizePoint(p: IPoint): IPoint {
  const length = measure.pathLength(new paths.Line([0, 0], p));
  return point.scale(p, 1 / length);
}

/**
 * Calculates the coordinates of Point B, which is a point on the tangent of Point A on an Arc.
 * Point B is at a given distance from Point A and is the one closer to the middle point of the Arc.
 *
 * @param {IPathArc} arc - The Arc on which Point A lies.
 * @param {IPoint} pointA - The coordinates of Point A.
 * @param {number} distance - The distance between Point A and Point B.
 * @returns {IPoint} The coordinates of Point B.
 */
function getSideControlPoint(arc: IPathArc, pointA: IPoint, distance: number): IPoint {
  // Calculate the angle of Point A relative to the Arc's center
  const angleA = angle.ofPointInDegrees(arc.origin, pointA);

  // Calculate the slope of the tangent line at Point A
  const slope = -1 / Math.tan(angle.toRadians(angleA));

  // Calculate the coordinates of two possible Point Bs on the tangent line
  const pointB1: IPoint = [
    pointA[0] + (distance * Math.cos(Math.atan(slope))),
    pointA[1] + (distance * Math.sin(Math.atan(slope))),
  ];
  const pointB2: IPoint = [
    pointA[0] - (distance * Math.cos(Math.atan(slope))),
    pointA[1] - (distance * Math.sin(Math.atan(slope))),
  ];

  // Calculate the middle point of the Arc
  const midPoint = point.middle(arc);

  // Return the Point B that is closer to the middle point of the Arc
  const l1 = measure.pointDistance(midPoint, pointB1);
  const l2 = measure.pointDistance(midPoint, pointB2);
  return l2 > l1 ? pointB1 : pointB2;
}

/**
 * Calculates and returns the points A, B, and C on an arc.
 * Point B is on the normal the arc that also passes through the midpoint of the arc.
 * Point B also need to be the same direction as midpoint relative to the origin of the arc.
 * Points A and C are on the tangent of the arc and are equidistant from point B.
 *
 * @param {IPathArc} arc - The arc to calculate points on.
 * @param {number} ratio - The distance to move along the tangent from point B to get points A and C.
 * @returns {[IPoint, IPoint, IPoint]} An array containing points A, B, and C.
 */
function getCenterControlPoints(arc: IPathArc, ratio: number) {
  const normal = normalizePoint(point.subtract(point.middle(arc), arc.origin));

  const tangent = point.rotate(normal, 90);
  // Const delta = point.scale(normal, X);
  // const pointB = point.add(arc.origin, delta);
  const midPoint = point.middle(arc);
  const pointB = midPoint;

  // Move along the tangent by distance Y in both directions from point B to get points A and C
  const pointA = point.add(pointB, point.scale(tangent, ratio));
  const pointC = point.subtract(pointB, point.scale(tangent, ratio));

  return [pointA, pointB, pointC];
}

/**
 * Creates a model with filleted squircle arc paths based on the provided chain, fillet radius, and strength.
 *
 * @export
 * @param {IChain} chain - The chain to be filleted.
 * @param {number} filletRadius - The radius of the fillet.
 * @param {number} strength - The strength of the fillet. default is 0.5. recommended range is 0.1 to 0.9.
 * @returns {IModel} - The model containing the filleted squircle arc paths.
 */
export function filletG2Continunity(c: IChain, filletRadius: number, strength = 0.5): IModel {
  // This model will contain the filleted squircle arc paths
  const squircleModel: IModel = {};

  const g1 = chain.fillet(c, filletRadius);

  if (!g1.paths) {
    return squircleModel;
  }

  const g1ArcPaths = Object.values(g1.paths) as IPathArc[];

  let i = 0;
  for (const arc of g1ArcPaths) {
    const [startPoint, endPoint] = point.fromArc(arc);

    const p0p6 = new paths.Line([startPoint, endPoint]);

    // The height p1 is half the height of p3, using p0p6 as the triangle's base
    const s1 = solvers.equilateralSide(
      measure.pointDistance(
        point.middle(p0p6),
        point.middle(arc),
      ) / 2);

    const p0 = startPoint;
    const p1 = getSideControlPoint(arc, startPoint, s1);
    const p5 = getSideControlPoint(arc, endPoint, s1);
    const p6 = endPoint;

    const s2 = measure.pointDistance(p1, p5) / 2 * strength;

    const [a, p3, c] = getCenterControlPoints(arc, s2);

    // Find point A or point C that is closer to p0
    const l0a = measure.pointDistance(p0, a);
    const l0c = measure.pointDistance(p0, c);

    const p2 = l0a < l0c ? a : c;
    const p4 = l0a < l0c ? c : a;

    const bezier0 = new models.BezierCurve([p0, p1, p2, p3]);
    const bezier1 = new models.BezierCurve([p3, p4, p5, p6]);

    if (import.meta.env?.DEBUG_G2_FILLET === 'true') {
      const refLine = new models.ConnectTheDots(false, [p0, p1, p2, p3, p4, p5, p6]);
      // @ts-expect-error - change model color for debugging
      refLine.layer = 'yellow';
      model.addModel(squircleModel, refLine, `Fillet${i}_refLine`);
      // @ts-expect-error - change model color for debugging
      bezier0.layer = 'red';
      // @ts-expect-error - change model color for debugging
      bezier1.layer = 'red';
      model.addModel(squircleModel, g1, `Fillet${i}_g1_ref`);

      console.log('line length', {
        p0p1: measure.pointDistance(p0, p1),
        p1p2: measure.pointDistance(p1, p2),
        p2p3: measure.pointDistance(p2, p3),
        s1,
        s2,
      });
    }

    model.addModel(squircleModel, bezier0, `Fillet${i}_g2Bezier0`);
    model.addModel(squircleModel, bezier1, `Fillet${i}_g2Bezier1`);

    i++;
  }

  return squircleModel;
}

