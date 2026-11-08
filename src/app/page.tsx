/*
 * Next.js App Router route for `/`. Public.
 * Loads the current user; HomePage signs out through `authClient`.
 */
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { HomePage } from "@/components/pages/HomePage/HomePage";

// Render on every request so getCurrentUser() reflects the current session.
export const dynamic = "force-dynamic";

export default async function Home() {
  const currentUser = await getCurrentUser();
  return <HomePage currentUser={currentUser} />;
}
