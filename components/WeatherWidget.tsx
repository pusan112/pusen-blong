
import React, { useState, useEffect } from 'react';
import { blogService } from '../services/gemini';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
  const [reflection, setReflection] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = () => {
      // 模拟天气数据（在实际应用中可调用 OpenWeatherMap 等 API）
      // 这里结合地理位置权限展示逻辑
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // 假设根据经纬度获取到的天气
          const mockWeather = { temp: 22, condition: '清朗' };
          setWeather(mockWeather);
          generateReflection(mockWeather.condition);
        },
        () => {
          const mockWeather = { temp: 18, condition: '多云' };
          setWeather(mockWeather);
          generateReflection(mockWeather.condition);
        }
      );
    };

    const generateReflection = async (condition: string) => {
      try {
        // 使用 Gemini 生成基于天气的短评
        const prompt = `当前天气是 ${condition}，请写一句富有诗意的、关于这种天气的简短感悟（15字以内）。`;
        const result = await blogService.generateDraft(prompt); // 复用 generateDraft 逻辑
        setReflection(result.split('\n')[0]);
      } catch {
        setReflection("风止，心静。");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return null;

  return (
    <div className="inline-flex items-center space-x-4 bg-white/40 backdrop-blur-md border border-white/60 px-5 py-3 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col items-start border-r border-gray-100 pr-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Current</span>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-serif font-black">{weather?.temp}°</span>
          <span className="text-xs text-gray-500">{weather?.condition}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 font-light italic max-w-[120px] leading-tight">
        "{reflection}"
      </p>
    </div>
  );
};

export default WeatherWidget;
