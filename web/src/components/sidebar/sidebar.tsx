"use client";

import { User } from "@/src/@types/user/user";
import { SidebarContent } from "./content";
import { SidebarFooter } from "./footer";
import { SidebarHeader } from "./header";
import { useEffect, useState } from "react";
import { ChevronUp, Menu } from "lucide-react";

export function AppSidebar({ user }: { user: User }) {
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false);
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener("resize", handleResize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	if (isMobile) {
		return (
			<div className="flex w-full flex-col border-r border-border-strong bg-surface-alt">
				<div className="flex w-full justify-center gap-2 border-b border-border-strong px-4 py-2">
					<SidebarHeader isMobile={isMobile} name={user?.name} />
					<button
						onClick={() => setVisible((prev) => !prev)}
						className="cursor-pointer"
					>
						{visible ? <ChevronUp /> : <Menu />}
					</button>
				</div>
				{visible && (
					<>
						<SidebarContent user={user} />
						<SidebarFooter />
					</>
				)}
			</div>
		);
	}
	return (
		<div
			className={`min-h-screen w-52 flex-row border-r border-border-strong bg-surface-alt ${isMobile ? "hidden" : "flex"} md:flex-col`}
		>
			<SidebarHeader name={user?.name} isMobile={isMobile} />
			<SidebarContent user={user} />
			<SidebarFooter />
		</div>
	);
}
