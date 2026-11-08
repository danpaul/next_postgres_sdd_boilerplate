/*
 * Next.js App Router route for `/admin`.
 * Signed-out visitors go to `/login` and non-admins go to `/`;
 * otherwise loads every user and renders the admin page
 * (which signs out through `authClient`).
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { listUsers } from "@/actions/user/listUsers/listUsers";
import { AdminPage } from "@/components/pages/AdminPage/AdminPage";

// Render on every request so the role check and user list are always current.
export const dynamic = "force-dynamic";

export default async function Admin() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }
  if (currentUser.role !== "admin") {
    redirect("/");
  }
  const users = await listUsers();
  return <AdminPage currentUser={currentUser} users={users} />;
}
