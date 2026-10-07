import { Toaster as SonnerToaster } from "sonner"
import { usesNativeNotifications, areOsNotificationsEnabled } from "@/services/localNotifications"

export function Toaster() {
  // On iOS/Android, alerts use system notifications (with sound) — hide in-app toasts.
  if (usesNativeNotifications() && areOsNotificationsEnabled()) {
    return null
  }

  return (
    <SonnerToaster 
      position="top-center"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '14px',
        },
      }}
    />
  )
}