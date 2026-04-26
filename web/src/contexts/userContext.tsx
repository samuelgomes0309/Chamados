"use client";

import type { User } from "@/src/@types/user/user";
import { createContext, useContext } from "react";

const UserContext = createContext<User | null>(null);

export function UserProvider({
	user,
	children,
}: {
	user: User | null;
	children: React.ReactNode;
}) {
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
	const context = useContext(UserContext);
	if (!context)
		throw new Error("O hook useUser deve ser usado dentro de UserProvider");
	return context;
}

export default UserContext;
