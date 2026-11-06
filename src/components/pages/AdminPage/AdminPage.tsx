"use client";
// Client component: holds the sign-out error state.

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
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
          <p className="mb-4 text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <h2 className="mb-4 text-lg font-semibold">Users</h2>
        <table className="w-full border border-zinc-200 bg-white text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-100">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                Email
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Rendered in the order given (newest first from listUsers). */}
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-zinc-200 last:border-b-0"
              >
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageTemplate>
  );
};

export { AdminPage };
export default AdminPage;
