import React, { useEffect, useRef, useState } from 'react';

const StickmanFollower: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [target, setTarget] = useState({ x: -100, y: -100 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [flip, setFlip] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  
  // 行为状态
  const [isJumping, setIsJumping] = useState(false);
  const [isFighting, setIsFighting] = useState(false);
  const [isDizzy, setIsDizzy] = useState(false);
  const [isBerserk, setIsBerserk] = useState(false);
  const [monsters, setMonsters] = useState<{id: number, x: number, y: number}[]>([]);
  
  // 计时器与计数器
  const idleTimerRef = useRef<any>(null);
  const clickCounterRef = useRef<number>(0);
  const clickTimerRef = useRef<any>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const phaseRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTarget({ x: e.clientX, y: e.clientY });
      
      // 速度检测
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      if (speed > 80 && !isBerserk) {
        setIsDizzy(true);
        setTimeout(() => setIsDizzy(false), 1500);
      }
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      // 静止检测重置
      setIsFighting(false);
      setMonsters([]);
      clearTimeout(idleTimerRef.current);
      if (!isBerserk) {
        idleTimerRef.current = setTimeout(() => {
          setIsFighting(true);
          // 生成随机小怪
          const newMonsters = [...Array(3)].map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 60
          }));
          setMonsters(newMonsters);
        }, 5000);
      }
    };
    
    const handleMouseDown = () => {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);

      // 连击检测
      clickCounterRef.current += 1;
      clearTimeout(clickTimerRef.current);
      
      if (clickCounterRef.current >= 5) {
        triggerBerserk();
      } else {
        clickTimerRef.current = setTimeout(() => {
          clickCounterRef.current = 0;
        }, 2000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      clearTimeout(idleTimerRef.current);
      clearTimeout(clickTimerRef.current);
    };
  }, [isBerserk]);

  const triggerBerserk = () => {
    setIsBerserk(true);
    clickCounterRef.current = 0;
    document.body.classList.add('berserk-active');
    
    setTimeout(() => {
      setIsBerserk(false);
      document.body.classList.remove('berserk-active');
    }, 5000);
  };

  useEffect(() => {
    let animationFrame: number;
    
    const update = () => {
      setPos(current => {
        // 如果正在眩晕，不跟随
        if (isDizzy && !isBerserk) return current;

        const dx = target.x - current.x;
        const dy = (target.y - 40) - current.y;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        // 暴走模式速度极快
        const maxSpeed = isBerserk ? 25 : 12;
        const speed = Math.min(dist * (isBerserk ? 0.2 : 0.1), maxSpeed);
        
        let nx = current.x;
        let ny = current.y;
        
        if (dist > 5) {
          const vx = (dx / dist) * speed;
          const vy = (dy / dist) * speed;
          nx += vx;
          ny += vy;
          
          if (Math.abs(vx) > 0.5) {
            setFlip(vx > 0 ? 1 : -1);
            setIsRunning(true);
          }
        } else {
          setIsRunning(false);
        }

        // 步频调整
        const phaseIncrement = isBerserk ? 0.4 : isRunning ? 0.15 : 0.05;
        phaseRef.current += phaseIncrement;

        return { x: nx, y: ny };
      });
      
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, isRunning, isDizzy, isBerserk]);

  // 计算关节位置
  const p = phaseRef.current;
  const leg1 = Math.sin(p) * 15;
  const leg2 = Math.sin(p + Math.PI) * 15;
  const arm1 = Math.cos(p) * 10;
  const arm2 = Math.cos(p + Math.PI) * 10;
  
  // 身体起伏
  const bounce = isRunning ? Math.abs(Math.cos(p * 2)) * 4 : Math.sin(p) * 1;
  const jumpY = isJumping ? -20 : 0;
  
  // 眩晕时的震颤
  const dizzyOffset = isDizzy ? Math.sin(Date.now() * 0.1) * 5 : 0;

  // 战斗动作 - 挥剑
  const swordRotation = isFighting ? Math.sin(Date.now() * 0.01) * 120 : 0;

  return (
    <div 
      className={`fixed pointer-events-none z-[200] transition-all duration-300 ${isBerserk ? 'scale-125' : ''}`}
      style={{ 
        left: pos.x + dizzyOffset, 
        top: pos.y + bounce + jumpY,
        opacity: pos.x < 0 ? 0 : 1,
        transform: `translateX(-50%) translateY(-100%) scaleX(${flip})`
      }}
    >
      <svg width="100" height="120" viewBox="0 0 100 120" className="overflow-visible">
        <defs>
          <filter id="stickmanGlow">
            <feGaussianBlur stdDeviation={isBerserk ? "3" : "1.5"} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="swordGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="berserkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="100%" stopColor="#ff6b6b" />
          </linearGradient>
        </defs>
        
        <g 
          stroke={isBerserk ? "#ff0000" : isFighting ? "#4c1d95" : "#2d2a2e"} 
          strokeWidth={isBerserk ? "4" : "2.5"} 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#stickmanGlow)"
        >
          {/* 眩晕特效：头顶星星 */}
          {isDizzy && (
            <g className="animate-star-rotate origin-[50px_15px]">
              <path d="M42,5 L44,9 L48,9 L45,11 L46,15 L42,13 L38,15 L39,11 L36,9 L40,9 Z" fill="#fbbf24" stroke="none" transform="translate(0, -10)" />
              <path d="M58,5 L60,9 L64,9 L61,11 L62,15 L58,13 L54,15 L55,11 L52,9 L56,9 Z" fill="#fbbf24" stroke="none" transform="translate(0, -10)" />
            </g>
          )}

          {/* 头部 */}
          <circle 
            cx="50" cy="35" r="8" 
            className={`${isDizzy ? 'animate-bounce' : ''}`} 
            style={{ transform: isRunning ? 'translateX(2px)' : 'none' }} 
          />
          
          {/* 躯干 */}
          <line x1="50" y1="43" x2="50" y2="75" />
          
          {/* 手臂 */}
          <line x1="50" y1="52" x2={50 + arm1 + (isRunning ? 15 : 0)} y2={65 + arm1} />
          <line x1="50" y1="52" x2={50 + arm2 - (isRunning ? 8 : 0)} y2={65 + arm2} />
          
          {/* 腿部 */}
          <path d={`M50 75 L${50 + leg1} ${95 + Math.max(0, leg1/2)} L${50 + leg1 + (isRunning ? 8 : 0)} 110`} />
          <path d={`M50 75 L${50 + leg2} ${95 + Math.max(0, leg2/2)} L${50 + leg2 + (isRunning ? 8 : 0)} 110`} />
          
          {/* 武器：大宝剑 */}
          {(isFighting || isBerserk) && (
            <g transform={`translate(50, 52) rotate(${swordRotation + (isBerserk ? 45 : 0)})`}>
              <path 
                d="M 0 0 L 40 -40 L 45 -35 L 5 -5 Z" 
                fill={isBerserk ? "url(#berserkGradient)" : "url(#swordGradient)"} 
                stroke={isBerserk ? "#ff0000" : "#8b5cf6"}
                strokeWidth="2"
                className="animate-pulse"
              />
              <path d="M 0 0 L 10 10 M -5 5 L 5 -5" strokeWidth="3" />
            </g>
          )}

          {/* 暴走红色闪电特效 */}
          {isBerserk && (
            <g opacity="0.8">
              <path d="M30,40 L20,30 L25,30 L15,15" stroke="#ff0000" strokeWidth="2" className="animate-pulse" />
              <path d="M70,40 L80,30 L75,30 L85,15" stroke="#ff0000" strokeWidth="2" className="animate-pulse" />
            </g>
          )}

          {/* 动态修饰：风迹 */}
          {isRunning && (
            <g opacity="0.3" strokeDasharray="2,4">
               <line x1="20" y1="55" x2="10" y2="55" />
               <line x1="25" y1="75" x2="15" y2="75" />
            </g>
          )}
        </g>

        {/* 战斗模式：渲染小怪 */}
        {isFighting && monsters.map(m => (
          <g key={m.id} transform={`translate(${50 + m.x}, ${52 + m.y})`} className="animate-bounce">
            <circle r="4" fill="#2d2a2e" opacity="0.6" />
            <circle r="2" fill="#ff0000" transform="translate(-1, -1)" />
          </g>
        ))}
        
        {/* 交互反馈 */}
        {isJumping && (
          <circle cx="50" cy="70" r="35" stroke={isBerserk ? "#ff0000" : "#8b5cf6"} strokeWidth="1" fill="none" className="animate-ping opacity-20" />
        )}
      </svg>
      
      {/* 暴走模式地裂碎片 */}
      {isBerserk && isRunning && (
        <div className="absolute bottom-0 left-1/2 w-4 h-1 bg-red-600/40 rounded-full animate-bounce"></div>
      )}
    </div>
  );
};

export default StickmanFollower;