import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/dit-logo.png";

interface DitLogoProps {
  className?: string;
  imageClassName?: string;
  href?: string;
}

export function DitLogo({ className, imageClassName, href = "/" }: DitLogoProps) {
  const image = (
    <img
      src={LOGO_SRC}
      alt="Dakar Institute of Technology"
      width={320}
      height={91}
      className={cn("h-8 w-auto md:h-10", imageClassName)}
    />
  );

  if (!href) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link to={href} className={cn("inline-flex items-center", className)}>
      {image}
    </Link>
  );
}
