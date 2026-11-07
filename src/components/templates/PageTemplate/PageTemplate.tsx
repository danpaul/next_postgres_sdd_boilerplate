import type { ComponentProps, ReactNode } from "react";
import { Footer } from "@/components/organisms/Footer/Footer";
import { Header } from "@/components/organisms/Header/Header";
import type { Role } from "@/generated/prisma/browser";
import { cn } from "@/lib/utils";

export type PageTemplateProps = ComponentProps<"div"> & {
  children: ReactNode;
  currentUser?: { email: string; role: Role } | null;
  onSignOut?: () => void | Promise<void>;
};

const PageTemplate = function PageTemplate({
  children,
  currentUser,
  onSignOut,
  className,
  ref,
  ...props
}: PageTemplateProps) {
  const classes = cn("flex min-h-screen flex-col bg-muted", className);

  return (
    <div {...props} ref={ref} className={classes}>
      <Header currentUser={currentUser} onSignOut={onSignOut} />
      <main className="flex-1 px-6 py-8">{children}</main>
      <Footer />
    </div>
  );
};

export { PageTemplate };
export default PageTemplate;
