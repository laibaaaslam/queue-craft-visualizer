
import React, { useState } from "react";
import { Customer } from "@/utils/queueCalculations";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CustomerTableProps {
  customers: Customer[];
  usePriority: boolean;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, usePriority }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter customers based on search term
  const filteredCustomers = searchTerm 
    ? customers.filter(customer => 
        customer.id.toString().includes(searchTerm) ||
        customer.server.toString().includes(searchTerm)
      )
    : customers;
    
  // Paginate customers
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  
  // Priority badge color
  const getPriorityColor = (priority: number) => {
    switch(priority) {
      case 1: return "bg-green-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-red-500";
      default: return "bg-blue-500";
    }
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Customer Data</CardTitle>
        <div className="flex items-center space-x-2 mt-4">
          <Input
            placeholder="Search by ID or Server..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                {usePriority && <TableHead className="w-[100px]">Priority</TableHead>}
                <TableHead>Arrival Time</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead>Service Time</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Turnaround Time</TableHead>
                <TableHead>Server</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  {usePriority && (
                    <TableCell>
                      <Badge className={getPriorityColor(customer.priority)}>{customer.priority}</Badge>
                    </TableCell>
                  )}
                  <TableCell>{customer.arrivalTime.toFixed(2)}</TableCell>
                  <TableCell>{customer.waitTime.toFixed(2)}</TableCell>
                  <TableCell>{customer.serviceTime.toFixed(2)}</TableCell>
                  <TableCell>{customer.responseTime.toFixed(2)}</TableCell>
                  <TableCell>{customer.turnaroundTime.toFixed(2)}</TableCell>
                  <TableCell>{customer.server}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Display pages around current page
                const pageNumbers = [];
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, startPage + 4);
                
                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i);
                }
                
                return pageNumbers.map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded mx-1 ${
                      currentPage === page ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ));
              })}
            </div>
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerTable;
