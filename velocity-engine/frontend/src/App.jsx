import { useState, useEffect } from 'react';

export default function App() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('https://velocity-backend-fdwh.onrender.com/api/metrics/analytics');
      if (!response.ok) throw new Error('Telemetry link exception.');
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

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000); // Polls every 3s matching the backend harvester
    return () => clearInterval(interval);
  }, []);

  const getSystemStatus = (cpu, mem) => {
    if (cpu >= 85 || mem >= 85) return { label: 'CRITICAL', color: '#ff3e3e', class: 'cyber-card-critical' };
    if (cpu >= 60 || mem >= 60) return { label: 'WARNING', color: '#ffaa00', class: 'cyber-card-warning' };
    return { label: 'NOMINAL', color: '#00ffcc', class: '' };
  };

  const isClusterInCrisis = systems.some(sys => parseFloat(sys.avg_cpu) >= 85 || parseFloat(sys.avg_memory) >= 85);

  useEffect(() => {
    const styleId = "velocity-production-cyber-styles";
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
        background-image: linear-gradient(rgba(18, 24, 38, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 24, 38, 0.4) 1px, transparent 1px);
        background-size: 30px 30px;
      }
      .pulse-indicator { width: 10px; height: 10px; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px currentColor; animation: pulseAnimation 1.5s infinite alternate; }
      @keyframes pulseAnimation { 0% { transform: scale(0.9); opacity: 0.6; } 100% { transform: scale(1.2); opacity: 1; } }
      .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
      .cyber-header { border-bottom: 2px solid #1a2233; padding-bottom: 1.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
      .cyber-title { font-size: 2.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; background: linear-gradient(90deg, #00ffcc, #45f3ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
      .crisis-banner { background: rgba(255, 62, 62, 0.15); border: 1px solid #ff3e3e; color: #ff3e3e; padding: 12px; border-radius: 6px; margin-bottom: 1.5rem; font-family: 'Share Tech Mono', monospace; font-weight: bold; animation: bannerFlash 0.8s infinite alternate; }
      @keyframes bannerFlash { 0% { background: rgba(255, 62, 62, 0.05); } 100% { background: rgba(255, 62, 62, 0.25); } }
      .grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
      .cyber-card { background-color: #0f121d; border: 1px solid #1a233d; border-radius: 12px; padding: 1.5rem; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
      .cyber-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #00ffcc, transparent); }
      .cyber-card-warning { border-color: #ffaa00 !important; }
      .cyber-card-warning::before { background: linear-gradient(90deg, #ffaa00, transparent) !important; }
      .cyber-card-critical { border-color: #ff3e3e !important; animation: cardSiren 1s infinite alternate; }
      .cyber-card-critical::before { background: linear-gradient(90deg, #ff3e3e, transparent) !important; }
      @keyframes cardSiren { 0% { box-shadow: 0 4px 20px rgba(0,0,0,0.5); } 100% { box-shadow: 0 0 25px rgba(255, 62, 62, 0.3); } }
      .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1c2642; padding-bottom: 0.75rem; margin-bottom: 1rem; }
      .card-title { font-size: 1.35rem; font-weight: 700; text-transform: uppercase; color: #ffffff; }
      .status-tag { font-family: 'Share Tech Mono', monospace; font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
      .gauge-group { display: flex; justify-content: space-around; align-items: center; margin: 1.5rem 0; }
      .metric-radial { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; }
      .radial-svg { transform: rotate(-90deg); width: 100%; height: 100%; }
      .radial-bg { fill: none; stroke: #161a29; stroke-width: 8; }
      .radial-progress { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.4s ease-in-out; }
      .radial-value { position: absolute; font-family: 'Share Tech Mono', monospace; font-size: 1.25rem; font-weight: bold; color: #ffffff; }
      .linear-meter-container { background-color: #121624; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 6px; }
      .linear-meter-bar { height: 100%; border-radius: 4px; transition: width 0.4s ease-in-out; }
      .metrics-footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-family: 'Share Tech Mono', monospace; font-size: 0.9rem; border-top: 1px solid #1c2642; padding-top: 0.75rem; color: #8c9bb0; }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="cyber-header">
        <div>
          <h1 className="cyber-title">// VELOCITY_MONITOR_CENTER</h1>
          <p style={{ margin: '5px 0 0 0', color: '#8c9bb0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Telemetry Node: <span style={{ color: '#ffffff' }}>Bare_Metal_Host</span>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span className="pulse-indicator" style={{ color: isClusterInCrisis ? '#ff3e3e' : '#00ffcc' }}></span>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', color: isClusterInCrisis ? '#ff3e3e' : '#ffffff' }}>
            {isClusterInCrisis ? '⚠️ HOST HARDWARE BREACH' : 'Hardware Telemetry Operational'}
          </span>
        </div>
      </header>

      {error && (
        <div style={{ backgroundColor: '#ff3e3e20', color: '#ff3e3e', border: '1px solid #ff3e3e', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontFamily: 'Share Tech Mono' }}>
          {error}
        </div>
      )}

      {isClusterInCrisis && (
        <div className="crisis-banner">
          🚨 CRITICAL COMPUTE LOAD ALERT: Your local processing hardware is heavily loaded. Optimize executing host tasks.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.5rem', textTransform: 'uppercase' }}>
          Configuring Real OS Telemetry Channels...
        </div>
      ) : (
        <div className="grid-layout">
          {systems.map(sys => {
            const cpu = parseFloat(sys.avg_cpu);
            const mem = parseFloat(sys.avg_memory);
            const status = getSystemStatus(cpu, mem);

            const cpuDashArray = 2 * Math.PI * 36;
            const cpuDashOffset = cpuDashArray - (cpu / 100) * cpuDashArray;

            return (
              <div className={`cyber-card ${status.class}`} key={sys.system_id}>
                <div className="card-header">
                  <div className="card-title">{sys.hostname}</div>
                  <span className="status-tag" style={{ border: `1px solid ${status.color}`, color: status.color, backgroundColor: `${status.color}10` }}>
                    {status.label}
                  </span>
                </div>

                <div className="gauge-group">
                  <div style={{ textAlign: 'center' }}>
                    <div className="metric-radial">
                      <svg className="radial-svg">
                        <circle className="radial-bg" cx="50" cy="50" r="36" />
                        <circle 
                          className="radial-progress" 
                          cx="50" cy="50" r="36" 
                          stroke={status.color}
                          strokeDasharray={cpuDashArray}
                          strokeDashoffset={cpuDashOffset}
                        />
                      </svg>
                      <div className="radial-value">{Math.round(cpu)}%</div>
                    </div>
                    <div style={{ marginTop: '0.75rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#8c9bb0' }}>REAL CPU LOAD</div>
                  </div>

                  <div style={{ width: '50%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <span style={{ color: '#ffffff' }}>HOST RAM</span>
                      <span style={{ color: status.color }}>{Math.round(mem)}%</span>
                    </div>
                    <div className="linear-meter-container">
                      <div 
                        className="linear-meter-bar" 
                        style={{ 
                          width: `${mem}%`, 
                          backgroundColor: status.color,
                          boxShadow: `0 0 10px ${status.color}`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="metrics-footer-grid">
                  <div>
                    I/O LATENCY: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{Math.round(sys.avg_latency_ms)} ms</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    METRICS POOLED: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{sys.total_data_points}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
