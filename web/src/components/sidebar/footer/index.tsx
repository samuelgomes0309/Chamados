"use client";

import { logoutAction } from "@/src/actions/user";
import { LogOut } from "lucide-react";

export function SidebarFooter() {
	return (
		<div className="border-t border-border-strong px-2 py-4">
			<button
				className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-0.5 transition-colors duration-700 hover:bg-teal"
				onClick={logoutAction}
			>
				<LogOut size={22} />
				<span className="text-lg font-bold text-white">Sair</span>
			</button>
		</div>
	);
}
