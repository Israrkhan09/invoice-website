import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  confidence: number;
}

interface ExpenseReceiptMatcherProps {
  onAddToInvoice: (items: ExpenseItem[]) => void;
}

const ExpenseReceiptMatcher: React.FC<ExpenseReceiptMatcherProps> = ({ onAddToInvoice }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedExpenses, setExtractedExpenses] = useState<ExpenseItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.includes('image') || file.type.includes('pdf')
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only image and PDF files are supported.",
        variant: "destructive"
      });
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  }, [toast]);

  const processReceipts = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload receipt files first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI-extracted expenses
    const mockExpenses: ExpenseItem[] = [
      {
        id: '1',
        description: 'Office Supplies - Printer Paper',
        amount: 24.99,
        category: 'Office Supplies',
        date: '2024-01-15',
        confidence: 0.95
      },
      {
        id: '2', 
        description: 'Business Lunch - Restaurant ABC',
        amount: 87.50,
        category: 'Meals & Entertainment',
        date: '2024-01-16',
        confidence: 0.88
      },
      {
        id: '3',
        description: 'Travel - Taxi Fare',
        amount: 15.30,
        category: 'Transportation',
        date: '2024-01-16',
        confidence: 0.92
      },
      {
        id: '4',
        description: 'Software License - Design Tool',
        amount: 199.00,
        category: 'Software',
        date: '2024-01-17',
        confidence: 0.97
      }
    ];
    
    setExtractedExpenses(mockExpenses);
    setIsProcessing(false);
    
    toast({
      title: "Processing Complete!",
      description: `Found ${mockExpenses.length} billable items from your receipts.`
    });
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const addSelectedToInvoice = () => {
    const selectedExpenses = extractedExpenses.filter(item => selectedItems.has(item.id));
    if (selectedExpenses.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to add to your invoice.",
        variant: "destructive"
      });
      return;
    }
    
    onAddToInvoice(selectedExpenses);
    toast({
      title: "Items Added!",
      description: `${selectedExpenses.length} items added to your invoice.`
    });
    
    // Reset state
    setSelectedItems(new Set());
    setExtractedExpenses([]);
    setUploadedFiles([]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Expense-to-Invoice Matcher
        </CardTitle>
        <CardDescription>
          Upload your receipts and let AI detect billable items automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <Label htmlFor="receipt-upload">Upload Receipts (Images/PDFs)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="receipt-upload"
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button
              onClick={processReceipts}
              disabled={isProcessing || uploadedFiles.length === 0}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Process Receipts'}
            </Button>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Files ({uploadedFiles.length})</Label>
            <div className="grid grid-cols-1 gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">AI is analyzing your receipts...</p>
            <p className="text-sm text-gray-600">This may take a few moments</p>
          </div>
        )}

        {/* Extracted Expenses */}
        {extractedExpenses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Detected Billable Items</Label>
              <Button
                onClick={addSelectedToInvoice}
                disabled={selectedItems.size === 0}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Add Selected to Invoice ({selectedItems.size})
              </Button>
            </div>
            
            <div className="space-y-3">
              {extractedExpenses.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedItems.has(item.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{item.description}</h4>
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge 
                          variant={item.confidence > 0.9 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {Math.round(item.confidence * 100)}% confident
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Date: {item.date}</span>
                        <span className="font-semibold text-green-600">
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {selectedItems.has(item.id) ? (
                        <Check className="h-5 w-5 text-blue-600" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded" />
                      )}
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

export default ExpenseReceiptMatcher;