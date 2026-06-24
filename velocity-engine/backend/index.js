import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Targets 'db' container name natively mapped via Docker networks
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:velocity123@db:5432/velocity_db'
});

app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW();');
    res.json({
      status: 'healthy',
      message: 'Velocity API engine is fully operational!',
      databaseTimestamp: dbTest.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 API Container running on port ${PORT}`));