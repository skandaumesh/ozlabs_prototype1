'use client';

import { useState, useEffect } from 'react';
import { AnimatedCard } from '@/components/ui/Motion';
import { Camera, Globe, Users, Eye, MousePointerClick, ArrowUpRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Realistic mock data generation
const generateInstagramData = () => {
  const data = [];
  let baseFollowers = 10420;
  let baseReach = 2100;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate some organic variance
    const dailyFollowerChange = Math.floor(Math.random() * 15) - 2;
    baseFollowers += dailyFollowerChange;
    
    const dailyReachChange = Math.floor(Math.random() * 800) - 400;
    const todayReach = Math.max(500, baseReach + dailyReachChange);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      followers: baseFollowers,
      reach: todayReach
    });
  }
  return data;
};

const generateWebsiteData = () => {
  const data = [];
  let baseVisitors = 350;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Weekend dip simulation
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dailyChange = Math.floor(Math.random() * 100) - 50;
    const todayVisitors = Math.max(50, isWeekend ? baseVisitors * 0.6 + dailyChange : baseVisitors + dailyChange);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: Math.floor(todayVisitors),
      pageViews: Math.floor(todayVisitors * (1.5 + Math.random()))
    });
  }
  return data;
};

export default function AnalyticsClient({ socialProfile }) {
  const [isMounted, setIsMounted] = useState(false);
  const [igData, setIgData] = useState([]);
  const [webData, setWebData] = useState([]);

  useEffect(() => {
    setIsMounted(true);
    setIgData(generateInstagramData());
    setWebData(generateWebsiteData());
  }, []);

  if (!isMounted) return <div className="h-96 flex items-center justify-center text-[rgba(255,255,255,0.55)]">Loading Analytics...</div>;

  const hasInstagram = !!socialProfile?.instagramUrl;
  const hasWebsite = !!socialProfile?.websiteUrl;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[rgba(28,28,32,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] p-3 rounded-xl shadow-2xl">
          <p className="text-[rgba(255,255,255,0.55)] text-xs mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm font-semibold text-white">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}: {entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* INSTAGRAM DASHBOARD */}
      <AnimatedCard delay={0.1} className="glass p-6 md:p-8 rounded-[24px]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-serif text-white tracking-[-0.5px] flex items-center mb-1">
              <Camera size={20} className="mr-2 text-[#E1306C]" />
              Instagram Growth
            </h2>
            {hasInstagram ? (
              <a href={socialProfile.instagramUrl} target="_blank" rel="noreferrer" className="text-xs text-[#0a84ff] hover:underline flex items-center">
                {socialProfile.instagramUrl.replace(/^https?:\/\/(www\.)?/, '')}
                <ArrowUpRight size={12} className="ml-1" />
              </a>
            ) : (
              <p className="text-xs text-[rgba(255,255,255,0.4)]">Not Connected</p>
            )}
          </div>
          <span className="text-xs bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-full font-medium text-[rgba(255,255,255,0.7)] border border-[rgba(255,255,255,0.05)]">
            Last 30 Days
          </span>
        </div>

        {hasInstagram ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4">
                <div className="flex items-center text-[rgba(255,255,255,0.55)] text-sm mb-2">
                  <Users size={16} className="mr-2" />
                  Followers
                </div>
                <div className="text-3xl font-semibold text-white">{igData[igData.length - 1]?.followers.toLocaleString()}</div>
                <div className="text-xs text-[#30d158] mt-2 flex items-center font-medium">
                  <TrendingUp size={12} className="mr-1" />
                  +{igData[igData.length - 1]?.followers - igData[0]?.followers} this month
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4">
                <div className="flex items-center text-[rgba(255,255,255,0.55)] text-sm mb-2">
                  <Eye size={16} className="mr-2" />
                  Total Reach
                </div>
                <div className="text-3xl font-semibold text-white">
                  {igData.reduce((acc, curr) => acc + curr.reach, 0).toLocaleString()}
                </div>
                <div className="text-xs text-[rgba(255,255,255,0.55)] mt-2 font-medium">
                  Across all posts & reels
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={igData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E1306C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E1306C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="reach" name="Reach" stroke="#E1306C" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.05)] border-dashed">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <Camera size={24} className="text-[rgba(255,255,255,0.3)]" />
            </div>
            <p className="text-[rgba(255,255,255,0.55)] font-medium">No Instagram Account Connected</p>
            <p className="text-sm text-[rgba(255,255,255,0.3)] mt-2">Contact Admin to connect your profile</p>
          </div>
        )}
      </AnimatedCard>

      {/* WEBSITE DASHBOARD */}
      <AnimatedCard delay={0.2} className="glass p-6 md:p-8 rounded-[24px]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-serif text-white tracking-[-0.5px] flex items-center mb-1">
              <Globe size={20} className="mr-2 text-[#0a84ff]" />
              Website Traffic
            </h2>
            {hasWebsite ? (
              <a href={socialProfile.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-[#0a84ff] hover:underline flex items-center">
                {socialProfile.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                <ArrowUpRight size={12} className="ml-1" />
              </a>
            ) : (
              <p className="text-xs text-[rgba(255,255,255,0.4)]">Not Connected</p>
            )}
          </div>
          <span className="text-xs bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-full font-medium text-[rgba(255,255,255,0.7)] border border-[rgba(255,255,255,0.05)]">
            Last 30 Days
          </span>
        </div>

        {hasWebsite ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4">
                <div className="flex items-center text-[rgba(255,255,255,0.55)] text-sm mb-2">
                  <Users size={16} className="mr-2" />
                  Unique Visitors
                </div>
                <div className="text-3xl font-semibold text-white">
                  {webData.reduce((acc, curr) => acc + curr.visitors, 0).toLocaleString()}
                </div>
                <div className="text-xs text-[#30d158] mt-2 flex items-center font-medium">
                  <TrendingUp size={12} className="mr-1" />
                  +14% vs last month
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4">
                <div className="flex items-center text-[rgba(255,255,255,0.55)] text-sm mb-2">
                  <MousePointerClick size={16} className="mr-2" />
                  Page Views
                </div>
                <div className="text-3xl font-semibold text-white">
                  {webData.reduce((acc, curr) => acc + curr.pageViews, 0).toLocaleString()}
                </div>
                <div className="text-xs text-[#30d158] mt-2 flex items-center font-medium">
                  <TrendingUp size={12} className="mr-1" />
                  +22% vs last month
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={webData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="visitors" name="Visitors" fill="#0a84ff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.05)] border-dashed">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <Globe size={24} className="text-[rgba(255,255,255,0.3)]" />
            </div>
            <p className="text-[rgba(255,255,255,0.55)] font-medium">No Website Connected</p>
            <p className="text-sm text-[rgba(255,255,255,0.3)] mt-2">Contact Admin to connect your URL</p>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
