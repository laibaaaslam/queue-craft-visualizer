
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import MetricsDisplay from "@/components/MetricsDisplay";
import ChartDisplay from "@/components/ChartDisplay";
import CustomerTable from "@/components/CustomerTable";
import QueueVisualization from "@/components/QueueVisualization";
import { useToast } from "@/hooks/use-toast";
import { 
  calculateMMCMetrics, 
  runQueueSimulation,
  QueueMetrics, 
  SimulationResult,
  Customer
} from "@/utils/queueCalculations";

const Index = () => {
  const { toast } = useToast();
  
  // Input state
  const [arrivalMean, setArrivalMean] = useState<number>(2);
  const [serviceMean, setServiceMean] = useState<number>(1);
  const [numServers, setNumServers] = useState<number>(2);
  const [usePriority, setUsePriority] = useState<boolean>(false);
  const [numCustomers, setNumCustomers] = useState<number>(100);
  
  // Results state
  const [analyticalMetrics, setAnalyticalMetrics] = useState<QueueMetrics | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Handle the calculation
  const handleCalculate = () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!arrivalMean || arrivalMean <= 0) {
        throw new Error("Arrival mean must be a positive number");
      }
      
      if (!serviceMean || serviceMean <= 0) {
        throw new Error("Service mean must be a positive number");
      }
      
      if (!numServers || numServers <= 0 || !Number.isInteger(numServers)) {
        throw new Error("Number of servers must be a positive integer");
      }
      
      if (!numCustomers || numCustomers <= 0 || !Number.isInteger(numCustomers)) {
        throw new Error("Number of customers must be a positive integer");
      }
      
      // Check stability condition
      const lambda = 1 / arrivalMean;
      const mu = 1 / serviceMean;
      
      if (lambda >= mu * numServers) {
        toast({
          title: "Warning: Unstable Queue",
          description: "The arrival rate exceeds service capacity (λ ≥ cμ). The queue will grow indefinitely in theory.",
          variant: "destructive"
        });
      }
      
      // Calculate analytical metrics
      const metrics = calculateMMCMetrics(lambda, mu, numServers);
      setAnalyticalMetrics(metrics);
      
      // Run simulation
      const simulation = runQueueSimulation(lambda, mu, numServers, usePriority, numCustomers);
      setSimulationResult(simulation);
      
      toast({
        title: "Calculations complete",
        description: `Successfully calculated metrics for ${numCustomers} customers.`
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast({
          title: "Calculation Error",
          description: err.message,
          variant: "destructive"
        });
      } else {
        setError("An unknown error occurred");
        toast({
          title: "Unknown Error",
          description: "An unknown error occurred during calculation",
          variant: "destructive"
        });
      }
    } finally {
      setIsCalculating(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-queue-dark mb-2">M/M/C Queue Simulator</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Simulate and analyze multi-server queuing systems with exponential arrival and service times.
          Visualize performance metrics and customer flow.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Queue Parameters</CardTitle>
          <CardDescription>
            Enter the parameters for your M/M/C queue simulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="arrivalMean">Arrival Mean (time units)</Label>
              <Input 
                id="arrivalMean" 
                type="number" 
                min="0.01" 
                step="0.01"
                value={arrivalMean} 
                onChange={(e) => setArrivalMean(parseFloat(e.target.value))}
                placeholder="Enter arrival mean"
              />
              <p className="text-xs text-muted-foreground">
                Average time between arrivals (1/λ)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceMean">Service Mean (time units)</Label>
              <Input 
                id="serviceMean" 
                type="number" 
                min="0.01" 
                step="0.01"
                value={serviceMean} 
                onChange={(e) => setServiceMean(parseFloat(e.target.value))}
                placeholder="Enter service mean"
              />
              <p className="text-xs text-muted-foreground">
                Average service time per customer (1/μ)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numServers">Number of Servers</Label>
              <Input 
                id="numServers" 
                type="number" 
                min="1" 
                step="1"
                value={numServers} 
                onChange={(e) => setNumServers(parseInt(e.target.value))}
                placeholder="Enter number of servers"
              />
              <p className="text-xs text-muted-foreground">
                Number of parallel servers (c)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numCustomers">Number of Customers</Label>
              <Input 
                id="numCustomers" 
                type="number" 
                min="10" 
                max="1000"
                step="10"
                value={numCustomers} 
                onChange={(e) => setNumCustomers(parseInt(e.target.value))}
                placeholder="Enter number of customers"
              />
              <p className="text-xs text-muted-foreground">
                Number of customers to simulate
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-6">
            <Switch 
              id="usePriority" 
              checked={usePriority}
              onCheckedChange={setUsePriority}
            />
            <Label htmlFor="usePriority">Use Priority-Based Scheduling</Label>
          </div>
          
          {usePriority && (
            <p className="text-sm text-muted-foreground mt-2">
              When enabled, customers will be assigned random priority levels (1-3).
              Lower priority numbers are serviced first.
            </p>
          )}
          
          <Button 
            className="mt-6" 
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating..." : "Calculate Metrics"}
          </Button>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {analyticalMetrics && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Analytical Results</h2>
            <MetricsDisplay metrics={analyticalMetrics} />
          </div>
        </>
      )}
      
      {simulationResult && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Simulation Results</h2>
            <MetricsDisplay metrics={simulationResult.metrics} />
          </div>
          
          <QueueVisualization metrics={simulationResult.metrics} numServers={numServers} />
          
          <ChartDisplay customers={simulationResult.customers} usePriority={usePriority} />
          
          <CustomerTable customers={simulationResult.customers} usePriority={usePriority} />
        </>
      )}
    </div>
  );
};

export default Index;
