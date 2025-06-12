import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Palette, Upload, Wand2, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  preview: string;
}

interface AIBrandingThemesProps {
  onApplyTheme: (theme: BrandTheme) => void;
}

const AIBrandingThemes: React.FC<AIBrandingThemesProps> = ({ onApplyTheme }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandDescription, setBrandDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [generatedThemes, setGeneratedThemes] = useState<BrandTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('image')) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file for your logo.",
          variant: "destructive"
        });
        return;
      }
      setLogoFile(file);
    }
  }, [toast]);

  const generateThemes = async () => {
    if (!brandDescription.trim() && !logoFile) {
      toast({
        title: "Missing Information",
        description: "Please provide a brand description or upload a logo.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Mock AI-generated themes
    const mockThemes: BrandTheme[] = [
      {
        id: '1',
        name: 'Professional Blue',
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#f59e0b'
        },
        fonts: {
          heading: 'Inter',
          body: 'Open Sans'
        },
        preview: 'Modern and trustworthy with clean lines'
      },
      {
        id: '2',
        name: 'Creative Gradient',
        colors: {
          primary: '#7c3aed',
          secondary: '#ec4899',
          accent: '#06b6d4'
        },
        fonts: {
          heading: 'Poppins',
          body: 'Roboto'
        },
        preview: 'Bold and innovative with gradient accents'
      },
      {
        id: '3',
        name: 'Elegant Minimal',
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          accent: '#10b981'
        },
        fonts: {
          heading: 'Playfair Display',
          body: 'Source Sans Pro'
        },
        preview: 'Sophisticated and minimal design approach'
      },
      {
        id: '4',
        name: 'Tech Forward',
        colors: {
          primary: '#0ea5e9',
          secondary: '#334155',
          accent: '#f97316'
        },
        fonts: {
          heading: 'JetBrains Mono',
          body: 'Inter'
        },
        preview: 'Tech-savvy with modern typography'
      }
    ];
    
    setGeneratedThemes(mockThemes);
    setIsGenerating(false);
    
    toast({
      title: "Themes Generated!",
      description: `Created ${mockThemes.length} custom themes based on your brand.`
    });
  };

  const applyTheme = (theme: BrandTheme) => {
    setSelectedTheme(theme.id);
    onApplyTheme(theme);
    toast({
      title: "Theme Applied!",
      description: `Your invoice template now uses the "${theme.name}" theme.`
    });
  };

  const downloadTheme = (theme: BrandTheme) => {
    const themeData = {
      ...theme,
      generatedAt: new Date().toISOString(),
      brandDescription,
      logoIncluded: !!logoFile
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Theme Downloaded!",
      description: "Theme configuration saved to your device."
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          AI-Powered Branding Themes
        </CardTitle>
        <CardDescription>
          Upload your logo or describe your brand style to generate matching invoice templates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Brand Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="brand-description">Brand Description</Label>
            <Textarea
              id="brand-description"
              placeholder="Describe your brand style... (e.g., 'Modern tech startup with clean, minimalist design' or 'Creative agency with bold, colorful branding')"
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              className="h-32"
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="logo-upload">Upload Logo (Optional)</Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />
            {logoFile && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Logo uploaded: {logoFile.name}
                </p>
              </div>
            )}
            
            <Button
              onClick={generateThemes}
              disabled={isGenerating}
              className="w-full flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating Themes...' : 'Generate AI Themes'}
            </Button>
          </div>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">AI is creating your custom themes...</p>
            <p className="text-sm text-gray-600">Analyzing your brand style and generating designs</p>
          </div>
        )}

        {/* Generated Themes */}
        {generatedThemes.length > 0 && (
          <div className="space-y-4">
            <Label>Generated Themes ({generatedThemes.length})</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedTheme === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{theme.name}</h4>
                      <div className="flex gap-1">
                        {Object.values(theme.colors).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">{theme.preview}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {theme.fonts.heading}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {theme.fonts.body}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => applyTheme(theme)}
                        className="flex-1"
                      >
                        Apply Theme
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadTheme(theme)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIBrandingThemes;