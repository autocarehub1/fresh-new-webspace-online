
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeliveryRequest, DeliveryStatus } from '@/types/delivery';
import { FileEdit, Trash2, Eye, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';

interface OrdersTableProps {
  filteredRequests: DeliveryRequest[];
  selectedRequests: string[];
  setSelectedRequests: (requests: string[]) => void;
  handleSelectAll: () => void;
  handleSelectRequest: (id: string) => void;
  handleOpenEdit: (request: DeliveryRequest) => void;
  handleDelete: (id: string) => void;
  handleViewCustody: (request: DeliveryRequest) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onStatusUpdate: (request: DeliveryRequest, status: 'picked_up' | 'in_transit' | 'delivered' | 'reset_to_pending') => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
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
}) => {
  const getStatusBadgeVariant = (status: DeliveryStatus): "outline" | "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'pending': 
        return 'outline';
      case 'in_progress': 
        return 'default';
      case 'completed': 
        return 'secondary';
      case 'declined':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleStatusChange = (request: DeliveryRequest, newStatus: string) => {
    const validStatus = newStatus as 'picked_up' | 'in_transit' | 'delivered' | 'reset_to_pending';
    onStatusUpdate(request, validStatus);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by ID, tracking ID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <Checkbox
                  checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pickup Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox
                    checked={selectedRequests.includes(request.id)}
                    onCheckedChange={() => handleSelectRequest(request.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                    {request.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => onApprove(request.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => onDecline(request.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                    {request.status === 'in_progress' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-xs"
                          onClick={() => handleStatusChange(request, 'picked_up')}
                        >
                          Picked Up
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-xs"
                          onClick={() => handleStatusChange(request, 'in_transit')}
                        >
                          In Transit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-xs"
                          onClick={() => handleStatusChange(request, 'delivered')}
                        >
                          Delivered
                        </Button>
                      </div>
                    )}
                    {(request.status === 'completed' || request.status === 'declined') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs"
                        onClick={() => handleStatusChange(request, 'reset_to_pending')}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.pickup_location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.delivery_location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={request.priority === 'urgent' ? 'destructive' : 'outline'}>
                    {request.priority || 'normal'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(request)}
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCustody(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(request.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
