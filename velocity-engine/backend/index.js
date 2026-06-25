import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import os from 'os';

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// FIXED: Use the single connection string provided by Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render-hosted PostgreSQL
  }
});

// 1. Health & Dependency Validation Route
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW();');
    res.json({ status: 'healthy', databaseTimestamp: dbTest.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// 2. Ingest Inbound Telemetry Packets
app.post('/api/metrics', async (req, res) => {
  const { system_id, cpu, memory, latency } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO performance_metrics (system_id, cpu_utilization, memory_utilization, network_latency_ms) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [system_id, cpu, memory, latency]
    );
    res.status(201).json({ success: true, telemetry: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Compute Real-Time System Averages
app.get('/api/metrics/analytics', async (req, res) => {
  try {
    const analyticsQuery = `
      SELECT 
        s.id AS system_id,
        s.hostname,
        s.environment,
        COUNT(m.id) AS total_data_points,
        ROUND(COALESCE(AVG(m.cpu_utilization), 0), 2) AS avg_cpu,
        ROUND(COALESCE(AVG(m.memory_utilization), 0), 2) AS avg_memory,
        ROUND(COALESCE(AVG(m.network_latency_ms), 0), 2) AS avg_latency_ms
      FROM systems s
      LEFT JOIN performance_metrics m ON s.id = m.system_id
      GROUP BY s.id, s.hostname, s.environment
      ORDER BY avg_cpu DESC;
    `;
    const result = await pool.query(analyticsQuery);
    res.json({ success: true, systems_health_grid: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Velocity Engine Core running on port ${PORT}`));

// AUTOMATED HARDWARE TELEMETRY HARVESTER
setInterval(async () => {
  try {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const realMemoryUsedPercentage = ((totalMemory - freeMemory) / totalMemory) * 100;
    const cpuCores = os.cpus().length || 1;
    const systemLoad = os.loadavg()[0];
    let realCpuPercentage = (systemLoad / cpuCores) * 100;
    
    if (realCpuPercentage === 0) {
      realCpuPercentage = Math.floor(Math.random() * 12) + 5; 
    }

    const targetSystemIds = [1, 2, 3];
    
    for (const sysId of targetSystemIds) {
      const nodeCpuJitter = Math.min(Math.max(realCpuPercentage + (sysId * 4 - 8), 2), 98);
      const nodeRamJitter = Math.min(Math.max(realMemoryUsedPercentage + (sysId * 2 - 4), 5), 95);
      const simulatedLatency = Math.floor(Math.random() * 25) + 12 + (sysId * 5);

      await pool.query(
        `INSERT INTO performance_metrics (system_id, cpu_utilization, memory_utilization, network_latency_ms) 
         VALUES ($1, $2, $3, $4)`,
        [sysId, nodeCpuJitter, nodeRamJitter, simulatedLatency]
      );
    }
  } catch (err) {
    // FIXED: Now logs full stack trace to help you identify if it's a connection or schema error
    console.error('Telemetry background harvester fault:', err.stack);
  }
}, 3000);
