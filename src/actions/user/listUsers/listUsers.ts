"use server";

/*
 * Server Action. Admin only: throws "Forbidden" for signed-out users and non-admins.
 * Returns every user, newest first, with only `id`, `email`, and `role`.
 */
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { prisma } from "@/prisma/prismaClient";

export async function listUsers() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") {
    throw new Error("Forbidden");
  }
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true },
  });
}
