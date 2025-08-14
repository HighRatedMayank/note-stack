"use client";

import { ReactNode } from "react";

interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
}

export default function ResponsiveWrapper({
  children,
  className = "",
  mobile,
  tablet,
  desktop,
}: ResponsiveWrapperProps) {
  return (
    <>
      {/* Mobile view */}
      <div className={`block md:hidden ${className}`}>
        {mobile || children}
      </div>
      
      {/* Tablet view */}
      <div className={`hidden md:block lg:hidden ${className}`}>
        {tablet || children}
      </div>
      
      {/* Desktop view */}
      <div className={`hidden lg:block ${className}`}>
        {desktop || children}
      </div>
    </>
  );
}

// Responsive text sizes
export function ResponsiveText({
  children,
  className = "",
  mobile = "text-sm",
  tablet = "text-base",
  desktop = "text-lg",
}: {
  children: ReactNode;
  className?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
}) {
  return (
    <span className={`${mobile} md:${tablet} lg:${desktop} ${className}`}>
      {children}
    </span>
  );
}

// Responsive spacing
export function ResponsiveSpacing({
  children,
  className = "",
  mobile = "p-4",
  tablet = "p-6",
  desktop = "p-8",
}: {
  children: ReactNode;
  className?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
}) {
  return (
    <div className={`${mobile} md:${tablet} lg:${desktop} ${className}`}>
      {children}
    </div>
  );
}

// Responsive grid
export function ResponsiveGrid({
  children,
  className = "",
  mobile = "grid-cols-1",
  tablet = "grid-cols-2",
  desktop = "grid-cols-3",
}: {
  children: ReactNode;
  className?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
}) {
  return (
    <div className={`grid gap-4 ${mobile} md:${tablet} lg:${desktop} ${className}`}>
      {children}
    </div>
  );
}
