"use client";

import { User } from "@/src/@types/user/user";
import { Factory, House, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
	{
		path: "/dashboard",
		title: "Dashboard",
		icon: House,
	},
	{
		path: "/sectors",
		title: "Setores",
		icon: Factory,
	},
	{
		path: "/tickets",
		title: "Chamados",
		icon: Ticket,
	},
	{
		path: "/users",
		title: "Usuários",
		icon: Users,
	},
];

export function SidebarContent({ user }: { user: User }) {
	const pathName = usePathname();
	return (
		<div className="flex-1 px-2 py-4">
			<ul>
				{menu.map((item) => {
					const isActive = pathName.startsWith(item.path);
					const hideFromUser = item.path === "/users" && user.role !== "ADMIN";
					const Icon = item.icon;
					if (hideFromUser) return null;
					return (
						<Link href={item.path} key={item.path}>
							<li
								className={`my-3 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-0.5 transition-colors duration-700 hover:bg-teal ${isActive ? "bg-teal" : ""}`}
							>
								<Icon size={20} />
								<span className="text-md text-white md:text-lg">
									{item.title}
								</span>
							</li>
						</Link>
					);
				})}
			</ul>
		</div>
	);
}
