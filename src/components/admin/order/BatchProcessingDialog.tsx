import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, CheckCircle2 } from 'lucide-react';

interface BatchProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BatchProcessingDialog = ({ open, onOpenChange, onSuccess }: BatchProcessingDialogProps) => {
  const [activeTab, setActiveTab] = useState('import');
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [status, setStatus] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState('status');
  const [filterValue, setFilterValue] = useState('pending');

  const handleCsvContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvContent(e.target.value);
    
    // Parse CSV preview
    if (e.target.value.trim()) {
      try {
        const lines = e.target.value.trim().split('\n');
        const headers = lines[0].split(',');
        
        if (lines.length > 1) {
          const previewData = lines.slice(1, Math.min(6, lines.length)).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] = values[index]?.trim() || '';
              return obj;
            }, {} as any);
          });
          
          setImportPreview(previewData);
          setImportErrors([]);
        } else {
          setImportPreview([]);
          setImportErrors(['No data rows found in CSV']);
        }
      } catch (error) {
        setImportPreview([]);
        setImportErrors(['Invalid CSV format']);
      }
    } else {
      setImportPreview([]);
      setImportErrors([]);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      handleCsvContentChange({ target: { value: content } } as any);
    };
    reader.readAsText(file);
  };
  
  const handleBatchImport = async () => {
    if (!csvContent.trim()) {
      toast.error('Please provide CSV data');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate required headers
      const requiredHeaders = ['pickup_location', 'delivery_location'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length) {
        toast.error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
        return;
      }
      
      const importData = [];
      const errors = [];
      
      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i}: Column count mismatch`);
          continue;
        }
        
        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as any);
        
        // Generate ID and tracking ID if not provided
        if (!rowData.id) {
          rowData.id = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
        
        if (!rowData.trackingId) {
          rowData.trackingId = `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
        
        // Set default values
        rowData.status = rowData.status || 'pending';
        rowData.created_at = rowData.created_at || new Date().toISOString();
        
        if (!rowData.pickup_location || !rowData.delivery_location) {
          errors.push(`Row ${i}: Missing required pickup or delivery location`);
          continue;
        }
        
        importData.push(rowData);
      }
      
      if (errors.length) {
        setImportErrors(errors);
        toast.error(`Found ${errors.length} errors in import data`);
        return;
      }
      
      // Insert records
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert(importData)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`Successfully imported ${importData.length} orders`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing orders:', error);
      toast.error('Failed to import orders');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBatchStatusUpdate = async () => {
    if (!status) {
      toast.error('Please select a status');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      let query = supabase.from('delivery_requests');
      
      if (filterBy === 'status') {
        query = query.eq('status', filterValue);
      } else if (filterBy === 'priority') {
        query = query.eq('priority', filterValue);
      }
      
      const { data: matchingRecords, error: countError } = await query.select('id');
      
      if (countError) {
        throw new Error(countError.message);
      }
      
      if (matchingRecords.length === 0) {
        toast.error('No matching orders found');
        return;
      }
      
      // Confirm with user
      if (!confirm(`Are you sure you want to update the status of ${matchingRecords.length} orders to "${status}"?`)) {
        return;
      }
      
      // Reset the query
      query = supabase.from('delivery_requests');
      
      if (filterBy === 'status') {
        query = query.eq('status', filterValue);
      } else if (filterBy === 'priority') {
        query = query.eq('priority', filterValue);
      }
      
      const { data, error } = await query
        .update({ status })
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`Updated status of ${matchingRecords.length} orders to "${status}"`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Batch Order Processing</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="import" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="import">Import Orders</TabsTrigger>
            <TabsTrigger value="status">Batch Status Update</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Import multiple orders from CSV. The CSV must include pickup_location and delivery_location columns.
              </p>
              
              <div>
                <Input
                  type="file"
                  accept=".csv"
                  id="csv-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="csvContent">CSV Content</Label>
              <Textarea
                id="csvContent"
                value={csvContent}
                onChange={handleCsvContentChange}
                placeholder="id,trackingId,pickup_location,delivery_location,priority,packageType,status,email,customer_name,notes"
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            {importPreview.length > 0 && (
              <div className="space-y-2">
                <Label>Preview ({Math.min(importPreview.length, 5)} of {importPreview.length} rows)</Label>
                <div className="border rounded overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        {Object.keys(importPreview[0]).map((header) => (
                          <th key={header} className="px-2 py-1 text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-t">
                          {Object.values(row).map((value: any, valueIndex) => (
                            <td key={valueIndex} className="px-2 py-1 truncate max-w-[100px]">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {importErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 text-sm">
                    {importErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterBy">Filter Orders By</Label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger id="filterBy">
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filterValue">Filter Value</Label>
                {filterBy === 'status' ? (
                  <Select value={filterValue} onValueChange={setFilterValue}>
                    <SelectTrigger id="filterValue">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={filterValue} onValueChange={setFilterValue}>
                    <SelectTrigger id="filterValue">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newStatus">Set New Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="newStatus">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Batch Update Information</AlertTitle>
              <AlertDescription>
                This action will update all orders that match the filter criteria.
                You will be prompted to confirm before changes are applied.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'import' ? (
            <Button 
              type="button" 
              onClick={handleBatchImport} 
              disabled={isProcessing || csvContent.trim() === ''}
            >
              {isProcessing ? 'Processing...' : 'Import Orders'}
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleBatchStatusUpdate} 
              disabled={isProcessing || !status}
            >
              {isProcessing ? 'Processing...' : 'Update Status'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchProcessingDialog; 