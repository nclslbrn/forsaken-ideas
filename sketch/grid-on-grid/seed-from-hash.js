import { B58_CHARS_LC } from "@thi.ng/base-n/chars/58";

export const seedFromHash = (hash) =>
	hash
		.slice(2)
		.match(new RegExp(`.{${(hash.length - 2) >> 2}}`, "g"))
		.map((x) =>
			[...x].reduce(
				(acc, y) => (acc * 58 + B58_CHARS_LC.indexOf(y)) >>> 0,
				0
			)
		);

