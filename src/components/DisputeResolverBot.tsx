import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, Copy, Loader2, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DisputeContext {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  daysOverdue: number;
  previousContacts: number;
  disputeReason?: string;
}

interface GeneratedMessage {
  id: string;
  type: 'reminder' | 'dispute' | 'final-notice';
  tone: 'professional' | 'firm' | 'friendly';
  subject: string;
  content: string;
  followUpDays: number;
}

interface DisputeResolverBotProps {
  invoiceContext?: DisputeContext;
}

const DisputeResolverBot: React.FC<DisputeResolverBotProps> = ({ invoiceContext }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [context, setContext] = useState<DisputeContext>(
    invoiceContext || {
      invoiceNumber: '',
      clientName: '',
      amount: 0,
      daysOverdue: 0,
      previousContacts: 0
    }
  );
  const [messageType, setMessageType] = useState<'reminder' | 'dispute' | 'final-notice'>('reminder');
  const [tone, setTone] = useState<'professional' | 'firm' | 'friendly'>('professional');
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const updateContext = (field: keyof DisputeContext, value: string | number) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  const generateMessages = async () => {
    if (!context.invoiceNumber || !context.clientName || context.amount <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in invoice number, client name, and amount.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI-generated messages based on context
    const mockMessages: GeneratedMessage[] = [];
    
    if (messageType === 'reminder') {
      mockMessages.push({
        id: '1',
        type: 'reminder',
        tone: tone,
        subject: `Payment Reminder: Invoice ${context.invoiceNumber}`,
        content: `Dear ${context.clientName},\n\nI hope this email finds you well. I wanted to reach out regarding Invoice ${context.invoiceNumber} for $${context.amount.toFixed(2)}, which was due ${context.daysOverdue} days ago.\n\nI understand that sometimes invoices can slip through the cracks, so I wanted to send a friendly reminder. If you have already processed this payment, please disregard this message.\n\nIf you have any questions about this invoice or need to discuss payment arrangements, please don't hesitate to reach out. I'm here to help and ensure we can resolve this promptly.\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]`,
        followUpDays: 7
      });
      
      if (tone === 'firm') {
        mockMessages.push({
          id: '2',
          type: 'reminder',
          tone: 'firm',
          subject: `Urgent: Overdue Payment Required - Invoice ${context.invoiceNumber}`,
          content: `Dear ${context.clientName},\n\nThis is a formal notice regarding the overdue payment for Invoice ${context.invoiceNumber} in the amount of $${context.amount.toFixed(2)}. The payment is now ${context.daysOverdue} days past due.\n\nWe have attempted to contact you ${context.previousContacts} time(s) previously regarding this matter. Immediate payment is required to avoid further collection actions.\n\nPlease remit payment within 5 business days. If payment has already been sent, please provide proof of payment immediately.\n\nFailure to respond or make payment arrangements may result in additional collection fees and potential legal action.\n\nSincerely,\n[Your Name]\n[Company Name]`,
          followUpDays: 5
        });
      }
    } else if (messageType === 'dispute') {
      mockMessages.push({
        id: '3',
        type: 'dispute',
        tone: tone,
        subject: `Re: Dispute Resolution - Invoice ${context.invoiceNumber}`,
        content: `Dear ${context.clientName},\n\nThank you for bringing your concerns regarding Invoice ${context.invoiceNumber} to my attention. I understand your position and want to work together to resolve this matter satisfactorily.\n\n${context.disputeReason ? `I've reviewed your concern about: "${context.disputeReason}"\n\n` : ''}I have thoroughly reviewed the invoice details and supporting documentation. I believe there may be a misunderstanding, and I'd like to schedule a brief call to discuss the specifics and find a mutually agreeable solution.\n\nI'm committed to maintaining our positive business relationship and ensuring your satisfaction. Would you be available for a 15-minute call this week to discuss this further?\n\nI look forward to resolving this matter quickly and professionally.\n\nBest regards,\n[Your Name]`,
        followUpDays: 3
      });
    } else if (messageType === 'final-notice') {
      mockMessages.push({
        id: '4',
        type: 'final-notice',
        tone: 'firm',
        subject: `FINAL NOTICE: Invoice ${context.invoiceNumber} - Immediate Action Required`,
        content: `Dear ${context.clientName},\n\nThis is our FINAL NOTICE regarding the seriously overdue payment for Invoice ${context.invoiceNumber} in the amount of $${context.amount.toFixed(2)}.\n\nDespite our previous ${context.previousContacts} attempt(s) to collect this debt, the invoice remains unpaid after ${context.daysOverdue} days past due. This is unacceptable and jeopardizes our business relationship.\n\nYou have 48 HOURS to remit full payment or contact us with acceptable payment arrangements. Failure to respond will result in:\n\n• Transfer to our collections department\n• Additional collection fees and interest charges\n• Potential legal action to recover the full amount\n• Reporting to credit agencies\n• Termination of business relationship\n\nThis is your final opportunity to resolve this matter directly. Do not ignore this notice.\n\nImmediate action required.\n\n[Your Name]\n[Company Name]\n[Phone Number]`,
        followUpDays: 2
      });
    }
    
    setGeneratedMessages(mockMessages);
    setIsGenerating(false);
    
    toast({
      title: "Messages Generated!",
      description: `Created ${mockMessages.length} professional ${messageType} message(s).`
    });
  };

  const copyMessage = (message: GeneratedMessage) => {
    const fullMessage = `Subject: ${message.subject}\n\n${message.content}`;
    navigator.clipboard.writeText(fullMessage).then(() => {
      setSelectedMessage(message.id);
      toast({
        title: "Message Copied!",
        description: "The message has been copied to your clipboard."
      });
    });
  };

  const sendMessage = async (message: GeneratedMessage) => {
    // In a real implementation, this would integrate with email service
    toast({
      title: "Message Sent!",
      description: `${message.type} message sent to ${context.clientName}.`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Smart Dispute Resolver Bot
        </CardTitle>
        <CardDescription>
          AI drafts professional follow-ups for late or disputed payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Context Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              placeholder="INV-001"
              value={context.invoiceNumber}
              onChange={(e) => updateContext('invoiceNumber', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              placeholder="Client Name"
              value={context.clientName}
              onChange={(e) => updateContext('clientName', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={context.amount || ''}
              onChange={(e) => updateContext('amount', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="days-overdue">Days Overdue</Label>
            <Input
              id="days-overdue"
              type="number"
              placeholder="0"
              value={context.daysOverdue || ''}
              onChange={(e) => updateContext('daysOverdue', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="previous-contacts">Previous Contacts</Label>
            <Input
              id="previous-contacts"
              type="number"
              placeholder="0"
              value={context.previousContacts || ''}
              onChange={(e) => updateContext('previousContacts', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message-type">Message Type</Label>
            <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reminder">Payment Reminder</SelectItem>
                <SelectItem value="dispute">Dispute Resolution</SelectItem>
                <SelectItem value="final-notice">Final Notice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Context for Disputes */}
        {messageType === 'dispute' && (
          <div className="space-y-2">
            <Label htmlFor="dispute-reason">Dispute Reason (Optional)</Label>
            <Textarea
              id="dispute-reason"
              placeholder="Describe the client's dispute or concern..."
              value={context.disputeReason || ''}
              onChange={(e) => updateContext('disputeReason', e.target.value)}
            />
          </div>
        )}

        {/* Tone Selection */}
        <div className="flex items-center gap-4">
          <Label>Message Tone:</Label>
          <div className="flex gap-2">
            {['friendly', 'professional', 'firm'].map((toneOption) => (
              <Button
                key={toneOption}
                variant={tone === toneOption ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTone(toneOption as any)}
              >
                {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateMessages}
          disabled={isGenerating}
          className="w-full flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          {isGenerating ? 'Generating Messages...' : 'Generate AI Messages'}
        </Button>

        {/* Generation Status */}
        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">AI is crafting professional messages...</p>
            <p className="text-sm text-gray-600">Analyzing context and generating appropriate responses</p>
          </div>
        )}

        {/* Generated Messages */}
        {generatedMessages.length > 0 && (
          <div className="space-y-4">
            <Label className="text-lg">Generated Messages ({generatedMessages.length})</Label>
            
            <div className="space-y-4">
              {generatedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg ${
                    selectedMessage === message.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="capitalize">
                          {message.type.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {message.tone}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          Follow up in {message.followUpDays} days
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="font-medium">Subject:</Label>
                      <p className="font-semibold text-gray-800">{message.subject}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="font-medium">Message:</Label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                          {message.content}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => copyMessage(message)}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendMessage(message)}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send Email
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

export default DisputeResolverBot;