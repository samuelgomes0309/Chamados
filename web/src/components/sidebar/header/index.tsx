export function SidebarHeader({
	name,
	isMobile,
}: {
	name?: string;
	isMobile?: boolean;
}) {
	return (
		<div
			className={`flex flex-col items-center justify-center ${isMobile ? "flex-1 pt-4" : "space-y-2 border-b border-border-strong px-2 py-8"}`}
		>
			<h1 className="text-3xl font-bold text-teal italic md:text-4xl">Nexus</h1>
			{!isMobile && name && (
				<span className="text-md text-ring"> Olá {name}!</span>
			)}
		</div>
	);
}
