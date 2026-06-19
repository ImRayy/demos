/* eslint-disable react-hooks/refs */
import type React from "react";
import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

type Position = { x: number; y: number };

type MasonryItem = {
	id: string;
	height?: number;
};

type MasonryProps<T extends MasonryItem> = {
	items: T[];
	columnCount: number;
	gap: number;
	parentRef?: RefObject<HTMLDivElement>;
	renderItem: (arg: T, onLoad: () => void) => React.ReactNode;
};

export default function Masonry<T extends MasonryItem>({
	items,
	columnCount = 3,
	gap = 16,
	renderItem,
	parentRef,
}: MasonryProps<T>) {
	const refs = useRef<Record<string, HTMLDivElement | null>>({});
	const [positions, setPositions] = useState<Record<string, Position>>({});
	const [totalHeight, setTotalHeight] = useState(0);
	const prevColumnCount = useRef(columnCount);
	const loadedIds = useRef<Set<string>>(new Set());
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

	const calculateLayout = useCallback(() => {
		const anyEl = Object.values(refs.current).find(Boolean);
		if (!anyEl?.parentElement) return;

		const containerWidth = anyEl.parentElement.offsetWidth;
		const colWidth = containerWidth / columnCount;
		const heights = new Array(columnCount).fill(0);
		const newPositions: Record<string, Position> = {};

		items.forEach((item) => {
			const el = refs.current[item.id];
			if (!el || !loadedIds.current.has(item.id)) return;

			const col = heights.indexOf(Math.min(...heights));
			newPositions[item.id] = {
				x: col * (colWidth + gap),
				y: heights[col],
			};
			heights[col] += el.offsetHeight + gap * 2;
		});

		setPositions(newPositions);
		setTotalHeight(Math.max(...heights, 0));
	}, [columnCount, gap, items]);

	const queneLayout = useCallback(() => {
		clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(calculateLayout, 150);
	}, [calculateLayout]);

	const handleItemLoad = useCallback(
		(id: string) => {
			if (loadedIds.current.has(id)) return;
			loadedIds.current.add(id);

			queneLayout();
		},
		[queneLayout],
	);

	useEffect(() => {
		if (parentRef?.current) {
			const observer = new ResizeObserver(queneLayout);
			observer.observe(parentRef.current);
			return () => observer.disconnect();
		}

		window.addEventListener("resize", queneLayout);
		return () => {
			window.removeEventListener("resize", queneLayout);
		};
	}, [parentRef, queneLayout]);

	useEffect(() => {
		if (prevColumnCount.current !== columnCount) {
			prevColumnCount.current = columnCount;
			calculateLayout();
			console.count("resize observer");
		}
	}, [calculateLayout, columnCount]);

	return (
		<div
			style={{
				position: "relative",
				height: totalHeight,
			}}
		>
			{items.map((item) => (
				<div
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
						transition: "transform 0.2s ease, opacity 0.2s ease",
					}}
				>
					{renderItem(item, () => handleItemLoad(item.id))}
				</div>
			))}
		</div>
	);
}
