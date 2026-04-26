import { listSectorAction } from "@/src/actions/sector";
import { listUsersAction } from "@/src/actions/user";
import { User } from "@/src/components/user";

export default async function UsersPage() {
	const usersResult = await listUsersAction();
	const sectorsResult = await listSectorAction({ status: "ACTIVE" });
	const sectors = sectorsResult.data ?? [];
	const users = usersResult.data ?? [];
	return <User users={users} sectors={sectors} />;
}
