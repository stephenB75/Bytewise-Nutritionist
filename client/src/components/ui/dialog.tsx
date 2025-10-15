/**
 * Dialog Components
 * Reusable dialog components
 */

import React from 'react';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function DialogContent({ className = '', ...props }: DialogContentProps) {
  return (
    <div
      className={`relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-6 ${className}`}
      {...props}
    />
  );
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function DialogHeader({ className = '', ...props }: DialogHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />
  );
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export function DialogTitle({ className = '', ...props }: DialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
  );
}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export function DialogDescription({ className = '', ...props }: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props} />
  );
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DialogTrigger({ asChild, children, ...props }: DialogTriggerProps) {
  if (asChild) {
    return <>{children}</>;
  }
  
  return (
    <button {...props}>
      {children}
    </button>
  );
}
