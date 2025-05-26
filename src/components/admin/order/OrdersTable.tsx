import { DeliveryRequest } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, FileEdit, Trash2, ClipboardList, Check, X, Truck, ArrowRight, PackageCheck, RefreshCw, RotateCcw, Undo, AlertTriangle } from 'lucide-react';

interface OrdersTableProps {
  filteredRequests: DeliveryRequest[];
  selectedRequests: string[];
  setSelectedRequests: React.Dispatch<React.SetStateAction<string[]>>;
  handleSelectAll: () => void;
  handleSelectRequest: (id: string) => void;
  handleOpenEdit: (request: DeliveryRequest) => void;
  handleDelete: (id: string) => void;
  handleViewCustody: (request: DeliveryRequest) => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterPriority: string;
  setFilterPriority: React.Dispatch<React.SetStateAction<string>>;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onStatusUpdate: (req: DeliveryRequest, status: 'picked_up' | 'in_transit' | 'delivered' | 'reset_to_pending') => void;
}

const OrdersTable = ({
  filteredRequests,
  selectedRequests,
  setSelectedRequests,
  handleSelectAll,
  handleSelectRequest,
  handleOpenEdit,
  handleDelete,
  handleViewCustody,
  searchTerm,
  setSearchTerm,
  filterPriority,
  setFilterPriority,
  onApprove,
  onDecline,
  onStatusUpdate
}: OrdersTableProps) => {
  // Helper function to get the delivery stage based on tracking updates
  const getDeliveryStage = (request: DeliveryRequest): string => {
    if (!request.tracking_updates || request.tracking_updates.length === 0) {
      return request.status;
    }
    
    // Look for specific tracking update statuses to determine delivery stage
    const hasPickedUp = request.tracking_updates.some(update => update.status === 'Picked Up');
    const hasInTransit = request.tracking_updates.some(update => update.status === 'In Transit');
    const hasDelivered = request.tracking_updates.some(update => update.status === 'Delivered');
    
    if (hasDelivered) return 'Delivered';
    if (hasInTransit) return 'In Transit';
    if (hasPickedUp) return 'Picked Up';
    
    // Check if the request has been approved but not yet picked up
    const hasApproved = request.tracking_updates.some(update => update.status === 'Request Approved');
    if (hasApproved && request.status === 'pending') return 'Approved';
    
    return request.status;
  };
  
  // Helper function to get status badge color
  const getStatusBadgeVariant = (request: DeliveryRequest): string => {
    const stage = getDeliveryStage(request);
    
    switch (stage) {
      case 'Picked Up': return 'blue';
      case 'In Transit': return 'yellow';
      case 'Delivered': return 'green';
      case 'Approved': return 'lime';
      case 'declined': return 'destructive';
      case 'completed': return 'secondary';
      case 'in_progress': return 'default';
      default: return 'outline';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Order List</CardTitle>
          <div className="flex gap-2 items-center">
            <select 
              className="p-2 border rounded-md text-sm"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
            <Input 
              placeholder="Search orders..." 
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <CardDescription>
          {filteredRequests.length} orders found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">
                  <Checkbox 
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="p-2 text-left">ID/Tracking</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Stage</th>
                <th className="p-2 text-left">Priority</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Pickup</th>
                <th className="p-2 text-left">Delivery</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(request => {
                  const deliveryStage = getDeliveryStage(request);
                  const statusBadgeVariant = getStatusBadgeVariant(request);
                  const isPickedUp = request.tracking_updates?.some(update => update.status === 'Picked Up');
                  const isInTransit = request.tracking_updates?.some(update => update.status === 'In Transit');
                  
                  return (
                    <tr key={request.id} className="border-t">
                      <td className="p-2">
                        <Checkbox 
                          checked={selectedRequests.includes(request.id)}
                          onCheckedChange={() => handleSelectRequest(request.id)}
                        />
                      </td>
                      <td className="p-2">
                        <div>{request.id.substring(0, 6)}...</div>
                        <div className="text-xs text-muted-foreground">{request.trackingId}</div>
                      </td>
                      <td className="p-2">
                        <Badge variant={
                          request.status === 'pending' ? 'outline' : 
                          request.status === 'in_progress' ? 'default' :
                          request.status === 'completed' ? 'secondary' :
                          'destructive'
                        }>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {deliveryStage !== request.status && (
                          <Badge variant={statusBadgeVariant === 'lime' ? 'outline' : statusBadgeVariant} 
                            className={statusBadgeVariant === 'lime' ? 'bg-green-50 text-green-600 border-green-200' : ''}>
                            {deliveryStage}
                          </Badge>
                        )}
                      </td>
                      <td className="p-2">
                        {request.priority === 'urgent' ? (
                          <Badge variant="destructive">Urgent</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </td>
                      <td className="p-2">{request.packageType || 'Standard'}</td>
                      <td className="p-2 max-w-[150px] truncate">{request.pickup_location}</td>
                      <td className="p-2 max-w-[150px] truncate">{request.delivery_location}</td>
                      <td className="p-2">{new Date(request.created_at).toLocaleDateString()}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {/* PENDING STATUS ACTIONS */}
                          {request.status === 'pending' && (
                            <>
                              {!request.tracking_updates?.some(update => update.status === 'Request Approved') ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      
                                      console.log(`Approving request ID: ${request.id}`);
                                      
                                      const button = e.currentTarget;
                                      const originalText = button.innerHTML;
                                      
                                      button.innerHTML = '<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Approving...';
                                      button.disabled = true;
                                      
                                      try {
                                        setTimeout(() => {
                                          onApprove(request.id);
                                          
                                          setTimeout(() => {
                                            console.log(`Approval process completed for ${request.id}`);
                                            if (document.body.contains(button)) {
                                              button.innerHTML = originalText;
                                              button.disabled = false;
                                            }
                                          }, 2000);
                                        }, 100);
                                      } catch (error) {
                                        console.error("Error during approval:", error);
                                        button.innerHTML = originalText;
                                        button.disabled = false;
                                      }
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => onDecline(request.id)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              ) : (
                                <div className="flex flex-col">
                                  <Badge variant="outline" className="px-2 py-1 bg-green-50 text-green-600 border-green-200">
                                    Approved
                                  </Badge>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    Awaiting driver assignment
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* IN PROGRESS STATUS ACTIONS */}
                          {request.status === 'in_progress' && !request.assigned_driver && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-orange-600 hover:text-orange-700"
                              onClick={() => onStatusUpdate(request, 'reset_to_pending')}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reset to Pending
                            </Button>
                          )}

                          {request.status === 'in_progress' && request.assigned_driver && (
                            <>
                              {/* Always show these buttons for in_progress with driver */}
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${isPickedUp ? 'bg-blue-50' : ''} text-blue-600 hover:text-blue-700`}
                                onClick={() => onStatusUpdate(request, 'picked_up')}
                              >
                                <Truck className="h-4 w-4 mr-1" />
                                Picked Up
                                {isPickedUp && <Check className="h-3 w-3 ml-1" />}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${isInTransit ? 'bg-yellow-50' : ''} text-yellow-700 hover:text-yellow-800`}
                                onClick={() => onStatusUpdate(request, 'in_transit')}
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                In Transit
                                {isInTransit && <Check className="h-3 w-3 ml-1" />}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => onStatusUpdate(request, 'delivered')}
                              >
                                <PackageCheck className="h-4 w-4 mr-1" />
                                Delivered
                              </Button>
                            </>
                          )}
                          
                          {/* COMPLETED STATUS ACTIONS */}
                          {request.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700"
                              onClick={() => {
                                if (window.confirm('Reset this completed delivery to in-progress status?')) {
                                  const resetRequest = {
                                    ...request,
                                    status: 'in_progress'
                                  };
                                  onStatusUpdate(resetRequest, 'reset_to_pending');
                                }
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Reopen
                            </Button>
                          )}
                          
                          {/* DECLINED STATUS ACTIONS */}
                          {request.status === 'declined' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                if (window.confirm('Reconsider this declined request?')) {
                                  onApprove(request.id);
                                }
                              }}
                            >
                              <Undo className="h-4 w-4 mr-1" />
                              Reconsider
                            </Button>
                          )}
                          
                          {/* COMMON ACTIONS FOR ALL STATUSES */}
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(request)}>
                            <FileEdit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(request.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          {(request.packageType?.toLowerCase().includes('sample') || 
                           request.packageType?.toLowerCase().includes('specimen')) && (
                            <Button variant="ghost" size="icon" onClick={() => handleViewCustody(request)}>
                              <ClipboardList className="w-4 h-4 text-blue-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {selectedRequests.length > 0 && (
          <div className="mt-4 flex items-center gap-2 p-2 bg-muted rounded-md">
            <span>{selectedRequests.length} orders selected</span>
            <div className="flex-1"></div>
            <Button variant="outline" size="sm" onClick={() => setSelectedRequests([])}>
              Clear Selection
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${selectedRequests.length} orders?`)) {
                  selectedRequests.forEach(id => handleDelete(id));
                  setSelectedRequests([]);
                }
              }}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTable;