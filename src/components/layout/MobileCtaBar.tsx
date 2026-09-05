import { Link } from "@tanstack/react-router";

export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <Link
        to="/score/quiz"
        className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-medium text-primary-foreground"
      >
        Get your Findability Score
      </Link>
    </div>
  );
}
