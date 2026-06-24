-- Table to track managed server infrastructure
CREATE TABLE IF NOT EXISTS systems (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(100) UNIQUE NOT NULL,
    environment VARCHAR(50) DEFAULT 'production',
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to stream high-frequency performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    system_id INT REFERENCES systems(id) ON DELETE CASCADE,
    cpu_utilization NUMERIC(5, 2) NOT NULL,
    memory_utilization NUMERIC(5, 2) NOT NULL,
    network_latency_ms INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial host entries for verification
INSERT INTO systems (hostname, environment, ip_address) VALUES
('prod-api-gateway-01', 'production', '10.0.1.5'),
('prod-db-cluster-01', 'production', '10.0.1.12'),
('staging-app-server-01', 'staging', '192.168.1.50')
ON CONFLICT (hostname) DO NOTHING;