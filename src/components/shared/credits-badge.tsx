import Link from "next/link";
import { cn, formatCredits } from "@/lib/utils";
import { StarIcon } from "@/components/shared/star-icon";

const baseClass =
  "flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full";

export function CreditsBadge({
  credits,
  href,
  className,
}: {
  credits: number;
  href?: string;
  className?: string;
}) {
  const inner = (
    <>
      <StarIcon className="w-3 h-3" />
      {formatCredits(credits)}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cn(baseClass, "hover:bg-accent/80 transition-colors", className)}>
        {inner}
      </Link>
    );
  }
  return <span className={cn(baseClass, className)}>{inner}</span>;
}
