import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  PieChart, 
  CreditCard, 
  Bell, 
  Search, 
  Menu,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Cpu,
  X,
  Sun,
  Moon
} from 'lucide-react';

/**
 * UTILITIES & CONSTANTS
 */
const SECTORS = [
  { name: 'Tech', weight: 30 },
  { name: 'Finance', weight: 20 },
  { name: 'Energy', weight: 15 },
  { name: 'Health', weight: 15 },
  { name: 'Consumer', weight: 10 },
  { name: 'Real Estate', weight: 10 },
];

const TICKERS = ['BTC', 'ETH', 'SOL', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'GOOGL'];

// Generates a random walk for chart data
const generateNextPoint = (prevPrice) => {
  const change = (Math.random() - 0.5) * 5;
  return Math.max(0, prevPrice + change);
};

/**
 * COMPONENT: D3 REAL-TIME CHART
 */
const LiveChart = ({ data, color = "#06b6d4" }) => {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);

  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.offsetWidth,
          height: wrapperRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;
    const margin = { top: 20, right: 0, bottom: 20, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.time))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.value) * 0.95, d3.max(data, d => d.value) * 1.05])
      .range([innerHeight, 0]);

    // Area Generator (Gradient Fill)
    const areaGenerator = d3.area()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Line Generator (Stroke)
    const lineGenerator = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define Gradient
    const gradientId = "chartGradient";
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);

    // Draw Area
    g.append("path")
      .datum(data)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", areaGenerator);

    // Draw Line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", lineGenerator)
      .attr("filter", "drop-shadow(0 0 6px rgba(6, 182, 212, 0.5))"); // Neon glow

    // Interactive Cursor Line
    const cursor = g.append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .style("opacity", 0);
    
    // Interaction Rect
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .on("mousemove", (event) => {
        const [x] = d3.pointer(event);
        cursor
          .attr("x1", x)
          .attr("x2", x)
          .style("opacity", 0.5);
      })
      .on("mouseleave", () => {
        cursor.style("opacity", 0);
      });

  }, [data, dimensions, color]);

  return (
    <div ref={wrapperRef} className="w-full h-full min-h-[250px]">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
    </div>
  );
};

/**
 * COMPONENT: HEATMAP TILE
 */
const HeatmapTile = ({ sector, onClick }) => {
  const isPositive = sector.change >= 0;
  // Dynamic opacity based on magnitude of change
  const opacity = Math.min(Math.abs(sector.change) / 5, 0.9) + 0.1; 
  
  return (
    <div 
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden p-4 flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] cursor-pointer group`}
      style={{
        backgroundColor: isPositive 
          ? `rgba(16, 185, 129, ${opacity * 0.2})` 
          : `rgba(244, 63, 94, ${opacity * 0.2})`,
        border: `1px solid ${isPositive ? '#10b98140' : '#f43f5e40'}`
      }}
    >
      <div className="flex justify-between items-start z-10">
        <span className="text-slate-700 dark:text-slate-300 font-medium text-sm tracking-wide transition-colors">{sector.name}</span>
        {isPositive ? (
          <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-rose-500" />
        )}
      </div>
      
      <div className="z-10">
        <div className={`text-xl font-bold font-mono ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
          {sector.change > 0 ? '+' : ''}{sector.change.toFixed(2)}%
        </div>
        <div className="text-xs text-slate-500 mt-1">Vol: {(Math.random() * 10).toFixed(1)}B</div>
      </div>

      {/* Animated Background pulse */}
      <div 
        className={`absolute inset-0 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-300`}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${isPositive ? '#10b981' : '#f43f5e'}, transparent 70%)`
        }} 
      />
    </div>
  );
};

/**
 * COMPONENT: TICKER TAPE
 */
const TickerTape = ({ items }) => (
  <div className="w-full overflow-hidden bg-white/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 backdrop-blur-sm py-2 transition-colors duration-300">
    <div className="flex animate-scroll whitespace-nowrap">
      {[...items, ...items].map((item, i) => ( // Duplicate for seamless loop
        <div key={`${item.symbol}-${i}`} className="inline-flex items-center mx-6">
          <span className="font-bold text-slate-700 dark:text-slate-300 mr-2 transition-colors">{item.symbol}</span>
          <span className={`font-mono text-sm ${item.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
            {item.price.toFixed(2)} ({item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%)
          </span>
        </div>
      ))}
    </div>
    <style>{`
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-scroll {
        animation: scroll 30s linear infinite;
      }
    `}</style>
  </div>
);

