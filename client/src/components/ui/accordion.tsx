/**
 * Accordion Components
 * Reusable accordion components
 */

import React, { useState } from 'react';

export interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ type = 'single', collapsible = true, children, className = '' }: AccordionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className = '' }: AccordionItemProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className = '', ...props }: AccordionTriggerProps) {
  return (
    <button
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className = '' }: AccordionContentProps) {
  return (
    <div className={`overflow-hidden text-sm transition-all ${className}`}>
      <div className="pb-4 pt-0">
        {children}
      </div>
    </div>
  );
}
