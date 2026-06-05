export const images = Array.from({ length: 146 }).map((_, idx) => ({
	id: crypto.randomUUID(),
	image: `walls/${idx + 1}.jpg`,
}));
