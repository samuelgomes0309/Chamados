"use client";

import type { Sector } from "@/src/@types/sector/sector";
import type { User } from "@/src/@types/user/user";
import { UserCard } from "./card";
import { useUser } from "@/src/contexts/userContext";
import { Header } from "../header";
import { useState } from "react";

interface UserProps {
	users: User[];
	sectors: Sector[];
}

export function User({ users, sectors }: UserProps) {
	const userLogged = useUser();
	const [list, setList] = useState(users);
	return (
		<div>
			<Header title="Usuarios" description="Gerencie todos os usuarios" />
			{list.length > 0 ? (
				<div className="mt-2 grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{list.map((user) => {
						// Não é para ele conseguir alterar o seu proprio usuario
						if (user.id !== userLogged.id) {
							return (
								<UserCard
									key={user.id}
									user={user}
									sectors={sectors}
									onChangeUsersData={(updatedUser) => {
										setList((prevList) =>
											prevList.map((u) =>
												u.id === updatedUser.id ? updatedUser : u
											)
										);
									}}
								/>
							);
						}
						return null;
					})}
				</div>
			) : (
				<p className="mt-2 text-xl font-bold text-muted-foreground">
					Nenhum usuário encontrado.
				</p>
			)}
		</div>
	);
}
