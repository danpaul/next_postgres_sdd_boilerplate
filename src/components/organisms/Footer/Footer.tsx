import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type FooterProps = ComponentProps<"footer">;

const Footer = function Footer({ className, ref, ...props }: FooterProps) {
  const classes = cn(
    "flex items-center justify-between border-t border-border bg-background px-6 py-4",
    className,
  );

  const linkClasses =
    "text-foreground underline underline-offset-2 hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <footer {...props} ref={ref} className={classes}>
      <p className="text-sm text-muted-foreground">© 2026 App</p>
      <nav aria-label="Footer" className="flex gap-4">
        <a href="#" className={linkClasses}>
          Terms
        </a>
        <a href="#" className={linkClasses}>
          Privacy
        </a>
      </nav>
    </footer>
  );
};

export { Footer };
export default Footer;