/**
 * MAIN APP COMPONENT
 */
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chartData, setChartData] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [tickerData, setTickerData] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(124500.00);
  const [isConnected, setIsConnected] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal & Spam Protection
  const [showDemoModal, setShowDemoModal] = useState(true);
  const [modalContent, setModalContent] = useState({
    title: "UI/UX Showcase",
    body: "Welcome to this demo application. This site simulates a real-time fintech dashboard to demonstrate advanced interface design and React capabilities."
  });
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);

  // Initialize Data
  useEffect(() => {
    // Initial Chart Data (last 50 points)
    const now = Date.now();
    const initData = Array.from({ length: 50 }, (_, i) => ({
      time: new Date(now - (50 - i) * 1000),
      value: 100 + Math.random() * 20
    }));
    setChartData(initData);
    setSectors(SECTORS.map(s => ({ ...s, change: (Math.random() - 0.5) * 4 })));
    setTickerData(TICKERS.map(t => ({ symbol: t, price: 100 + Math.random() * 1000, change: 0 })));
  }, []);

  // Simulate Socket Connection / Live Data Feed
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Chart Data
      setChartData(prev => {
        const lastValue = prev[prev.length - 1].value;
        const newValue = generateNextPoint(lastValue);
        const newTime = new Date();
        const newData = [...prev.slice(1), { time: newTime, value: newValue }];
        setPortfolioValue(pv => pv + (newValue - lastValue) * 100);
        return newData;
      });
      // 2. Update Sectors randomly
      setSectors(prev => prev.map(s => ({ ...s, change: s.change + (Math.random() - 0.5) * 0.2 })));
      // 3. Update Tickers
      setTickerData(prev => prev.map(t => {
        const move = (Math.random() - 0.5) * 2;
        return { ...t, price: t.price + move, change: move };
      }));
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  const totalChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    return ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100;
  }, [chartData]);

  // Centralized Interaction Handler with Guard
  const handleInteraction = (action) => {
    // Execute the original action
    if (action) action();

    // Spam Detection Logic
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount > 4) { // Rule: More than 4 times
        setModalContent({
          title: "Design Demo",
          body: "This site is a demo for UI/UX design showcase."
        });
        setShowDemoModal(true);
        return 0; // Reset count after triggering
      }
      return newCount;
    });

    // Reset spam counter after 1 second of inactivity
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);
  };

  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'market', icon: PieChart, label: 'Market Overview' },
    { id: 'portfolio', icon: CreditCard, label: 'Portfolio' },
    { id: 'ai', icon: Cpu, label: 'AI Analytics' },
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col transition-colors duration-300">
        
        {/* DEMO ALERT MODAL */}
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl dark:shadow-[0_0_50px_rgba(6,182,212,0.15)] relative transition-all">
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center mb-6 ring-1 ring-cyan-500/30">
                  <Zap className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{modalContent.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  {modalContent.body}
                </p>
                <button 
                  onClick={() => setShowDemoModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-semibold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02]"
                >
                  Enter Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => handleInteraction(() => setIsMobileMenuOpen(true))}
              className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none transition-colors">
                FinTech <span className="text-cyan-600 dark:text-cyan-400">Dashboard</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-0.5 hidden sm:block">
                by Meetkumar Patel
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 px-4 py-1.5 w-64 lg:w-96 transition-colors duration-300">
            <Search className="w-4 h-4 text-slate-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-300 w-full placeholder:text-slate-500 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => handleInteraction(() => setIsDarkMode(prev => !prev))}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleInteraction(() => window.open("https://www.meetpatel.me", "_blank"))}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/30 rounded-lg text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wide transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              Visit Portfolio
              <ArrowUpRight className="w-3 h-3" />
            </button>
            
            <button 
              onClick={() => handleInteraction(() => setIsConnected(prev => !prev))}
              className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <Wifi className={`w-3 h-3 ${isConnected ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500'} animate-pulse`} />
              <span className={isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                {isConnected ? 'LIVE' : 'OFF'}
              </span>
            </button>
            <button 
              onClick={() => handleInteraction()}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              MP
            </button>
          </div>
        </header>

        {/* MOBILE MENU OVERLAY */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl animate-in slide-in-from-left-full duration-300">
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Zap className="text-white w-5 h-5 fill-current" />
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">Menu</span>
                </div>
                <button onClick={() => handleInteraction(() => setIsMobileMenuOpen(false))} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleInteraction(() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    })}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200
                      ${activeTab === item.id 
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'}`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-lg font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                 <button 
                  onClick={() => handleInteraction(() => window.open("https://www.meetpatel.me", "_blank"))}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl text-cyan-600 dark:text-cyan-400 text-sm font-bold uppercase tracking-wide"
                >
                  Visit Portfolio
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Total Balance</p>
                  <p className="text-xl font-mono font-bold text-slate-900 dark:text-white mb-1">
                    ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 w-fit px-2 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3" />
                    <span>+2.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="w-20 lg:w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col py-6 transition-colors duration-300">
            <nav className="space-y-2 px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleInteraction(() => setActiveTab(item.id))}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${activeTab === item.id 
                      ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  <span className="hidden lg:block font-medium">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-auto px-6 hidden lg:block">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Total Balance</p>
                <p className="text-xl font-mono font-bold text-slate-900 dark:text-white mb-1">
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 w-fit px-2 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3" />
                  <span>+2.4%</span>
                </div>
              </div>
            </div>
          </aside>

          {/* SCROLLABLE DASHBOARD CONTENT */}
          <main className="flex-1 overflow-y-auto relative scrollbar-hide bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <TickerTape items={tickerData} />

            <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
              
              {/* HERO SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* MAIN CHART CARD */}
                <div className="lg:col-span-8 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 relative overflow-hidden group shadow-sm transition-colors duration-300">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10 gap-4">
                    <div>
                      <h2 className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm uppercase tracking-wider mb-1">Portfolio Performance</h2>
                      <div className="flex flex-wrap items-baseline gap-2 md:gap-4">
                        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                          ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h1>
                        <div className={`flex items-center px-2 py-1 rounded-lg text-xs md:text-sm font-bold ${totalChange >= 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' : 'text-rose-600 dark:text-rose-500 bg-rose-100 dark:bg-rose-500/10'}`}>
                          {totalChange >= 0 ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />}
                          {Math.abs(totalChange).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                      {['1H', '1D', '1W', '1M', '1Y'].map(tf => (
                        <button key={tf} onClick={() => handleInteraction()} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${tf === '1H' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[250px] md:h-[350px] w-full relative z-10">
                    <LiveChart data={chartData} color={isDarkMode ? "#22d3ee" : "#0891b2"} />
                  </div>
                </div>

                {/* QUICK STATS / ORDER BOOK */}
                <div className="lg:col-span-4 grid grid-rows-1 md:grid-rows-2 gap-6">
                  {/* AI Insight Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/20 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[200px] shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[50px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-indigo-800 dark:text-indigo-200 font-medium">AI Sentinel</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        Market volatility detected in Tech sector. Anomaly score: <span className="text-slate-900 dark:text-white font-bold">87/100</span>.
                      </p>
                    </div>
                    <button onClick={() => handleInteraction()} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                      View Analysis <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-6 overflow-hidden flex flex-col min-h-[200px] shadow-sm transition-colors duration-300">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider mb-4">Live Order Flow</h3>
                    <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                      {[1,2,3].map((_, i) => {
                        const isBuy = Math.random() > 0.5;
                        return (
                          <div key={i} onClick={() => handleInteraction()} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${isBuy ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500'} shadow-[0_0_8px_currentColor]`} />
                              <span className="font-bold text-slate-700 dark:text-slate-200">BTC</span>
                            </div>
                            <span className={`font-mono ${isBuy ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
                              {isBuy ? 'BUY' : 'SELL'}
                            </span>
                            <span className="text-slate-500 font-mono">{(Math.random() * 2).toFixed(4)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTOR HEATMAP */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-900 dark:text-slate-200 font-bold text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    Market Heatmap
                  </h3>
                  <button onClick={() => handleInteraction()} className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors">Expand View</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                  {sectors.map((sector) => (
                    <HeatmapTile key={sector.name} sector={sector} onClick={() => handleInteraction()} />
                  ))}
                </div>
              </div>

              {/* ASSET LIST */}
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-900 dark:text-slate-200 font-bold text-lg">Top Assets</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleInteraction()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/50">
                        <th className="pb-3 pl-4">Asset</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">24h</th>
                        <th className="pb-3 hidden md:table-cell">Market Cap</th>
                        <th className="pb-3 hidden md:table-cell">Volume</th>
                        <th className="pb-3 text-right pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                      {tickerData.slice(0, 5).map((asset) => (
                        <tr key={asset.symbol} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                {asset.symbol[0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-700 dark:text-slate-200">{asset.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-mono text-slate-600 dark:text-slate-300 text-sm">
                            ${asset.price.toFixed(2)}
                          </td>
                          <td className="py-4">
                            <div className={`flex items-center font-medium text-sm ${asset.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
                              {asset.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {Math.abs(asset.change).toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-4 text-slate-500 text-sm hidden md:table-cell">
                            ${(asset.price * 0.45).toFixed(1)}B
                          </td>
                          <td className="py-4 text-slate-500 text-sm hidden md:table-cell">
                            ${(Math.random() * 500).toFixed(0)}M
                          </td>
                          <td className="py-4 text-right pr-4">
                            <button onClick={() => handleInteraction()} className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-white transition-all">
                              Trade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;