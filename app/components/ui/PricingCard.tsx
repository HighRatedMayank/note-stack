import React from "react";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  onCtaClick: () => void;
  className?: string;
}

export default function PricingCard({
  title,
  price,
  period,
  description,
  features,
  popular = false,
  ctaText,
  onCtaClick,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl",
        popular
          ? "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 scale-105"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        className
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <Star size={16} />
            Most Popular
          </div>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
        
        <div className="mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {price}
          </span>
          <span className="text-gray-600 dark:text-gray-400 ml-2">
            /{period}
          </span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
              <Check size={12} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={onCtaClick}
        variant={popular ? "primary" : "outline"}
        size="lg"
        className="w-full"
      >
        {ctaText}
      </Button>
    </div>
  );
}

