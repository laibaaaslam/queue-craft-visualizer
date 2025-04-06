
// Utility functions for M/M/c queue calculations

/**
 * Calculate the probability that all servers are idle (P0)
 */
export const calculateP0 = (lambda: number, mu: number, c: number): number => {
  const rho = lambda / (c * mu);
  
  // Check for stability condition
  if (rho >= 1) {
    return -1; // System unstable
  }
  
  let sum = 0;
  for (let n = 0; n < c; n++) {
    sum += Math.pow(lambda / mu, n) / factorial(n);
  }
  
  const lastTerm = Math.pow(lambda / mu, c) / (factorial(c) * (1 - rho));
  const p0 = 1 / (sum + lastTerm);
  
  return p0;
};

/**
 * Calculate metrics for M/M/c queue
 */
export const calculateMMCMetrics = (lambda: number, mu: number, c: number): QueueMetrics | null => {
  const p0 = calculateP0(lambda, mu, c);
  
  // Return null if system is unstable
  if (p0 === -1) {
    return null;
  }
  
  const rho = lambda / (mu * c);
  const lq = (p0 * Math.pow(lambda / mu, c) * rho) / (factorial(c) * Math.pow(1 - rho, 2));
  const ls = lq + (lambda / mu);
  const wq = lq / lambda;
  const ws = wq + (1 / mu);
  const utilization = rho * 100;
  const idleTime = (1 - rho) * 100;
  
  return {
    lq,  // Average number of customers in queue
    ls,  // Average number of customers in system
    wq,  // Average waiting time in queue
    ws,  // Average time spent in system
    utilization, // Server utilization percentage
    idleTime,    // Server idle time percentage
    rho
  };
};

/**
 * Run a simulation of the M/M/c queue with optional priority
 */
export const runQueueSimulation = (
  lambda: number, 
  mu: number, 
  c: number, 
  usePriority: boolean,
  numCustomers: number = 100
): SimulationResult => {
  const customers: Customer[] = [];
  let currentTime = 0;
  const servers: Server[] = Array(c).fill(null).map(() => ({ busy: false, availableAt: 0 }));
  
  // Generate customer arrivals using exponential distribution
  for (let i = 0; i < numCustomers; i++) {
    // Generate interarrival time from exponential distribution
    const interarrivalTime = exponential(lambda);
    
    // Calculate arrival time by adding interarrival time to the current time
    currentTime += interarrivalTime;
    
    // Generate service time from exponential distribution
    const serviceTime = exponential(mu);
    
    // Assign random priority if using priority-based simulation
    const priority = usePriority ? Math.floor(Math.random() * 3) + 1 : 1;
    
    customers.push({
      id: i + 1,
      arrivalTime: currentTime,
      serviceTime,
      priority,
      waitTime: 0,
      startServiceTime: 0,
      endTime: 0,
      server: 0,
      responseTime: 0,
      turnaroundTime: 0
    });
  }

  // Sort by arrival time
  customers.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  // Process each customer
  let queue: Customer[] = [];
  
  customers.forEach(customer => {
    // Add customer to queue
    queue.push(customer);
    
    // If using priority, sort queue by priority
    if (usePriority) {
      queue.sort((a, b) => a.priority - b.priority);
    }
    
    // Process queue until we can't serve more customers
    processQueue(queue, servers, customer.arrivalTime);
  });
  
  // Process remaining customers in queue
  while (queue.length > 0) {
    // Find the next time a server becomes available
    const nextAvailableTime = Math.min(...servers.map(server => server.availableAt));
    processQueue(queue, servers, nextAvailableTime);
  }
  
  // Calculate statistics
  const totalWaitTime = customers.reduce((sum, c) => sum + c.waitTime, 0);
  const totalTurnaroundTime = customers.reduce((sum, c) => sum + c.turnaroundTime, 0);
  const totalResponseTime = customers.reduce((sum, c) => sum + c.responseTime, 0);
  const totalServiceTime = customers.reduce((sum, c) => sum + c.serviceTime, 0);
  
  const avgWaitTime = totalWaitTime / customers.length;
  const avgTurnaroundTime = totalTurnaroundTime / customers.length;
  const avgResponseTime = totalResponseTime / customers.length;
  const avgServiceTime = totalServiceTime / customers.length;
  
  // Calculate server utilization
  const maxTime = Math.max(...customers.map(c => c.endTime));
  const serverBusyTimes = servers.map(() => 0);
  
  customers.forEach(c => {
    const serverIndex = c.server - 1;
    const busyTime = c.endTime - c.startServiceTime;
    serverBusyTimes[serverIndex] += busyTime;
  });
  
  const avgUtilization = serverBusyTimes.reduce((sum, time) => sum + time, 0) / (maxTime * c) * 100;
  const avgIdleTime = 100 - avgUtilization;
  
  return {
    customers,
    metrics: {
      lq: avgWaitTime * lambda,  // Average number in queue (Little's Law)
      ls: avgTurnaroundTime * lambda,  // Average number in system (Little's Law)
      wq: avgWaitTime,  // Average waiting time in queue
      ws: avgTurnaroundTime,  // Average time in system
      utilization: avgUtilization,
      idleTime: avgIdleTime,
      rho: lambda / (mu * c)
    }
  };
};

// Helper function to process the queue
const processQueue = (queue: Customer[], servers: Server[], currentTime: number) => {
  // Find available servers
  const availableServerIndex = servers.findIndex(server => 
    server.availableAt <= currentTime
  );
  
  if (availableServerIndex === -1 || queue.length === 0) {
    return;
  }
  
  // Get the next customer from the queue (already sorted by priority if needed)
  const customer = queue.shift()!;
  
  // Calculate wait time
  customer.waitTime = Math.max(0, currentTime - customer.arrivalTime);
  
  // Mark service start
  customer.startServiceTime = Math.max(currentTime, servers[availableServerIndex].availableAt);
  
  // Calculate when service will end
  const endTime = customer.startServiceTime + customer.serviceTime;
  customer.endTime = endTime;
  
  // Assign server
  customer.server = availableServerIndex + 1;
  
  // Update server availability
  servers[availableServerIndex].availableAt = endTime;
  servers[availableServerIndex].busy = true;
  
  // Calculate response time (time until first served)
  customer.responseTime = customer.startServiceTime - customer.arrivalTime;
  
  // Calculate turnaround time (total time in system)
  customer.turnaroundTime = customer.endTime - customer.arrivalTime;
  
  // Continue processing queue if there are still available servers
  processQueue(queue, servers, currentTime);
};

// Helper function to generate exponential random variable
const exponential = (rate: number): number => {
  return -Math.log(1 - Math.random()) / rate;
};

// Helper function to calculate factorial
const factorial = (n: number): number => {
  if (n === 0 || n === 1) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

// Types
export interface QueueMetrics {
  lq: number;         // Average number of customers in queue
  ls: number;         // Average number of customers in system
  wq: number;         // Average waiting time in queue
  ws: number;         // Average time spent in system
  utilization: number; // Server utilization percentage
  idleTime: number;    // Server idle time percentage
  rho: number;         // Traffic intensity
}

export interface Customer {
  id: number;
  arrivalTime: number;
  serviceTime: number;
  priority: number;
  waitTime: number;
  startServiceTime: number;
  endTime: number;
  server: number;
  responseTime: number;
  turnaroundTime: number;
}

interface Server {
  busy: boolean;
  availableAt: number;
}

export interface SimulationResult {
  customers: Customer[];
  metrics: QueueMetrics;
}
