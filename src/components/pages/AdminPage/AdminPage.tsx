"use client";
// Client component: holds the sign-out error state.

import { unstable_rethrow } from "next/navigation";
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
import type { Role } from "@/generated/prisma/browser";

/**
 * The route (`src/app/admin/page.tsx`) only renders this for admins and loads
 * `users` with `listUsers`, which selects only `id`, `email`, and `role`.
 */
export type AdminPageProps = {
  currentUser: { email: string; role: Role };
  users: { id: number; email: string; role: Role }[];
  signOut: () => Promise<void>;
};

const AdminPage = function AdminPage({
  currentUser,
  users,
  signOut,
}: AdminPageProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSignOut() {
    try {
      await signOut();
    } catch (error) {
      // signOut redirects on success, which rejects with Next's redirect
      // error. Let that through so the router can navigate.
      unstable_rethrow(error);
      setErrorMessage("Something went wrong. Try again.");
      throw error;
    }
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
