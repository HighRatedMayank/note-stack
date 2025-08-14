"use client";

import { ChevronRight, Home, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard', icon: Home }
    ];

    if (segments.length === 0) return breadcrumbs;

    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      if (segment === 'editor' && segments[index + 1]) {
        // Skip the 'editor' segment, show the page ID as "Current Page"
        return;
      }
      
      if (segment === 'dashboard') {
        breadcrumbs.push({
          label: 'Dashboard',
          href: currentPath,
          icon: Home
        });
      } else if (segment === 'editor') {
        breadcrumbs.push({
          label: 'Editor',
          href: currentPath,
          icon: FileText
        });
      } else if (segments[index - 1] === 'editor') {
        // This is a page ID, show as "Current Page"
        breadcrumbs.push({
          label: 'Current Page',
          href: currentPath,
          icon: FileText
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
      {breadcrumbs.map((breadcrumb, index) => {
        const Icon = breadcrumb.icon;
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={breadcrumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={16} className="mx-2 text-gray-300 dark:text-gray-600" />
            )}
            
            {isLast ? (
              <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
                {Icon && <Icon size={16} />}
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                {Icon && <Icon size={16} />}
                {breadcrumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Simple breadcrumbs for specific use cases
export function SimpleBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={16} className="mx-2 text-gray-300 dark:text-gray-600" />
            )}
            
            {isLast ? (
              <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
                {Icon && <Icon size={16} />}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
