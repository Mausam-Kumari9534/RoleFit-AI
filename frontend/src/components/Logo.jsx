import React from 'react';

export const LogoMark = ({ className = "h-9 w-9" }) => (
  <div className={`relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-sm shadow-slate-900/10 ${className}`}>
    <svg 
      viewBox="0 0 44 44" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="RoleFit AI Logo"
    >
      <defs>
        <linearGradient id="rf-bg-grad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="rf-accent-blue" x1="6" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="rf-accent-violet" x1="12" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      
      {/* Deep Navy rounded container */}
      <rect width="44" height="44" rx="12" fill="url(#rf-bg-grad)" />
      <rect x="0.75" y="0.75" width="42.5" height="42.5" rx="11.25" stroke="#334155" strokeWidth="1.5" strokeOpacity="0.6" />
      
      {/* Foundation Skill Column (Backbone) */}
      <rect x="10" y="10" width="5" height="24" rx="2.5" fill="url(#rf-accent-blue)" />
      
      {/* Intelligent Fit Loop (AI & Role Alignment) */}
      <path 
        d="M13 10.5H23.5C27.0899 10.5 30 13.4101 30 17C30 20.5899 27.0899 23.5 23.5 23.5H13" 
        stroke="url(#rf-accent-violet)" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      
      {/* Career Growth Ascending Trajectory Vector */}
      <path 
        d="M20.5 21L30.5 31" 
        stroke="url(#rf-accent-blue)" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      
      {/* AI Precision Spark Node */}
      <path 
        d="M33 7L33.9 9.6L36.5 10.5L33.9 11.4L33 14L32.1 11.4L29.5 10.5L32.1 9.6L33 7Z" 
        fill="#38BDF8" 
      />
    </svg>
  </div>
);

const Logo = ({ 
  size = "md", 
  showWordmark = true, 
  showTagline = true, 
  tagline = "Career Intelligence",
  className = "" 
}) => {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl"
  };

  const subtextSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-[11px]",
    xl: "text-xs"
  };

  const markSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizes[size] || textSizes.md;
  const subtextSize = subtextSizes[size] || subtextSizes.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markSize} />
      {showWordmark && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 leading-none">
            <span className={`font-extrabold tracking-tight text-[#0F172A] ${textSize}`}>
              RoleFit
            </span>
            <span className={`font-extrabold tracking-tight bg-gradient-to-r from-[#0284C7] to-[#7C3AED] bg-clip-text text-transparent ${textSize}`}>
              AI
            </span>
          </div>
          {showTagline && (
            <span className={`${subtextSize} font-semibold text-[#0284C7] tracking-wider uppercase mt-1`}>
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
