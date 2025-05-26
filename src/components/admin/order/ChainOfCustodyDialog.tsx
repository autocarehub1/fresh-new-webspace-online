import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { DeliveryRequest } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, AlertCircle, PlusCircle, CheckCircle2, Calendar, Clock, User, FileText } from 'lucide-react';

interface ChainOfCustodyRecord {
  id: string;
  created_at: string;
  request_id: string;
  action: string;
  timestamp: string;
  user_name: string;
  location: string;
  notes: string;
  temperature?: string;
  condition?: string;
}

interface ChainOfCustodyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: DeliveryRequest;
}

const ChainOfCustodyDialog = ({ open, onOpenChange, request }: ChainOfCustodyDialogProps) => {
  const [custodyRecords, setCustodyRecords] = useState<ChainOfCustodyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newRecord, setNewRecord] = useState({
    action: 'Handoff',
    user_name: '',
    location: '',
    notes: '',
    temperature: '',
    condition: 'Good',
  });
  
  useEffect(() => {
    if (open && request) {
      loadCustodyRecords();
    }
  }, [open, request]);
  
  const loadCustodyRecords = async () => {
    try {
      setIsLoading(true);
      
      // Check if the custody_records table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('custody_records')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.message.includes('does not exist')) {
        // Create the table if it doesn't exist
        await createCustodyRecordsTable();
      }
      
      // Load records
      const { data, error } = await supabase
        .from('custody_records')
        .select('*')
        .eq('request_id', request.id)
        .order('timestamp', { ascending: false });
      
      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
      
      setCustodyRecords(data || []);
    } catch (error) {
      console.error('Error loading custody records:', error);
      toast.error('Failed to load custody records');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createCustodyRecordsTable = async () => {
    try {
      // We're using the Supabase client, so we can't create tables directly
      // Instead, we'll add a record to represent the schema during first use
      
      const initialRecord = {
        id: `cr-${Math.random().toString(36).substring(2, 10)}`,
        request_id: request.id,
        action: 'Initial Receipt',
        timestamp: new Date().toISOString(),
        user_name: 'System',
        location: request.pickup_location,
        notes: 'First custody record created automatically',
        condition: 'Good',
      };
      
      const { error } = await supabase
        .from('custody_records')
        .insert(initialRecord);
      
      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating custody records table:', error);
      return false;
    }
  };
  
  const handleRecordChange = (field: string, value: string) => {
    setNewRecord(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddRecord = async () => {
    if (!newRecord.action || !newRecord.user_name || !newRecord.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const recordData = {
        id: `cr-${Math.random().toString(36).substring(2, 10)}`,
        request_id: request.id,
        action: newRecord.action,
        timestamp: new Date().toISOString(),
        user_name: newRecord.user_name,
        location: newRecord.location,
        notes: newRecord.notes,
        temperature: newRecord.temperature,
        condition: newRecord.condition,
      };
      
      const { data, error } = await supabase
        .from('custody_records')
        .insert(recordData)
        .select();
      
      if (error) {
        throw error;
      }
      
      setCustodyRecords(prev => [data[0], ...prev]);
      setIsAddingRecord(false);
      setNewRecord({
        action: 'Handoff',
        user_name: '',
        location: '',
        notes: '',
        temperature: '',
        condition: 'Good',
      });
      
      toast.success('Custody record added successfully');
    } catch (error) {
      console.error('Error adding custody record:', error);
      toast.error('Failed to add custody record');
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Chain of Custody - {request.trackingId}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sample Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 pt-0">
                <div>
                  <p className="text-sm font-medium">Type:</p>
                  <p className="text-sm">{request.packageType || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority:</p>
                  <Badge variant={request.priority === 'urgent' ? 'destructive' : 'outline'}>
                    {request.priority || 'normal'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Pickup Location:</p>
                  <p className="text-sm">{request.pickup_location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Delivery Location:</p>
                  <p className="text-sm">{request.delivery_location}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Custody Records</h3>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsAddingRecord(true)}
                disabled={isAddingRecord}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
            
            {isAddingRecord && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">New Custody Record</CardTitle>
                  <CardDescription>Document transfer or inspection of the sample</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="action">Action Type*</Label>
                      <select
                        id="action"
                        className="w-full p-2 border rounded-md"
                        value={newRecord.action}
                        onChange={e => handleRecordChange('action', e.target.value)}
                        required
                      >
                        <option value="Handoff">Handoff/Transfer</option>
                        <option value="Inspection">Inspection</option>
                        <option value="Storage">Storage</option>
                        <option value="Testing">Testing</option>
                        <option value="Delivery">Final Delivery</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="condition">Sample Condition</Label>
                      <select
                        id="condition"
                        className="w-full p-2 border rounded-md"
                        value={newRecord.condition}
                        onChange={e => handleRecordChange('condition', e.target.value)}
                      >
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                        <option value="Compromised">Compromised</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user_name">Handler Name*</Label>
                      <Input
                        id="user_name"
                        value={newRecord.user_name}
                        onChange={e => handleRecordChange('user_name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature (if applicable)</Label>
                      <Input
                        id="temperature"
                        value={newRecord.temperature}
                        onChange={e => handleRecordChange('temperature', e.target.value)}
                        placeholder="e.g. 4°C"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location*</Label>
                    <Input
                      id="location"
                      value={newRecord.location}
                      onChange={e => handleRecordChange('location', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newRecord.notes}
                      onChange={e => handleRecordChange('notes', e.target.value)}
                      placeholder="Additional details about the sample transfer or condition"
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingRecord(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddRecord}
                    disabled={isSaving || !newRecord.user_name || !newRecord.location}
                  >
                    {isSaving ? 'Saving...' : 'Add Record'}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : custodyRecords.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Records Found</AlertTitle>
                <AlertDescription>
                  No chain of custody records exist for this sample yet. 
                  Add the first record to begin tracking.
                </AlertDescription>
              </Alert>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {custodyRecords.map((record, index) => (
                  <AccordionItem value={record.id} key={record.id} className="border rounded-md">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex justify-between w-full items-center">
                        <div className="flex items-center gap-2">
                          {record.action === 'Handoff' ? (
                            <User className="h-4 w-4 text-blue-500" />
                          ) : record.action === 'Inspection' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : record.action === 'Testing' ? (
                            <FileText className="h-4 w-4 text-purple-500" />
                          ) : record.action === 'Delivery' ? (
                            <ClipboardCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="font-medium">{record.action}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(record.timestamp)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-0">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-2">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-gray-500" />
                            Handler:
                          </p>
                          <p className="text-sm">{record.user_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            Location:
                          </p>
                          <p className="text-sm">{record.location}</p>
                        </div>
                        
                        {record.condition && (
                          <div>
                            <p className="text-sm font-medium">Condition:</p>
                            <Badge variant={
                              record.condition === 'Good' ? 'outline' :
                              record.condition === 'Fair' ? 'secondary' :
                              record.condition === 'Poor' ? 'destructive' : 
                              'destructive'
                            }>
                              {record.condition}
                            </Badge>
                          </div>
                        )}
                        
                        {record.temperature && (
                          <div>
                            <p className="text-sm font-medium">Temperature:</p>
                            <p className="text-sm">{record.temperature}</p>
                          </div>
                        )}
                        
                        {record.notes && (
                          <div className="col-span-2 mt-2">
                            <p className="text-sm font-medium flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-gray-500" />
                              Notes:
                            </p>
                            <p className="text-sm">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChainOfCustodyDialog; 