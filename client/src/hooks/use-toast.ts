// Temporary placeholder to prevent import errors
export function useToast() {
  return {
    toasts: [],
    toast: () => {},
    dismiss: () => {}
  };
}

export function toast() {
  return {
    id: '',
    dismiss: () => {},
    update: () => {}
  };
}