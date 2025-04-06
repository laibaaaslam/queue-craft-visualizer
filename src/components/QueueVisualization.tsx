
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueMetrics } from "@/utils/queueCalculations";
import { Users, Timer, ArrowRight, Server } from "lucide-react";

interface QueueVisualizationProps {
  metrics: QueueMetrics;
  numServers: number;
}

const QueueVisualization: React.FC<QueueVisualizationProps> = ({ metrics, numServers }) => {
  // Calculate customers for visualization based on metrics
  const queueCustomers = Math.round(metrics.lq);
  const serviceCustomers = Math.round(metrics.ls - metrics.lq);
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Queue Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
          {/* Arrival process */}
          <div className="flex flex-col items-center">
            <div className="mb-2 text-center">
              <div className="text-sm font-medium text-gray-500">Arrival Rate (λ)</div>
              <div className="text-lg font-bold">{(1/metrics.ws).toFixed(4)}/unit time</div>
            </div>
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-300 animate-pulse-light"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <Users size={16} className="text-blue-500" />
                </div>
              ))}
            </div>
            <ArrowRight className="my-2 text-gray-400" />
          </div>

          {/* Queue */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4 min-w-40 min-h-24 flex items-center justify-center relative">
            <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-gray-500">
              Queue (Lq: {metrics.lq.toFixed(2)})
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {queueCustomers > 0 ? (
                [...Array(Math.min(queueCustomers, 10))].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center border border-blue-300"
                  >
                    <Users size={14} className="text-blue-600" />
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">Empty</div>
              )}
              {queueCustomers > 10 && (
                <div className="text-sm font-medium">+{queueCustomers - 10} more</div>
              )}
            </div>
            <div className="absolute -bottom-3 right-4 bg-white px-2 text-xs font-medium text-gray-500">
              Wq: {metrics.wq.toFixed(2)}
            </div>
          </div>

          <ArrowRight className="my-2 text-gray-400" />

          {/* Service */}
          <div className="border border-gray-300 rounded-lg p-4 min-w-40 min-h-24 flex items-center justify-center relative">
            <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-gray-500">
              Service ({numServers} servers)
            </div>
            <div className="flex flex-col gap-2">
              {[...Array(numServers)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-md ${i < serviceCustomers ? "bg-teal-200" : "bg-gray-100"} flex items-center justify-center border ${i < serviceCustomers ? "border-teal-300" : "border-gray-200"}`}>
                    <Server size={14} className={i < serviceCustomers ? "text-teal-600" : "text-gray-400"} />
                  </div>
                  {i < serviceCustomers && (
                    <div className="h-8 w-8 rounded-full bg-blue-300 flex items-center justify-center border border-blue-400">
                      <Users size={14} className="text-blue-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute -bottom-3 right-4 bg-white px-2 text-xs font-medium text-gray-500">
              1/μ: {(1/metrics.ws + metrics.wq).toFixed(2)}
            </div>
          </div>

          <ArrowRight className="my-2 text-gray-400" />

          {/* Departure */}
          <div className="flex flex-col items-center">
            <div className="mb-2 text-center">
              <div className="text-sm font-medium text-gray-500">Departure Rate</div>
              <div className="text-lg font-bold">{(1/metrics.ws).toFixed(4)}/unit time</div>
            </div>
            <div className="flex -space-x-2">
              {[...Array(2)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center border border-teal-300 animate-pulse-light"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <Users size={16} className="text-teal-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-500">Average Waiting Time (Wq)</div>
            <div className="flex items-center mt-1">
              <Timer className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-lg font-bold">{metrics.wq.toFixed(4)}</span>
            </div>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-500">Average Time in System (Ws)</div>
            <div className="flex items-center mt-1">
              <Timer className="h-5 w-5 mr-2 text-teal-500" />
              <span className="text-lg font-bold">{metrics.ws.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <div className="text-sm font-medium mb-2">Key Performance Metrics</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-gray-500">Utilization:</div>
              <div className="font-semibold">{metrics.utilization.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-gray-500">Idle Time:</div>
              <div className="font-semibold">{metrics.idleTime.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-gray-500">Traffic Intensity (ρ):</div>
              <div className={`font-semibold ${metrics.rho < 1 ? "text-green-600" : "text-red-600"}`}>
                {metrics.rho.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">System Status:</div>
              <div className={`font-semibold ${metrics.rho < 1 ? "text-green-600" : "text-red-600"}`}>
                {metrics.rho < 1 ? "Stable" : "Unstable"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueVisualization;
