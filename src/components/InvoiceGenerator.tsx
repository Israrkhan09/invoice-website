import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Plus, Trash2, Bot, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';

// Import AI components
import ExpenseReceiptMatcher from '@/components/ExpenseReceiptMatcher';
import AIBrandingThemes from '@/components/AIBrandingThemes';
import ClientInfoEnricher from '@/components/ClientInfoEnricher';
import DisputeResolverBot from '@/components/DisputeResolverBot';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ClientInfo {
  name: string;
  email: string;
  company?: string;
  address?: string;
  phone?: string;
}

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
}

const InvoiceGenerator: React.FC = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    email: '',
    company: '',
    address: '',
    phone: ''
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [appliedTheme, setAppliedTheme] = useState<BrandTheme | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleExpenseItemsAdd = (expenseItems: any[]) => {
    const newItems = expenseItems.map(expense => ({
      id: Date.now().toString() + Math.random(),
      description: expense.description,
      quantity: 1,
      rate: expense.amount,
      amount: expense.amount
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const handleClientInfoUpdate = (info: ClientInfo) => {
    setClientInfo(info);
  };

  const handleThemeApply = (theme: BrandTheme) => {
    setAppliedTheme(theme);
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--invoice-primary', theme.colors.primary);
      document.documentElement.style.setProperty('--invoice-secondary', theme.colors.secondary);
      document.documentElement.style.setProperty('--invoice-accent', theme.colors.accent);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Set colors based on applied theme
    const primaryColor = appliedTheme?.colors.primary || '#2563eb';
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text('INVOICE', 20, 30);
    
    // Invoice details
    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.text(`Invoice #: ${invoiceNumber}`, 20, 50);
    doc.text(`Date: ${invoiceDate}`, 20, 60);
    doc.text(`Due Date: ${dueDate}`, 20, 70);
    
    // Client info
    doc.text('Bill To:', 120, 50);
    doc.text(clientInfo.name, 120, 60);
    if (clientInfo.company) doc.text(clientInfo.company, 120, 70);
    if (clientInfo.email) doc.text(clientInfo.email, 120, 80);
    
    // Items table
    let yPosition = 100;
    doc.text('Description', 20, yPosition);
    doc.text('Qty', 120, yPosition);
    doc.text('Rate', 140, yPosition);
    doc.text('Amount', 170, yPosition);
    
    yPosition += 10;
    items.forEach(item => {
      doc.text(item.description, 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`$${item.rate.toFixed(2)}`, 140, yPosition);
      doc.text(`$${item.amount.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    // Totals
    yPosition += 10;
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, yPosition);
    doc.text(`Tax: $${tax.toFixed(2)}`, 140, yPosition + 10);
    doc.setFontSize(14);
    doc.text(`Total: $${total.toFixed(2)}`, 140, yPosition + 20);
    
    if (notes) {
      doc.setFontSize(10);
      doc.text('Notes:', 20, yPosition + 30);
      doc.text(notes, 20, yPosition + 40);
    }
    
    doc.save(`invoice-${invoiceNumber}.pdf`);
    
    toast({
      title: "PDF Generated!",
      description: "Your invoice has been downloaded successfully."
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Invoice Generator
        </h1>
        <p className="text-lg text-gray-600">
          Enhanced with intelligent features to streamline your billing process
        </p>
        {appliedTheme && (
          <Badge variant="outline" className="mt-2">
            <Sparkles className="h-3 w-3 mr-1" />
            Using "{appliedTheme.name}" theme
          </Badge>
        )}
      </div>

      <Tabs defaultValue="invoice" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="expenses">
            <Bot className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Bot className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Bot className="h-4 w-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="disputes">
            <Bot className="h-4 w-4 mr-2" />
            Disputes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
                <CardDescription>
                  Fill in your invoice information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-number">Invoice Number</Label>
                    <Input
                      id="invoice-number"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice-date">Invoice Date</Label>
                    <Input
                      id="invoice-date"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Client Information */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Client Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Client Name</Label>
                      <Input
                        id="client-name"
                        value={clientInfo.name}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-company">Company</Label>
                      <Input
                        id="client-company"
                        value={clientInfo.company || ''}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Phone</Label>
                      <Input
                        id="client-phone"
                        value={clientInfo.phone || ''}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-address">Address</Label>
                    <Textarea
                      id="client-address"
                      value={clientInfo.address || ''}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Invoice Items</Label>
                    <Button size="sm" onClick={addItem} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Label className="text-sm">Description</Label>
                          <Input
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm">Rate</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm">Amount</Label>
                          <Input
                            value={`$${item.amount.toFixed(2)}`}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or terms..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Preview</CardTitle>
                <CardDescription>
                  Preview of your invoice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  ref={invoiceRef} 
                  className="p-6 bg-white border rounded-lg space-y-6"
                  style={{
                    color: appliedTheme?.colors.secondary || '#1f2937',
                    fontFamily: appliedTheme?.fonts.body || 'inherit'
                  }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 
                        className="text-3xl font-bold"
                        style={{
                          color: appliedTheme?.colors.primary || '#2563eb',
                          fontFamily: appliedTheme?.fonts.heading || 'inherit'
                        }}
                      >
                        INVOICE
                      </h2>
                      <p className="text-sm text-gray-600">#{invoiceNumber}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p><strong>Date:</strong> {invoiceDate}</p>
                      <p><strong>Due:</strong> {dueDate}</p>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: appliedTheme?.colors.primary || '#2563eb' }}>
                      Bill To:
                    </h3>
                    <div className="text-sm">
                      <p className="font-medium">{clientInfo.name}</p>
                      {clientInfo.company && <p>{clientInfo.company}</p>}
                      {clientInfo.email && <p>{clientInfo.email}</p>}
                      {clientInfo.phone && <p>{clientInfo.phone}</p>}
                      {clientInfo.address && <p className="whitespace-pre-line">{clientInfo.address}</p>}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: appliedTheme?.colors.accent || '#f59e0b' }}>
                          <th className="text-left py-2">Description</th>
                          <th className="text-center py-2">Qty</th>
                          <th className="text-right py-2">Rate</th>
                          <th className="text-right py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-2">{item.description}</td>
                            <td className="text-center py-2">{item.quantity}</td>
                            <td className="text-right py-2">${item.rate.toFixed(2)}</td>
                            <td className="text-right py-2">${item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg" style={{ color: appliedTheme?.colors.primary || '#2563eb' }}>
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {notes && (
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: appliedTheme?.colors.primary || '#2563eb' }}>
                        Notes:
                      </h3>
                      <p className="text-sm whitespace-pre-line">{notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Button onClick={generatePDF} className="w-full flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseReceiptMatcher onAddToInvoice={handleExpenseItemsAdd} />
        </TabsContent>

        <TabsContent value="branding">
          <AIBrandingThemes onApplyTheme={handleThemeApply} />
        </TabsContent>

        <TabsContent value="clients">
          <ClientInfoEnricher onClientInfoUpdate={handleClientInfoUpdate} />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputeResolverBot 
            invoiceContext={{
              invoiceNumber,
              clientName: clientInfo.name,
              amount: total,
              daysOverdue: 0,
              previousContacts: 0
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceGenerator;