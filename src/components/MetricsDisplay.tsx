
import React from "react";
import { QueueMetrics } from "@/utils/queueCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MetricsDisplayProps {
  metrics: QueueMetrics;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  const formatValue = (value: number) => {
    return value.toFixed(4);
  };
  
  const isSystemStable = metrics.rho < 1;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Lq - Queue Length</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(metrics.lq)}</div>
          <p className="text-xs text-muted-foreground">
            Average number of customers in queue
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ls - System Length</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(metrics.ls)}</div>
          <p className="text-xs text-muted-foreground">
            Average number of customers in system
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Wq - Wait Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(metrics.wq)}</div>
          <p className="text-xs text-muted-foreground">
            Average waiting time in queue
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ws - System Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(metrics.ws)}</div>
          <p className="text-xs text-muted-foreground">
            Average time spent in system
          </p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Server Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{metrics.utilization.toFixed(2)}%</span>
            <span className={`text-sm ${isSystemStable ? "text-green-500" : "text-red-500"}`}>
              {isSystemStable ? "System Stable" : "System Unstable"}
            </span>
          </div>
          <Progress value={metrics.utilization} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Percentage of time servers are busy
          </p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Server Idle Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{metrics.idleTime.toFixed(2)}%</div>
          <Progress value={metrics.idleTime} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Percentage of time servers are idle
          </p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Traffic Intensity (ρ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{metrics.rho.toFixed(4)}</span>
            <span className={`text-sm ${metrics.rho < 1 ? "text-green-500" : "text-red-500"}`}>
              {metrics.rho < 1 ? "Queue will not grow indefinitely" : "Queue will grow indefinitely"}
            </span>
          </div>
          <Progress value={Math.min(metrics.rho * 100, 100)} className={`h-2 ${metrics.rho >= 1 ? "bg-red-100" : ""}`} />
          <p className="text-xs text-muted-foreground mt-2">
            ρ = λ/(cμ) - Must be less than 1 for queue stability
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDisplay;
