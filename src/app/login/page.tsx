/*
 * Next.js App Router route for `/login`.
 * Signed-in visitors go to `homePathForRole(role)`; otherwise render the sign-in page.
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { homePathForRole } from "@/actions/auth/helpers";
import { signIn } from "@/actions/auth/signIn/signIn";
import { SignInPage } from "@/components/pages/SignInPage/SignInPage";

// Render on every request so the session check always runs.
export const dynamic = "force-dynamic";

export default async function Login() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect(homePathForRole(currentUser.role));
  }
  return <SignInPage signIn={signIn} />;
}
