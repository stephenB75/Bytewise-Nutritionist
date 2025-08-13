import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, RefreshCw, CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function IconDebug() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const clearSafariCache = () => {
    toast({
      title: "Safari Cache Clear Instructions",
      description: "Go to Settings → Safari → Clear History and Website Data",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-6 h-6" />
            iOS Icon Debug & Fix
          </CardTitle>
          <CardDescription>
            Troubleshooting the "Add to Home Screen" icon issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Issue Identified
            </h3>
            <p className="text-sm">
              iOS is showing a generic "B" icon instead of the ByteWise logo when adding to home screen.
            </p>
          </div>

          {/* Icon Files Status */}
          <div className="space-y-3">
            <h3 className="font-semibold">Icon Files Created:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">/apple-touch-icon.png (180x180)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">All size variations (60px to 192px)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">HTML meta tags updated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Service worker cache version bumped</span>
              </div>
            </div>
          </div>

          {/* Direct Icon Test */}
          <div className="space-y-3">
            <h3 className="font-semibold">Test Direct Icon Access:</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('/apple-touch-icon.png', '_blank')}
              >
                Open Main Icon (Should show ByteWise logo)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => copyToClipboard(window.location.origin + '/apple-touch-icon.png')}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Icon URL
              </Button>
            </div>
          </div>

          {/* Fix Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold">How to Fix on Your iPhone:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open Settings → Safari</li>
              <li>Tap "Clear History and Website Data"</li>
              <li>Confirm the action</li>
              <li>Open Safari and go to {window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.hostname}</li>
              <li>Tap the Share button (square with arrow)</li>
              <li>Select "Add to Home Screen"</li>
              <li>The ByteWise logo should now appear!</li>
            </ol>
            <Button onClick={clearSafariCache} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Show Clear Cache Instructions
            </Button>
          </div>

          {/* Alternative Solution */}
          <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold">Alternative Method:</h3>
            <p className="text-sm">
              If clearing cache doesn't work, try removing any existing home screen icon first:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Long press the ByteWise icon on home screen</li>
              <li>Tap "Remove Bookmark" or the X button</li>
              <li>Clear Safari cache as above</li>
              <li>Re-add to home screen</li>
            </ol>
          </div>

          {/* Technical Details */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Cache Version: v1.5.0</p>
            <p>Icon Format: PNG with white background</p>
            <p>Icon Path: /apple-touch-icon.png</p>
            <p>Last Updated: {new Date().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}