/*
 * Next.js App Router route for `/signup`.
 * Signed-in visitors go to `homePathForRole(role)`; otherwise render the
 * sign-up page, which signs up through `authClient`.
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { SignUpPage } from "@/components/pages/SignUpPage/SignUpPage";
import { homePathForRole } from "@/lib/auth-client";

// Render on every request so the session check always runs.
export const dynamic = "force-dynamic";

export default async function Signup() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect(homePathForRole(currentUser.role));
  }
  return <SignUpPage />;
}
