import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import { Activity, useState } from "react";
import Masonry from "../components/masonry";
import { Skeleton } from "../components/ui/skeleton";
import { images } from "../constants";

export const Route = createFileRoute("/practice")({
	component: RouteComponent,
});

const PAGE_SIZE = 10;

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
	const [previewImages, setPreviewImages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const hasMore = previewImages.length < images.length;

	const loadMore = () => {
		setIsLoading(true);
		setTimeout(() => {
			setPreviewImages((current) => {
				return [
					...current,
					...images.slice(
						previewImages.length,
						previewImages.length + PAGE_SIZE,
					),
				];
			});

			setIsLoading(false);
		}, 1000);
	};

	return (
		<div className="w-full min-h-screen bg-zinc-950">
			<div className="px-2 py-2 bg-secondary inline-flex items-center fixed z-10 right-4 top-4">
				{previewImages.length}/{images.length}
			</div>
			<div className="w-full mx-auto max-w-4xl pt-20 space-y-5">
				<p className="text-zinc-100 font-extrabold text-3xl">AnimeX</p>
				<Masonry
					items={previewImages}
					columnCount={3}
					gap={4}
					renderItem={(item, onLoad) => (
						<img
							src={item.image}
							alt=""
							onLoad={onLoad}
							className="rounded-xl"
						/>
					)}
				/>

				<motion.span
					onViewportEnter={() => {
						if (isLoading || !hasMore) return;
						loadMore();
					}}
					viewport={{
						margin: "0px 0px 400px 0px",
					}}
				/>

				{isLoading && previewImages.length === 0 && (
					<div className="columns-3 gap-3">
						{Array.from({ length: PAGE_SIZE }).map((item) => (
							<Skeleton
								key={`key-${item}`}
								className="size-full break-inside-avoid mb-3"
								// eslint-disable-next-line react-hooks/purity
								style={{ height: `${Math.floor(Math.random() * 380 + 150)}px` }}
							/>
						))}
					</div>
				)}

				<div className="h-20  w-full justify-center text-white inline-flex items-center gap-2">
					<Activity mode={isLoading ? "visible" : "hidden"}>
						<LoaderCircle className="text-white animate-spin" />{" "}
						<span className="text-xl font-extrabold">Loading...</span>
					</Activity>
				</div>
			</div>
		</div>
	);
}
