import { RoseMark } from "@/components/brand/RoseMark";
import { cn } from "@/lib/utils";

/**
 * Stands in for real photography until it exists. Never a broken <img>: a
 * quiet blush card with the rose mark, sized exactly like the photo it will
 * become, so dropping in a real file later is a one-line swap.
 */
export function ImagePlaceholder({
  label,
  className,
  tone = "blush",
}: {
  label: string;
  className?: string;
  tone?: "blush" | "charcoal";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center",
        tone === "blush"
          ? "border-line bg-blush text-crimson-dark"
          : "border-white/20 bg-white/5 text-blush-white",
        className,
      )}
    >
      <RoseMark className="h-8 w-8" />
      <p className="eyebrow max-w-[16ch]">{label}</p>
    </div>
  );
}
