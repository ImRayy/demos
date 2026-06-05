/* eslint-disable react-hooks/refs */
import { motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type Position = { x: number; y: number };

type MasonryItem = {
	id: string;
	height?: number;
};

type MasonryProps<T extends MasonryItem> = {
	items: T[];
	columnCount: number;
	gap: number;
	renderItem: (arg: T, onLoad: () => void) => React.ReactNode;
};

export default function Masonry<T extends MasonryItem>({
	items,
	columnCount = 3,
	gap = 16,
	renderItem,
}: MasonryProps<T>) {
	const refs = useRef<Record<string, HTMLDivElement | null>>({});
	const [positions, setPositions] = useState<Record<string, Position>>({});
	const [totalHeight, setTotalHeight] = useState(0);
	const columnHeights = useRef<number[]>(new Array(columnCount).fill(0));
	const loadedIds = useRef<Set<string>>(new Set());

	const handleItemLoad = useCallback(
		(id: string) => {
			if (loadedIds.current.has(id)) return;
			loadedIds.current.add(id);

			const el = refs.current[id];
			if (!el?.parentElement) return;

			const containerWidth = el.parentElement.offsetWidth;
			const colWidth = containerWidth / columnCount;
			const heights = columnHeights.current;

			const col = heights.indexOf(Math.min(...heights));
			const x = col * (colWidth + gap);
			const y = heights[col];
			heights[col] += el.offsetHeight + gap;

			setPositions((prev) => ({ ...prev, [id]: { x, y } }));
			setTotalHeight(Math.max(...heights));
		},
		[columnCount, gap],
	);

	const recalculate = useCallback(() => {
		const heights = new Array(columnCount).fill(0);
		const newPositions: Record<string, Position> = {};

		const anyEl = Object.values(refs.current).find(Boolean);
		if (!anyEl?.parentElement) return;
		const containerWidth = anyEl.parentElement.offsetWidth;
		const colWidth = containerWidth / columnCount;

		items
			.filter((img) => loadedIds.current.has(img.id))
			.forEach((img) => {
				const el = refs.current[img.id];
				if (!el) return;

				const col = heights.indexOf(Math.min(...heights));
				newPositions[img.id] = {
					x: col * (colWidth + gap),
					y: heights[col],
				};

				heights[col] += el.offsetHeight + gap;
				setPositions(newPositions);
				setTotalHeight(Math.max(...heights));
			});
	}, [columnCount, gap, items]);

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
	});

	return (
		<div style={{ position: "relative", height: totalHeight }}>
			{items.map((item) => (
				<motion.div
					key={item.id}
					ref={(el: HTMLDivElement) => {
						refs.current[item.id] = el;
					}}
					style={{
						position: "absolute",
						transform: positions[item.id]
							? `translate(${positions[item.id].x}px, ${positions[item.id].y}px)`
							: "none",
						opacity: positions[item.id] ? 1 : 0,
						width: `calc(${100 / columnCount}% - ${gap}px)`,
						// transition: "transform 0.2s ease, opacity 0.2s ease",
					}}
				>
					{renderItem(item, () => handleItemLoad(item.id))}
				</motion.div>
			))}
		</div>
	);
}
