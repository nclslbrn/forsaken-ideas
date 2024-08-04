import { bounds, circleFrom2Points } from "@thi.ng/geom";
import { clipLinePoly } from "@thi.ng/geom-clip-line";
import {
	add2,
	cartesian2,
	maddN2,
	normalize2,
	perpendicularCW,
	sub2,
} from "@thi.ng/vectors";

const hatch = (shape, theta = 0, step = 1) => {
	const res = [];
	const b = bounds(shape);
	if (!b) return res;
	// bounding circle of bounding box
	const bc = circleFrom2Points(b.pos, b.max());
	// hatch dir
	const dir = cartesian2(null, [bc.r, theta]);
	// hatch normal (ray direction)
	const norm = normalize2(null, perpendicularCW([], dir));
	// ray start point
	const start = maddN2([], norm, -bc.r, bc.pos);
	for (let d = 0, maxD = bc.r * 2; d <= maxD; d += step) {
		// next point on ray
		const m = maddN2([], norm, d, start);
		// intersect line segment with poly
		const segments = clipLinePoly(
			sub2([], m, dir),
			add2([], m, dir),
			shape.points,
		);
		if (!segments) continue;
		// add segments to group
		for (let s of segments) res.push(s);
	}
	return res;
};

export default hatch;
