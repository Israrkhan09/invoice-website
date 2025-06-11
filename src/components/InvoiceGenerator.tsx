import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Mail, Calculator, User, Clock, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';

interface InvoiceData {
  clientName: string;
  serviceDescription: string;
  totalHours: number;
  hourlyRate: number;
  userName: string;
  userEmail: string;
}

const InvoiceGenerator: React.FC = () => {
  const [formData, setFormData] = useState<InvoiceData>({
    clientName: '',
    serviceDescription: '',
    totalHours: 0,
    hourlyRate: 0,
    userName: '',
    userEmail: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof InvoiceData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.clientName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the client's name",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.serviceDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a service description",
        variant: "destructive"
      });
      return false;
    }
    if (formData.totalHours <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid total hours",
        variant: "destructive"
      });
      return false;
    }
    if (formData.hourlyRate <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid hourly rate",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.userName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.userEmail.trim() || !formData.userEmail.includes('@')) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const generatePDF = (): string => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const total = formData.totalHours * formData.hourlyRate;
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.text('INVOICE', pageWidth / 2, 30, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Invoice #: INV-${Date.now()}`, 20, 60);
    
    // From section
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('From:', 20, 80);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(formData.userName, 20, 90);
    doc.text(formData.userEmail, 20, 100);
    
    // To section
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('To:', 20, 120);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(formData.clientName, 20, 130);
    
    // Service details
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Service Description:', 20, 160);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const splitDescription = doc.splitTextToSize(formData.serviceDescription, pageWidth - 40);
    doc.text(splitDescription, 20, 170);
    
    // Invoice table
    const tableStartY = 200;
    doc.setFontSize(12);
    doc.setFillColor(59, 130, 246);
    doc.rect(20, tableStartY, pageWidth - 40, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Description', 25, tableStartY + 7);
    doc.text('Hours', 100, tableStartY + 7);
    doc.text('Rate', 130, tableStartY + 7);
    doc.text('Total', 160, tableStartY + 7);
    
    doc.setTextColor(0, 0, 0);
    doc.text('Professional Services', 25, tableStartY + 20);
    doc.text(formData.totalHours.toString(), 100, tableStartY + 20);
    doc.text(`$${formData.hourlyRate.toFixed(2)}`, 130, tableStartY + 20);
    doc.text(`$${total.toFixed(2)}`, 160, tableStartY + 20);
    
    // Total section
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text(`Total Amount: $${total.toFixed(2)}`, pageWidth - 80, tableStartY + 40, { align: 'right' });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', pageWidth / 2, 270, { align: 'center' });
    
    return doc.output('datauristring');
  };

  const handleGenerateAndSend = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    setIsSending(true);
    
    try {
      console.log('Generating PDF invoice...');
      const pdfData = generatePDF();
      const pdfBase64 = pdfData.split(',')[1];
      
      console.log('Sending email with invoice...');
      const { error } = await window.ezsite.apis.sendEmail({
        from: 'support@ezsite.ai',
        to: [formData.userEmail],
        subject: `Invoice for ${formData.clientName} - ${new Date().toLocaleDateString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Your Invoice is Ready!</h2>
            <p>Dear ${formData.userName},</p>
            <p>Your professional invoice has been generated successfully. Please find the PDF invoice attached to this email.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Invoice Summary:</h3>
              <p><strong>Client:</strong> ${formData.clientName}</p>
              <p><strong>Service:</strong> ${formData.serviceDescription}</p>
              <p><strong>Hours:</strong> ${formData.totalHours}</p>
              <p><strong>Rate:</strong> $${formData.hourlyRate.toFixed(2)}/hour</p>
              <p><strong>Total:</strong> $${(formData.totalHours * formData.hourlyRate).toFixed(2)}</p>
            </div>
            <p>Thank you for using our invoice generator!</p>
            <p>Best regards,<br>The Invoice Generator Team</p>
          </div>
        `,
        attachments: [{
          filename: `invoice-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
          content: pdfBase64,
          type: 'application/pdf',
          disposition: 'attachment'
        }]
      });
      
      if (error) {
        throw new Error(error);
      }
      
      toast({
        title: "Success!",
        description: "Your invoice has been generated and sent to your email.",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        clientName: '',
        serviceDescription: '',
        totalHours: 0,
        hourlyRate: 0,
        userName: '',
        userEmail: ''
      });
      
    } catch (error) {
      console.error('Error generating or sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate or send the invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setIsSending(false);
    }
  };

  const total = formData.totalHours * formData.hourlyRate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
              <FileText size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Invoice Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional invoices instantly. Enter your details below and receive a beautifully designed PDF invoice in your inbox.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="text-blue-500" size={24} />
                Invoice Details
              </CardTitle>
              <CardDescription>
                Fill in the details below to generate your professional invoice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <User className="text-blue-500" size={18} />
                  Client Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client's name"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">Service Description</Label>
                  <Textarea
                    id="serviceDescription"
                    placeholder="Describe the services provided"
                    value={formData.serviceDescription}
                    onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="text-blue-500" size={18} />
                  Service Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalHours">Total Hours</Label>
                    <Input
                      id="totalHours"
                      type="number"
                      placeholder="0"
                      value={formData.totalHours || ''}
                      onChange={(e) => handleInputChange('totalHours', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="0.00"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Your Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="text-blue-500" size={18} />
                  Your Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    placeholder="Enter your name"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Your Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.userEmail}
                    onChange={(e) => handleInputChange('userEmail', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="text-green-500" size={24} />
                Invoice Preview
              </CardTitle>
              <CardDescription>
                Preview your invoice before generating the PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
                    <p className="text-sm text-gray-600">
                      Date: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-blue-600">From:</p>
                      <p>{formData.userName || 'Your Name'}</p>
                      <p>{formData.userEmail || 'your.email@example.com'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-600">To:</p>
                      <p>{formData.clientName || 'Client Name'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-blue-600 mb-2">Service:</p>
                    <p className="text-sm text-gray-700">
                      {formData.serviceDescription || 'Service description will appear here'}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-700 mb-2">
                      <span>Hours</span>
                      <span>Rate</span>
                      <span>Total</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <span>{formData.totalHours || 0}</span>
                      <span>${formData.hourlyRate?.toFixed(2) || '0.00'}</span>
                      <span className="font-bold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      Total: ${total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleGenerateAndSend}
                disabled={isGenerating || isSending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                size="lg"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Invoice...
                  </div>
                ) : isSending ? (
                  <div className="flex items-center gap-2">
                    <Mail size={18} />
                    Sending to Email...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText size={18} />
                    Generate & Send Invoice
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                The invoice PDF will be sent to your email address
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;