import { useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Link, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QRGenerator = () => {
  const [url, setUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      // Try with https:// prefix if no protocol specified
      try {
        new URL(`https://${string}`);
        return true;
      } catch (_) {
        return false;
      }
    }
  };

  const formatUrl = (input: string) => {
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      return `https://${input}`;
    }
    return input;
  };

  const generateQRCode = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to generate QR code.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., google.com or https://google.com).",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const formattedUrl = formatUrl(url);
      const qrDataUrl = await QRCode.toDataURL(formattedUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeUrl(qrDataUrl);
      toast({
        title: "QR Code Generated",
        description: "Your QR code is ready to download!",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: "QR code saved as PNG image.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generateQRCode();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            QR Generator
          </h1>
          <p className="text-muted-foreground">
            Generate QR codes for any URL instantly
          </p>
        </div>

        {/* Generator Card */}
        <Card className="qr-generator-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Enter URL
            </CardTitle>
            <CardDescription>
              Enter any website URL to generate a QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="text"
                placeholder="https://example.com or example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="transition-smooth"
              />
            </div>
            
            <Button 
              onClick={generateQRCode}
              disabled={isGenerating || !url.trim()}
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Output */}
        {qrCodeUrl && (
          <Card className="qr-output">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <img 
                  src={qrCodeUrl} 
                  alt="Generated QR Code" 
                  className="rounded-lg shadow-soft max-w-full h-auto"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  QR Code for: <span className="font-medium text-foreground">{formatUrl(url)}</span>
                </p>
                
                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  className="w-full transition-smooth hover:bg-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;