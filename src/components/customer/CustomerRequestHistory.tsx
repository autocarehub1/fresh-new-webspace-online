import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDeliveries } from "@/services/customerService";
import { DeliveryRequest } from "@/types/delivery";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Truck, ArrowUpDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerRequestHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch delivery requests
  const { data: deliveries, isLoading, isError } = useQuery({
    queryKey: ["customerDeliveries", user?.id],
    queryFn: () => fetchCustomerDeliveries(user?.id as string),
    enabled: !!user?.id,
  });
  
  // Apply filters
  const filteredDeliveries = deliveries ? deliveries.filter((delivery) => {
    const matchesSearch = searchQuery === "" ||
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.pickup_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.delivery_location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === null || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];
  
  // Sort deliveries by date (newest first)
  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Pagination
  const totalPages = Math.ceil(sortedDeliveries.length / itemsPerPage);
  const paginatedDeliveries = sortedDeliveries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle view details
  const handleViewDetails = (deliveryId: string) => {
    navigate(`/tracking?id=${deliveryId}`);
  };
  
  // Status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "declined":
        return <Badge className="bg-red-500">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  if (isLoading) {
    return <div className="text-center py-6">Loading delivery history...</div>;
  }
  
  if (isError) {
    return (
      <div className="text-center py-6 text-red-500">
        Error loading delivery history. Please try again.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by ID, pickup or delivery location..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => {
              setStatusFilter(value === "" ? null : value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredDeliveries.length} delivery requests found
      </div>
      
      {/* Results table */}
      {paginatedDeliveries.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(delivery.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {delivery.pickup_location}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {delivery.delivery_location}
                    </TableCell>
                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(delivery.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <CardFooter className="flex justify-center border-t p-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    
                    // Show first page, last page, and pages around current page
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Show ellipsis for gaps
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Truck className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No delivery requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter
              ? "Try adjusting your search filters"
              : "Create your first delivery request to get started"}
          </p>
          
          {!searchQuery && !statusFilter && (
            <Button
              className="mt-4"
              onClick={() => navigate("/customer-portal/new-request")}
            >
              Create New Request
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 