/*
 * Next.js App Router route for `/profile`.
 * Signed-out visitors go to `/login`; otherwise render the profile page
 * (which signs out through `authClient`).
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { ProfilePage } from "@/components/pages/ProfilePage/ProfilePage";

// Render on every request so the session check always runs.
export const dynamic = "force-dynamic";

export default async function Profile() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }
  return <ProfilePage currentUser={currentUser} />;
}
