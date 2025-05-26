import { useState, useEffect } from 'react';
import { useDeliveryData } from '@/hooks/use-delivery-data';
import { useRequestActions } from '@/hooks/use-request-actions';
import { DeliveryRequest } from '@/types/delivery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, FileEdit, Trash2, Download, Upload, ClipboardList, ListPlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CreateOrderDialog from './order/CreateOrderDialog';
import EditOrderDialog from './order/EditOrderDialog';
import BatchProcessingDialog from './order/BatchProcessingDialog';
import ChainOfCustodyDialog from './order/ChainOfCustodyDialog';
import OrdersTable from './order/OrdersTable';
import { useQueryClient } from '@tanstack/react-query';

const OrderManagement = () => {
  const { deliveries: requests, isLoading, refetch } = useDeliveryData();
  const { handleDeleteRequest, handleRequestAction, handleStatusUpdate } = useRequestActions();
  const queryClient = useQueryClient();
  
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showCustodyDialog, setShowCustodyDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DeliveryRequest | null>(null);
  
  // Effect to check if selected request still exists
  useEffect(() => {
    if (currentRequest && requests) {
      const requestStillExists = requests.some(req => req.id === currentRequest.id);
      if (!requestStillExists) {
        console.log(`Selected request ${currentRequest.id} no longer exists, clearing selection`);
        setCurrentRequest(null);
        setShowEditDialog(false);
        setShowCustodyDialog(false);
      }
    }
  }, [requests, currentRequest]);
  
  const filteredRequests = requests 
    ? requests.filter(request => {
        const matchesSearch = 
          request.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.delivery_location?.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesPriority = 
          filterPriority === 'all' || 
          request.priority === filterPriority;
        
        const matchesStatus = 
          activeStatusTab === 'all' || 
          request.status === activeStatusTab;
          
        return matchesSearch && matchesPriority && matchesStatus;
      })
    : [];
  
  const handleSelectRequest = (id: string) => {
    setSelectedRequests(prev => 
      prev.includes(id) 
        ? prev.filter(requestId => requestId !== id) 
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(request => request.id));
    }
  };

  const handleApprove = (id: string) => {
    console.log(`OrderManagement: Approving request ${id}`);
    
    try {
      handleRequestAction(id, 'approve')
        .then((success) => {
          console.log(`Approval result for ${id}: ${success ? 'Success' : 'Failed'}`);
          
          if (success) {
            // Force data refetch after a short delay
            setTimeout(() => {
              console.log(`Forcing query invalidation for request ${id}`);
              // Invalidate the queries to get fresh data
              queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
              
              // Manually trigger a refetch to ensure latest data
              refetch();
            }, 1000);
          }
        })
        .catch(error => {
          console.error(`Error in approval promise for ${id}:`, error);
        });
    } catch (error) {
      console.error(`Exception in handleApprove for ${id}:`, error);
    }
  };

  const handleDecline = (id: string) => {
    handleRequestAction(id, 'decline').then((success) => {
      if (success) {
        // Force data refetch after a short delay
        setTimeout(() => {
          // Invalidate the queries to get fresh data
          queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
        }, 1000);
      }
    });
  };
  
  const handleStatusChange = (req: DeliveryRequest, status: 'picked_up' | 'in_transit' | 'delivered' | 'reset_to_pending') => {
    console.log(`OrderManagement: Changing status of request ${req.id} from ${req.status} to ${status}`);
    
    try {
      // Access the imported function from useRequestActions
      handleStatusUpdate(req, status)
        .then((success) => {
          console.log(`Status change result for ${req.id}: ${success ? 'Success' : 'Failed'}`);
          
          if (success) {
            // Force data refetch after a short delay
            setTimeout(() => {
              console.log(`Forcing query invalidation for request ${req.id}`);
              // Invalidate the queries to get fresh data
              queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
              
              // Manually trigger a refetch to ensure latest data
              refetch();
            }, 1000);
          } else {
            console.error(`Status update returned false for ${req.id}`);
          }
        })
        .catch(error => {
          console.error(`Error in status change promise for ${req.id}:`, error);
        });
    } catch (error) {
      console.error(`Exception in handleStatusChange for ${req.id}:`, error);
    }
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      // Clear dialogs and selections if the deleted request is currently selected
      if (currentRequest && currentRequest.id === id) {
        setCurrentRequest(null);
        setShowEditDialog(false);
        setShowCustodyDialog(false);
      }
      
      // Handle redirection if we're on a specific request page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.includes(id)) {
          console.log('Redirecting from specific order page to main orders page');
          window.history.pushState({}, '', '/admin?tab=orders');
        }
      }
      
      // Call the deletion function
      handleDeleteRequest(id);
      
      // Update the selected requests list
      setSelectedRequests(prev => prev.filter(requestId => requestId !== id));
    }
  };
  
  const handleBatchDelete = () => {
    if (selectedRequests.length === 0) {
      toast.error('No requests selected');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedRequests.length} requests?`)) {
      // Clear current request if it's part of the selection
      if (currentRequest && selectedRequests.includes(currentRequest.id)) {
        setCurrentRequest(null);
        setShowEditDialog(false);
        setShowCustodyDialog(false);
      }
      
      // Delete each selected request
      const requestsToDelete = [...selectedRequests]; // Create a copy to avoid mutation issues
      requestsToDelete.forEach(id => handleDeleteRequest(id));
      
      // Clear selection after deletion
      setSelectedRequests([]);
      toast.success(`${requestsToDelete.length} requests deleted`);
    }
  };
  
  const handleOpenEdit = (request: DeliveryRequest) => {
    setCurrentRequest(request);
    setShowEditDialog(true);
  };
  
  const handleViewCustody = (request: DeliveryRequest) => {
    setCurrentRequest(request);
    setShowCustodyDialog(true);
  };

  // Success callback for edit and batch dialogs
  const handleSuccess = () => {
    refetch();
    setCurrentRequest(null);
    setShowEditDialog(false);
    setShowBatchDialog(false);
    setShowCustodyDialog(false);
  };
  
  const refreshData = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }
  
  // Calculate counts for each status
  const pendingCount = requests?.filter(req => req.status === 'pending').length || 0;
  const inProgressCount = requests?.filter(req => req.status === 'in_progress').length || 0;
  const completedCount = requests?.filter(req => req.status === 'completed').length || 0;
  const declinedCount = requests?.filter(req => req.status === 'declined').length || 0;
  
  return (
    <div className="space-y-6">
      <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2" variant="outline">{pendingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress <Badge className="ml-2" variant="outline">{inProgressCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed <Badge className="ml-2" variant="outline">{completedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="declined">
            Declined <Badge className="ml-2" variant="outline">{declinedCount}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            {filteredRequests.length} orders found
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowBatchDialog(true)}
            >
              <ListPlus className="h-4 w-4" />
              Batch Process
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={refreshData}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>
        
        <TabsContent value="all">
          <OrdersTable 
            filteredRequests={filteredRequests}
            selectedRequests={selectedRequests}
            setSelectedRequests={setSelectedRequests}
            handleSelectAll={handleSelectAll}
            handleSelectRequest={handleSelectRequest}
            handleOpenEdit={handleOpenEdit}
            handleDelete={handleDelete}
            handleViewCustody={handleViewCustody}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onStatusUpdate={handleStatusChange}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <OrdersTable 
            filteredRequests={filteredRequests}
            selectedRequests={selectedRequests}
            setSelectedRequests={setSelectedRequests}
            handleSelectAll={handleSelectAll}
            handleSelectRequest={handleSelectRequest}
            handleOpenEdit={handleOpenEdit}
            handleDelete={handleDelete}
            handleViewCustody={handleViewCustody}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onStatusUpdate={handleStatusChange}
          />
        </TabsContent>
        
        <TabsContent value="in_progress">
          <OrdersTable 
            filteredRequests={filteredRequests}
            selectedRequests={selectedRequests}
            setSelectedRequests={setSelectedRequests}
            handleSelectAll={handleSelectAll}
            handleSelectRequest={handleSelectRequest}
            handleOpenEdit={handleOpenEdit}
            handleDelete={handleDelete}
            handleViewCustody={handleViewCustody}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onStatusUpdate={handleStatusChange}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <OrdersTable 
            filteredRequests={filteredRequests}
            selectedRequests={selectedRequests}
            setSelectedRequests={setSelectedRequests}
            handleSelectAll={handleSelectAll}
            handleSelectRequest={handleSelectRequest}
            handleOpenEdit={handleOpenEdit}
            handleDelete={handleDelete}
            handleViewCustody={handleViewCustody}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onStatusUpdate={handleStatusChange}
          />
        </TabsContent>
        
        <TabsContent value="declined">
          <OrdersTable 
            filteredRequests={filteredRequests}
            selectedRequests={selectedRequests}
            setSelectedRequests={setSelectedRequests}
            handleSelectAll={handleSelectAll}
            handleSelectRequest={handleSelectRequest}
            handleOpenEdit={handleOpenEdit}
            handleDelete={handleDelete}
            handleViewCustody={handleViewCustody}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onStatusUpdate={handleStatusChange}
          />
        </TabsContent>
      </Tabs>
      
      {showCreateDialog && (
        <CreateOrderDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      )}
      
      {showEditDialog && currentRequest && (
        <EditOrderDialog 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog} 
          request={currentRequest}
          onSuccess={handleSuccess}
        />
      )}
      
      {showBatchDialog && (
        <BatchProcessingDialog 
          open={showBatchDialog} 
          onOpenChange={setShowBatchDialog}
          requests={filteredRequests}
          onSuccess={handleSuccess}
        />
      )}
      
      {showCustodyDialog && currentRequest && (
        <ChainOfCustodyDialog 
          open={showCustodyDialog} 
          onOpenChange={setShowCustodyDialog} 
          request={currentRequest} 
        />
      )}
    </div>
  );
};

export default OrderManagement;
