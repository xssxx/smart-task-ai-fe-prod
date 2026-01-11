"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "./LoadingProvider";
import { ComponentProps } from "react";

type LinkWithLoadingProps = ComponentProps<typeof Link>;

export function LinkWithLoading({ href, onClick, children, ...props }: LinkWithLoadingProps) {
  const { startLoading } = useLoading();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetPath = typeof href === "string" ? href : href.pathname;
    
    // Only show loading if navigating to a different page
    if (targetPath && targetPath !== pathname) {
      startLoading();
    }
    
    onClick?.(e);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
