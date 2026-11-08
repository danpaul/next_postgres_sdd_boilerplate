"use client";
// Client component: holds the sign-out error state.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient, GENERIC_ERROR } from "@/lib/auth-client";

/**
 * The route (`src/app/admin/page.tsx`) only renders this for admins and loads
 * `users` with `listUsers`, which selects only `id`, `email`, and `role`.
 */
export type AdminPageProps = {
  currentUser: { email: string; name: string; role: "user" | "admin" };
  users: { id: string; email: string; role: "user" | "admin" }[];
  /** Defaults to `authClient.signOut`. Injected only by tests and stories. */
  signOut?: () => Promise<{ error: { code?: string } | null }>;
};

const defaultSignOut: NonNullable<AdminPageProps["signOut"]> = () =>
  authClient.signOut();

const AdminPage = function AdminPage({
  currentUser,
  users,
  signOut = defaultSignOut,
}: AdminPageProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSignOut() {
    let result: Awaited<ReturnType<typeof signOut>>;
    try {
      result = await signOut();
    } catch (error) {
      setErrorMessage(GENERIC_ERROR);
      throw error;
    }
    if (result.error) {
      setErrorMessage(GENERIC_ERROR);
      throw new Error("Sign out failed");
    }
    router.push("/");
    router.refresh();
  }

  return (
    <PageTemplate currentUser={currentUser} onSignOut={onSignOut}>
      <div className="mx-auto w-full max-w-2xl">
        {errorMessage ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <h2 className="mb-4 text-lg font-semibold">Users</h2>
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Email</TableHead>
                <TableHead scope="col">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Rendered in the order given (newest first from listUsers). */}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageTemplate>
  );
};

export { AdminPage };
export default AdminPage;
