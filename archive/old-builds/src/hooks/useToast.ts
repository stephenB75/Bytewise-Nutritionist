import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
    duration = 3000,
    action,
  }: ToastProps) => {
    const message = description || title || '';
    
    if (variant === "destructive") {
      sonnerToast.error(message, {
        duration,
        action: action ? {
          label: action.label,
          onClick: action.onClick,
        } : undefined,
      });
    } else {
      sonnerToast(message, {
        duration,
        action: action ? {
          label: action.label,
          onClick: action.onClick,
        } : undefined,
      });
    }
  };

  return { toast };
};