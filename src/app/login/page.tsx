/*
 * Next.js App Router route for `/login`.
 * Signed-in visitors go to `homePathForRole(role)`; otherwise render the
 * sign-in page, which signs in through `authClient`.
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { SignInPage } from "@/components/pages/SignInPage/SignInPage";
import { homePathForRole } from "@/lib/auth-client";

// Render on every request so the session check always runs.
export const dynamic = "force-dynamic";

export default async function Login() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect(homePathForRole(currentUser.role));
  }
  return <SignInPage />;
}
