
import React from "react";
import { Customer } from "@/utils/queueCalculations";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChartDisplayProps {
  customers: Customer[];
  usePriority: boolean;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ customers, usePriority }) => {
  // Prepare data for charts
  const customerData = customers.map(customer => ({
    id: customer.id,
    waitTime: parseFloat(customer.waitTime.toFixed(2)),
    serviceTime: parseFloat(customer.serviceTime.toFixed(2)),
    turnaroundTime: parseFloat(customer.turnaroundTime.toFixed(2)),
    responseTime: parseFloat(customer.responseTime.toFixed(2)),
    priority: customer.priority
  }));

  // Calculate averages per priority if using priority
  const priorityData = usePriority ? 
    [1, 2, 3].map(priority => {
      const filteredCustomers = customers.filter(c => c.priority === priority);
      if (filteredCustomers.length === 0) return null;
      
      return {
        priority,
        avgWaitTime: parseFloat((filteredCustomers.reduce((sum, c) => sum + c.waitTime, 0) / filteredCustomers.length).toFixed(2)),
        avgTurnaroundTime: parseFloat((filteredCustomers.reduce((sum, c) => sum + c.turnaroundTime, 0) / filteredCustomers.length).toFixed(2)),
        avgResponseTime: parseFloat((filteredCustomers.reduce((sum, c) => sum + c.responseTime, 0) / filteredCustomers.length).toFixed(2)),
        avgServiceTime: parseFloat((filteredCustomers.reduce((sum, c) => sum + c.serviceTime, 0) / filteredCustomers.length).toFixed(2)),
        count: filteredCustomers.length
      };
    }).filter(Boolean) : [];

  // Get data for pie chart
  const serverUtilizationData = Array.from(new Set(customers.map(c => c.server)))
    .map(serverId => {
      const serverCustomers = customers.filter(c => c.server === serverId);
      return {
        name: `Server ${serverId}`,
        value: serverCustomers.length
      };
    });

  // Colors for priority
  const PRIORITY_COLORS = ["#3b82f6", "#10b981", "#ef4444"];
  
  // Get colors based on priority
  const getCustomerColor = (customer: any) => {
    if (!usePriority) return "#3b82f6";
    return PRIORITY_COLORS[customer.priority - 1] || "#3b82f6";
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Simulation Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wait-time" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="wait-time">Wait Time</TabsTrigger>
            <TabsTrigger value="response-time">Response Time</TabsTrigger>
            <TabsTrigger value="turnaround-time">Turnaround Time</TabsTrigger>
            <TabsTrigger value="service-time">Service Time</TabsTrigger>
            <TabsTrigger value="server-util">Server Utilization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wait-time" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Wait Time per Customer</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" label={{ value: "Customer ID", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Wait Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="waitTime" 
                      name="Wait Time"
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Wait Time Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" label={{ value: "Customer ID", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Wait Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="waitTime" name="Wait Time">
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCustomerColor(entry)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {usePriority && priorityData.length > 0 && (
              <div className="mt-8 h-80">
                <h3 className="text-lg font-medium mb-2">Average Wait Time by Priority</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="priority" label={{ value: "Priority Level", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Average Wait Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgWaitTime" name="Avg Wait Time">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="response-time" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Response Time per Customer</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" label={{ value: "Customer ID", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Response Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      name="Response Time"
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Response Time Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" label={{ value: "Customer ID", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Response Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="responseTime" name="Response Time">
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCustomerColor(entry)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {usePriority && priorityData.length > 0 && (
              <div className="mt-8 h-80">
                <h3 className="text-lg font-medium mb-2">Average Response Time by Priority</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="priority" label={{ value: "Priority Level", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Average Response Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgResponseTime" name="Avg Response Time">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="turnaround-time" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Turnaround Time per Customer</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" label={{ value: "Customer ID", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Turnaround Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="turnaroundTime" 
                      name="Turnaround Time"
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Turnaround Time Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" label={{ value: "Customer ID", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Turnaround Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="turnaroundTime" name="Turnaround Time">
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCustomerColor(entry)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {usePriority && priorityData.length > 0 && (
              <div className="mt-8 h-80">
                <h3 className="text-lg font-medium mb-2">Average Turnaround Time by Priority</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="priority" label={{ value: "Priority Level", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Average Turnaround Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgTurnaroundTime" name="Avg Turnaround Time">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="service-time" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Service Time per Customer</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" label={{ value: "Customer ID", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Service Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="serviceTime" 
                      name="Service Time"
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Service Time Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="id" label={{ value: "Customer ID", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Service Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="serviceTime" name="Service Time">
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCustomerColor(entry)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {usePriority && priorityData.length > 0 && (
              <div className="mt-8 h-80">
                <h3 className="text-lg font-medium mb-2">Average Service Time by Priority</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="priority" label={{ value: "Priority Level", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Average Service Time", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgServiceTime" name="Avg Service Time">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="server-util" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Server Load Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serverUtilizationData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serverUtilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-80">
                <h3 className="text-lg font-medium mb-2">Customers per Server</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serverUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Number of Customers">
                      {serverUtilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 50%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChartDisplay;
