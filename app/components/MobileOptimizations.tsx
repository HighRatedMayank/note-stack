"use client";

import { useEffect, useState } from "react";


export default function MobileOptimizations() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Add mobile-specific CSS classes to body
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add("mobile-device");
    } else {
      document.body.classList.remove("mobile-device");
    }

    if (isTablet) {
      document.body.classList.add("tablet-device");
    } else {
      document.body.classList.remove("tablet-device");
    }
  }, [isMobile, isTablet]);

  // Optimize touch interactions for mobile
  useEffect(() => {
    if (isMobile) {
      // Add touch-action CSS for better scrolling
      document.documentElement.style.setProperty(
        "--touch-action",
        "pan-y pinch-zoom"
      );
      
      // Optimize viewport for mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        );
      }
    }
  }, [isMobile]);

  // Add mobile-specific event listeners
  useEffect(() => {
    if (isMobile) {
      // Prevent double-tap zoom on buttons
      const buttons = document.querySelectorAll("button");
      buttons.forEach((button) => {
        button.addEventListener("touchstart", (e) => {
          e.preventDefault();
        }, { passive: false });
      });

      // Add swipe gestures for sidebar
      let startX = 0;
      let startY = 0;

      const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!startX || !startY) return;

        const diffX = startX - e.touches[0].clientX;
        const diffY = startY - e.touches[0].clientY;

        // If horizontal swipe is greater than vertical swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
          // Prevent default only for horizontal swipes
          if (Math.abs(diffX) > 10) {
            e.preventDefault();
          }
        }
      };

      document.addEventListener("touchstart", handleTouchStart, { passive: true });
      document.addEventListener("touchmove", handleTouchMove, { passive: false });

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [isMobile]);

  // Add mobile-specific CSS variables
  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.setProperty("--mobile-padding", "1rem");
      document.documentElement.style.setProperty("--mobile-font-size", "0.875rem");
      document.documentElement.style.setProperty("--mobile-line-height", "1.5");
    } else {
      document.documentElement.style.setProperty("--mobile-padding", "1.5rem");
      document.documentElement.style.setProperty("--mobile-font-size", "1rem");
      document.documentElement.style.setProperty("--mobile-line-height", "1.6");
    }
  }, [isMobile]);

  // This component doesn't render anything visible
  return null;
}

// Hook for mobile detection
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isTablet };
}

// Utility component for responsive rendering
export function ResponsiveRender({
  mobile,
  tablet,
  desktop,
  children,
}: {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { isMobile, isTablet } = useMobileDetection();

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (desktop && !isMobile && !isTablet) return <>{desktop}</>;
  
  return <>{children}</>;
}
