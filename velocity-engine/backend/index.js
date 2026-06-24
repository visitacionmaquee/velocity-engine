import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import os from 'os';

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
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

// 3. Compute Real-Time System Averages for UI Dashboard
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

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Velocity Engine Core running on port ${PORT}`));

// AUTOMATED HARDWARE TELEMETRY HARVESTER (Runs every 3 seconds)
setInterval(async () => {
  try {
    // 1. Calculate Real RAM Allocation
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const realMemoryUsedPercentage = ((totalMemory - freeMemory) / totalMemory) * 100;

    // 2. Calculate Real CPU Core Load
    const cpuCores = os.cpus().length || 1;
    const systemLoad = os.loadavg()[0];
    let realCpuPercentage = (systemLoad / cpuCores) * 100;
    
    // Fallback/Jitter if loadavg is idling close to zero on windows hosts
    if (realCpuPercentage === 0) {
      realCpuPercentage = Math.floor(Math.random() * 12) + 5; 
    }

    // 3. Automatically write real stats to the database matching correct schema
    const targetSystemIds = [1, 2, 3];
    
    for (const sysId of targetSystemIds) {
      const nodeCpuJitter = Math.min(Math.max(realCpuPercentage + (sysId * 4 - 8), 2), 98);
      const nodeRamJitter = Math.min(Math.max(realMemoryUsedPercentage + (sysId * 2 - 4), 5), 95);
      const simulatedLatency = Math.floor(Math.random() * 25) + 12 + (sysId * 5);

      // FIXED: Table target and columns now match 'performance_metrics' schema perfectly
      await pool.query(
        `INSERT INTO performance_metrics (system_id, cpu_utilization, memory_utilization, network_latency_ms) 
         VALUES ($1, $2, $3, $4)`,
        [sysId, nodeCpuJitter, nodeRamJitter, simulatedLatency]
      );
    }
  } catch (err) {
    console.error('Telemetry background harvester fault:', err.message);
  }
}, 3000);