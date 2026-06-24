import { useState, useEffect } from 'react';

export default function App() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState([]);

  // Fetch metrics from our Express API container
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/metrics/analytics');
      if (!response.ok) throw new Error('Failed to retrieve analytics payload.');
      const data = await response.json();
      if (data.success) {
        setSystems(data.systems_health_grid);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('System Core Offline - Re-establishing telemetry link...');
    } finally {
      setLoading(false);
    }
  };

  // Run initial fetch and establish polling
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Direct mock data injection trigger from the frontend UI
  const injectMetric = async (systemId, cpu, memory, latency) => {
    try {
      const response = await fetch('http://localhost:5000/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_id: systemId, cpu, memory, latency })
      });
      const data = await response.json();
      if (data.success) {
        addLog(`Successfully injected telemetry into SysID ${systemId}: CPU ${cpu}%, MEM ${memory}%, NET ${latency}ms`);
        fetchAnalytics();
      }
    } catch (err) {
      addLog(`ERR: Target metrics container refused network packet.`);
    }
  };

  const addLog = (msg) => {
    setSimulationLogs(prev => [ `[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9) ]);
  };

  // Trigger continuous automatic simulation loop
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      systems.forEach(sys => {
        // Generate random realistic telemetry values with occasional spikes
        const cpu = Math.floor(Math.random() * (Math.random() > 0.8 ? 50 : 20)) + (Math.random() > 0.9 ? 40 : 10);
        const mem = Math.floor(Math.random() * 15) + 40;
        const latency = Math.floor(Math.random() * 45) + 8;
        injectMetric(sys.system_id, cpu, mem, latency);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isSimulating, systems]);

  const handleSpikeCluster = () => {
    if (systems.length === 0) return;
    addLog('🔥 INITIATING MASSIVE CLUSTER SPIKE OVERLOAD');
    systems.forEach(sys => {
      injectMetric(sys.system_id, 96.40, 89.20, 245);
    });
  };

  // Dynamically determine colors based on utilization percentage
  const getStatusColor = (val) => {
    if (val > 80) return '#ff3e3e'; // Warning Red
    if (val > 50) return '#ffaa00'; // Warning Amber
    return '#00ffcc'; // Healthy Mint
  };

  // Inject custom stylesheet block to keep file completely self-contained
  useEffect(() => {
    const styleId = "velocity-custom-cyberpunk-styles";
    if (document.getElementById(styleId)) return;
    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.innerText = `
      @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;700&display=swap');
      
      body {
        margin: 0;
        background-color: #08090d;
        color: #e2e8f0;
        font-family: 'Rajdhani', sans-serif;
        background-image: 
          linear-gradient(rgba(18, 24, 38, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(18, 24, 38, 0.4) 1px, transparent 1px);
        background-size: 30px 30px;
        overflow-x: hidden;
      }

      .pulse-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0 0 10px currentColor;
        animation: pulseAnimation 1.5s infinite alternate;
      }

      @keyframes pulseAnimation {
        0% { transform: scale(0.9); opacity: 0.6; }
        100% { transform: scale(1.2); opacity: 1; }
      }

      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .cyber-header {
        border-bottom: 2px solid #1a2233;
        padding-bottom: 1.5rem;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .cyber-title {
        font-size: 2.5rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 3px;
        background: linear-gradient(90deg, #00ffcc, #45f3ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
      }

      .grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .cyber-card {
        background-color: #0f121d;
        border: 1px solid #1a233d;
        border-radius: 12px;
        padding: 1.5rem;
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      }

      .cyber-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #00ffcc, transparent);
      }

      .cyber-card:hover {
        transform: translateY(-5px);
        border-color: #00ffcc;
        box-shadow: 0 8px 30px rgba(0, 255, 204, 0.15);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #1c2642;
        padding-bottom: 0.75rem;
        margin-bottom: 1rem;
      }

      .card-title {
        font-size: 1.35rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #ffffff;
      }

      .env-tag {
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.8rem;
        padding: 2px 8px;
        border-radius: 4px;
        border: 1px solid #00ffcc;
        color: #00ffcc;
        background-color: rgba(0, 255, 204, 0.05);
      }

      .gauge-group {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin: 1.5rem 0;
      }

      .metric-radial {
        position: relative;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .radial-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }

      .radial-bg {
        fill: none;
        stroke: #161a29;
        stroke-width: 8;
      }

      .radial-progress {
        fill: none;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.5s ease-in-out;
      }

      .radial-value {
        position: absolute;
        font-family: 'Share Tech Mono', monospace;
        font-size: 1.25rem;
        font-weight: bold;
        color: #ffffff;
      }

      .linear-meter-container {
        background-color: #121624;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 6px;
      }

      .linear-meter-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease-in-out;
      }

      .metrics-footer-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.9rem;
        border-top: 1px solid #1c2642;
        padding-top: 0.75rem;
        color: #8c9bb0;
      }

      .control-panel {
        background-color: #0b0e16;
        border: 1px dashed #203159;
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 2rem;
      }

      .btn-cyber {
        font-family: 'Share Tech Mono', monospace;
        font-size: 1rem;
        background-color: transparent;
        border: 1px solid #00ffcc;
        color: #00ffcc;
        padding: 8px 20px;
        border-radius: 6px;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: bold;
        transition: all 0.2s ease;
        box-shadow: 0 0 10px rgba(0, 255, 204, 0.1);
      }

      .btn-cyber:hover:not(:disabled) {
        background-color: #00ffcc;
        color: #08090d;
        box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
      }

      .btn-cyber:disabled {
        border-color: #1c2642;
        color: #1c2642;
        cursor: not-allowed;
      }

      .btn-cyber-danger {
        border-color: #ff3e3e;
        color: #ff3e3e;
        box-shadow: 0 0 10px rgba(255, 62, 62, 0.1);
      }

      .btn-cyber-danger:hover {
        background-color: #ff3e3e;
        color: #ffffff;
        box-shadow: 0 0 20px rgba(255, 62, 62, 0.3);
      }

      .terminal-console {
        background-color: #040508;
        border-radius: 8px;
        border: 1px solid #141926;
        padding: 1rem;
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.85rem;
        color: #39ff14;
        max-height: 180px;
        overflow-y: auto;
        margin-top: 1rem;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
      }

      .console-log-row {
        margin-bottom: 4px;
        border-left: 2px solid #39ff14;
        padding-left: 8px;
      }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Visual Header Grid */}
      <header className="cyber-header">
        <div>
          <h1 className="cyber-title">// VELOCITY_MONITOR_CENTER</h1>
          <p style={{ margin: '5px 0 0 0', color: '#8c9bb0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Telemetry Node: <span style={{ color: '#ffffff' }}>Local_Cluster</span>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span className="pulse-indicator" style={{ color: error ? '#ff3e3e' : '#00ffcc' }}></span>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {error ? error : 'Infrastructure Live'}
          </span>
        </div>
      </header>

      {/* Main Core Grid Map */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.5rem', textTransform: 'uppercase' }}>
          Configuring Telemetry Connection Arrays...
        </div>
      ) : (
        <div className="grid-layout">
          {systems.map(sys => {
            const cpuDashArray = 2 * Math.PI * 36;
            const cpuDashOffset = cpuDashArray - (sys.avg_cpu / 100) * cpuDashArray;

            return (
              <div className="cyber-card" key={sys.system_id}>
                <div className="card-header">
                  <div className="card-title">{sys.hostname}</div>
                  <span className="env-tag">{sys.environment}</span>
                </div>

                <div className="gauge-group">
                  {/* Dynamic CPU Gauge Circle */}
                  <div style={{ textAlign: 'center' }}>
                    <div className="metric-radial">
                      <svg className="radial-svg">
                        <circle className="radial-bg" cx="50" cy="50" r="36" />
                        <circle 
                          className="radial-progress" 
                          cx="50" cy="50" r="36" 
                          stroke={getStatusColor(sys.avg_cpu)}
                          strokeDasharray={cpuDashArray}
                          strokeDashoffset={cpuDashOffset}
                        />
                      </svg>
                      <div className="radial-value">{Math.round(sys.avg_cpu)}%</div>
                    </div>
                    <div style={{ marginTop: '0.75rem', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-muted, #8c9bb0)' }}>CPU CORE LOAD</div>
                  </div>

                  {/* Horizontal Linear Memory Meter */}
                  <div style={{ width: '50%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <span style={{ color: '#ffffff' }}>RAM LOAD</span>
                      <span style={{ color: getStatusColor(sys.avg_memory) }}>{Math.round(sys.avg_memory)}%</span>
                    </div>
                    <div className="linear-meter-container">
                      <div 
                        className="linear-meter-bar" 
                        style={{ 
                          width: `${sys.avg_memory}%`, 
                          backgroundColor: getStatusColor(sys.avg_memory),
                          boxShadow: `0 0 10px ${getStatusColor(sys.avg_memory)}`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-Metric Parameters footer */}
                <div className="metrics-footer-grid">
                  <div>
                    NET LATENCY: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{Math.round(sys.avg_latency_ms)} ms</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    PACKETS LOGGED: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{sys.total_data_points}</span>
                  </div>
                </div>

                {/* Local Manual Metric Injector Trigger button inside the card */}
                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-cyber" 
                    style={{ flex: 1, fontSize: '0.8rem', padding: '6px' }}
                    onClick={() => injectMetric(sys.system_id, 88, 79, 115)}
                  >
                    🚀 Push High load
                  </button>
                  <button 
                    className="btn-cyber" 
                    style={{ flex: 1, fontSize: '0.8rem', padding: '6px', borderColor: '#ffaa00', color: '#ffaa00', boxShadow: 'none' }}
                    onClick={() => injectMetric(sys.system_id, 12, 42, 11)}
                  >
                    ❄️ Cool System
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cyberpunk Telemetry Control Terminal Dock */}
      <section className="control-panel">
        <h3 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '1.4rem', color: '#ffffff' }}>
          ⚡ CLUSTER MONITOR CONTROL MODULE
        </h3>
        <p style={{ margin: '0 0 1.25rem 0', color: '#8c9bb0', fontSize: '0.95rem' }}>
          Execute real-time mock telemetry flows or overload spikes to verify network analytics pipeline and database processing logic.
        </p>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            className="btn-cyber"
            onClick={() => setIsSimulating(!isSimulating)}
          >
            {isSimulating ? '🛑 HALT AUTO SIMULATOR' : '▶️ INITIALIZE METRIC STREAM'}
          </button>
          
          <button 
            className="btn-cyber btn-cyber-danger"
            onClick={handleSpikeCluster}
          >
            🔥 OVERLOAD SPIKE CLUSTER (96% LOAD)
          </button>

          <button 
            className="btn-cyber" 
            style={{ borderColor: '#8c9bb0', color: '#8c9bb0', boxShadow: 'none' }}
            onClick={() => setSimulationLogs([])}
            disabled={simulationLogs.length === 0}
          >
            Clear Console
          </button>
        </div>

        {/* Real-Time Terminal Log Printout */}
        <div className="terminal-console">
          {simulationLogs.length === 0 ? (
            <div style={{ color: '#666' }}>[CONSOLE IDLE] Waiting for traffic triggers...</div>
          ) : (
            simulationLogs.map((log, index) => (
              <div className="console-log-row" key={index}>{log}</div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}