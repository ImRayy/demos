import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";

const images = Array.from({ length: 146 }).map((_, idx) => ({
	id: crypto.randomUUID(),
	image: `walls/${idx + 1}.jpg`,
}));

const PAGE_SIZE = 10;
const COLUMN_COUNT = 3;
const GAP = 16;

type Position = { x: number; y: number };

function App() {
	const [previewImages, setPreviewImages] = useState(
		images.slice(0, PAGE_SIZE),
	);
	const hasMore = previewImages.length < images.length;

	const loadMore = () => {
		setPreviewImages((current) => [
			...current,
			...images.slice(current.length, current.length + PAGE_SIZE),
		]);
	};

	const refs = useRef<Record<string, HTMLDivElement | null>>({});
	const [positions, setPositions] = useState<Record<string, Position>>({});
	const columnHeights = useRef<number[]>(new Array(COLUMN_COUNT).fill(0));
	const [totalHeight, setTotalHeight] = useState(0);
	const loadedIds = useRef<Set<string>>(new Set()); // track which images have loaded

	// Core layout function — places all loaded items from scratch
	const recalculate = useCallback(() => {
		const heights = new Array(COLUMN_COUNT).fill(0);
		const newPositions: Record<string, Position> = {};

		const anyEl = Object.values(refs.current).find(Boolean);
		if (!anyEl?.parentElement) return;
		const containerWidth = anyEl.parentElement.offsetWidth;
		const colWidth = containerWidth / COLUMN_COUNT;

		// Only lay out images that have already loaded, in original order
		previewImages
			.filter((img) => loadedIds.current.has(img.id))
			.forEach((img) => {
				const el = refs.current[img.id];
				if (!el) return;

				const col = heights.indexOf(Math.min(...heights));
				newPositions[img.id] = {
					x: col * (colWidth + GAP),
					y: heights[col],
				};
				heights[col] += el.offsetHeight + GAP;
			});

		columnHeights.current = heights;
		setPositions(newPositions);
		setTotalHeight(Math.max(...heights));
	}, [previewImages]);

	// Called when an image loads for the first time
	const handleImageLoad = useCallback((id: string) => {
		if (loadedIds.current.has(id)) return; // already handled
		loadedIds.current.add(id);

		const el = refs.current[id];
		if (!el?.parentElement) return;

		const containerWidth = el.parentElement.offsetWidth;
		const colWidth = containerWidth / COLUMN_COUNT;
		const heights = columnHeights.current;

		const col = heights.indexOf(Math.min(...heights));
		const x = col * (colWidth + GAP);
		const y = heights[col];
		heights[col] += el.offsetHeight + GAP;

		setPositions((prev) => ({ ...prev, [id]: { x, y } }));
		setTotalHeight(Math.max(...heights));
	}, []);

	// Debounced resize → full recalculate
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const onResize = () => {
			clearTimeout(timer);
			timer = setTimeout(recalculate, 150);
		};
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			clearTimeout(timer);
		};
	}, [recalculate]);

	return (
		<div className="w-full min-h-screen bg-zinc-950">
			<div className="px-2 py-2 bg-secondary inline-flex items-center fixed z-10 right-4 top-4">
				{previewImages.length}/{images.length}
			</div>
			<div className="w-full mx-auto max-w-3xl pt-20 space-y-5">
				<p className="text-zinc-100 font-extrabold text-3xl">AnimeX</p>

				<div style={{ position: "relative", height: totalHeight }}>
					{previewImages.map((img) => (
						<div
							key={img.id}
							ref={(el: HTMLDivElement | null) => {
								refs.current[img.id] = el;
							}}
							style={{
								position: "absolute",
								transform: positions[img.id]
									? `translate(${positions[img.id].x}px, ${positions[img.id].y}px)`
									: "none",
								opacity: positions[img.id] ? 1 : 0,
								width: `calc(${100 / COLUMN_COUNT}% - ${GAP}px)`,
								transition: "transform 0.2s ease, opacity 0.2s ease",
							}}
						>
							<img
								className="rounded-xl w-full block"
								src={img.image}
								alt=""
								onLoad={() => handleImageLoad(img.id)}
							/>
						</div>
					))}
				</div>

				{hasMore && (
					<Button onClick={loadMore} className="px-4 py-2 rounded">
						Load More
					</Button>
				)}
			</div>
		</div>
	);
}

export default App;
