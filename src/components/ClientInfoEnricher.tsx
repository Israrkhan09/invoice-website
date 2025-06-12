import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Search, Check, Building, Mail, Phone, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientInfo {
  name: string;
  email: string;
  company?: string;
  title?: string;
  phone?: string;
  website?: string;
  address?: string;
  linkedin?: string;
  industry?: string;
  companySize?: string;
  enrichedData?: {
    recentNews?: string[];
    companyDescription?: string;
    keyPersons?: string[];
  };
}

interface ClientInfoEnricherProps {
  onClientInfoUpdate: (clientInfo: ClientInfo) => void;
}

const ClientInfoEnricher: React.FC<ClientInfoEnricherProps> = ({ onClientInfoUpdate }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [enrichedInfo, setEnrichedInfo] = useState<ClientInfo | null>(null);
  const { toast } = useToast();

  const enrichClientInfo = async () => {
    if (!clientName.trim() && !clientEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide either a client name or email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock enriched client data
    const mockEnrichedInfo: ClientInfo = {
      name: clientName || 'John Mitchell',
      email: clientEmail || 'john.mitchell@techcorp.com',
      company: 'TechCorp Solutions',
      title: 'Chief Technology Officer',
      phone: '+1 (555) 123-4567',
      website: 'https://techcorp.com',
      address: '123 Innovation Drive, San Francisco, CA 94105',
      linkedin: 'https://linkedin.com/in/johnmitchell',
      industry: 'Technology & Software',
      companySize: '150-500 employees',
      enrichedData: {
        recentNews: [
          'TechCorp Solutions announces $10M Series B funding',
          'Company expands to European market',
          'Named in top 50 fastest-growing tech companies'
        ],
        companyDescription: 'Leading provider of enterprise software solutions specializing in cloud infrastructure and data analytics.',
        keyPersons: [
          'Sarah Johnson - CEO',
          'John Mitchell - CTO', 
          'Mike Chen - VP of Sales'
        ]
      }
    };
    
    setEnrichedInfo(mockEnrichedInfo);
    setIsSearching(false);
    
    toast({
      title: "Client Info Found!",
      description: "Successfully enriched client information from public sources."
    });
  };

  const applyClientInfo = () => {
    if (!enrichedInfo) return;
    
    onClientInfoUpdate(enrichedInfo);
    toast({
      title: "Client Info Applied!",
      description: "Client information has been added to your invoice."
    });
  };

  const clearSearch = () => {
    setClientName('');
    setClientEmail('');
    setEnrichedInfo(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Client Info Enricher
        </CardTitle>
        <CardDescription>
          Enter client name or email to automatically pull business information and personalize invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              placeholder="Enter client name..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client-email">Client Email</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="Enter client email..."
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={enrichClientInfo}
            disabled={isSearching}
            className="flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isSearching ? 'Searching...' : 'Enrich Client Info'}
          </Button>
          
          <Button
            variant="outline"
            onClick={clearSearch}
            disabled={isSearching}
          >
            Clear
          </Button>
        </div>

        {/* Search Status */}
        {isSearching && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">AI is gathering client information...</p>
            <p className="text-sm text-gray-600">Searching LinkedIn, company databases, and public records</p>
          </div>
        )}

        {/* Enriched Information Display */}
        {enrichedInfo && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Enriched Client Information</Label>
              <Button
                onClick={applyClientInfo}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Apply to Invoice
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Name</Label>
                    <p className="font-medium">{enrichedInfo.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {enrichedInfo.email}
                    </p>
                  </div>
                  {enrichedInfo.phone && (
                    <div>
                      <Label className="text-sm text-gray-600">Phone</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {enrichedInfo.phone}
                      </p>
                    </div>
                  )}
                  {enrichedInfo.address && (
                    <div>
                      <Label className="text-sm text-gray-600">Address</Label>
                      <p className="font-medium">{enrichedInfo.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company Information
                </h4>
                <div className="space-y-3">
                  {enrichedInfo.company && (
                    <div>
                      <Label className="text-sm text-gray-600">Company</Label>
                      <p className="font-medium">{enrichedInfo.company}</p>
                    </div>
                  )}
                  {enrichedInfo.title && (
                    <div>
                      <Label className="text-sm text-gray-600">Title</Label>
                      <p className="font-medium">{enrichedInfo.title}</p>
                    </div>
                  )}
                  {enrichedInfo.industry && (
                    <div>
                      <Label className="text-sm text-gray-600">Industry</Label>
                      <Badge variant="outline">{enrichedInfo.industry}</Badge>
                    </div>
                  )}
                  {enrichedInfo.companySize && (
                    <div>
                      <Label className="text-sm text-gray-600">Company Size</Label>
                      <Badge variant="secondary">{enrichedInfo.companySize}</Badge>
                    </div>
                  )}
                  {enrichedInfo.website && (
                    <div>
                      <Label className="text-sm text-gray-600">Website</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a href={enrichedInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {enrichedInfo.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enriched Data */}
            {enrichedInfo.enrichedData && (
              <div className="space-y-4">
                <Separator />
                <h4 className="font-semibold text-lg">AI-Enriched Insights</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Description */}
                  {enrichedInfo.enrichedData.companyDescription && (
                    <div className="space-y-2">
                      <Label className="font-medium">Company Overview</Label>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {enrichedInfo.enrichedData.companyDescription}
                      </p>
                    </div>
                  )}

                  {/* Key Persons */}
                  {enrichedInfo.enrichedData.keyPersons && (
                    <div className="space-y-2">
                      <Label className="font-medium">Key Personnel</Label>
                      <div className="space-y-1">
                        {enrichedInfo.enrichedData.keyPersons.map((person, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-1">
                            {person}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent News */}
                {enrichedInfo.enrichedData.recentNews && (
                  <div className="space-y-2">
                    <Label className="font-medium">Recent Company News</Label>
                    <div className="space-y-2">
                      {enrichedInfo.enrichedData.recentNews.map((news, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{news}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientInfoEnricher;