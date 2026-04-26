import { AppSidebar } from "@/src/components/sidebar/sidebar";
import { UserProvider } from "@/src/contexts/userContext";
import { getUserLocal } from "@/src/lib/auth";

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await getUserLocal();
	return (
		<UserProvider user={user}>
			<div className="flex w-full flex-col md:flex-row">
				<AppSidebar user={user!} />
				<main className="flex-1 px-4 py-8">{children}</main>
			</div>
		</UserProvider>
	);
}
