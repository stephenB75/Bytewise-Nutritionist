import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SaveAccountPromptProps {
  isOpen: boolean;
  onCreateAccount: () => void;
  onKeepLocal: () => void;
}

export function SaveAccountPrompt({ isOpen, onCreateAccount, onKeepLocal }: SaveAccountPromptProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onKeepLocal(); }}>
      <DialogContent className="max-w-md bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <DialogHeader>
          <DialogTitle
            className="text-2xl text-gray-950"
            style={{ fontFamily: "'League Spartan', sans-serif" }}
          >
            Create an account to save
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          <p className="text-sm text-gray-800 leading-relaxed">
            Your meal is on this device. Create an account to keep it after you leave or switch phones.
          </p>
          <div className="space-y-2">
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11"
              onClick={onCreateAccount}
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 border-amber-300"
              onClick={onKeepLocal}
            >
              Keep on this device
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
