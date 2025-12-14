import React, { useState, useEffect, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { extractCharacterData, generateTokenImage, ActorType } from './services/geminiService';
import { CoC7Actor } from './types';

// Reference JSON schema for the AI (kept for skill structure reference)
const REFERENCE_JSON_STRING = `{
  "name": "Reference",
  "items": [
    {
      "_id": "0o5KdLodDybNcIve",
      "name": "Skill Name",
      "type": "skill",
      "system": {
        "skillName": "Base Name",
        "value": 50
      }
    }
  ]
}`;

// --- Internal Components ---

const MysteriousRunes: React.FC = () => {
  const runes = useMemo(() => {
    const chars = "ᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ⚡☾⚝⚛👁";
    const items = [];
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        char: chars[Math.floor(Math.random() * chars.length)],
        left: `${Math.random() * 90 + 5}%`,
        top: `${Math.random() * 90 + 5}%`,
        delay: `${Math.random() * 3}s`,
        size: `${Math.random() * 2 + 1}rem`
      });
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {runes.map((rune) => (
        <div
          key={rune.id}
          className="absolute rune-animation text-emerald-500/60 font-serif select-none"
          style={{
            left: rune.left,
            top: rune.top,
            fontSize: rune.size,
            animationDelay: rune.delay
          }}
        >
          {rune.char}
        </div>
      ))}
    </div>
  );
};

// --- Custom Icons (Detailed Lovecraftian) ---

const IconInvestigator = () => (
  <svg className="w-32 h-32 text-emerald-500 transition-all duration-500 filter drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'rgb(16, 185, 129)', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'rgb(6, 78, 59)', stopOpacity:1}} />
      </linearGradient>
    </defs>
    {/* Fedora Hat */}
    <path d="M20,40 Q50,30 80,40 L85,45 L15,45 Z" fillOpacity="0.8" />
    <path d="M25,40 L25,25 Q50,15 75,25 L75,40" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M10,45 Q50,55 90,45 L95,48 Q50,60 5,48 Z" fillOpacity="0.9" />
    
    {/* Magnifying Glass */}
    <circle cx="65" cy="65" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M78,78 L90,90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="65" cy="65" r="15" fill="currentColor" fillOpacity="0.2" />
    <path d="M60,60 L70,70 M70,60 L60,70" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
    
    {/* Revolver Silhouette behind */}
    <path d="M10,80 L20,60 L45,60 L45,68 L25,68 L25,85 Z" fillOpacity="0.6" />
    <rect x="45" y="60" width="20" height="8" rx="1" fillOpacity="0.6" />
    <rect x="65" y="62" width="15" height="4" fillOpacity="0.6" />
  </svg>
);

const IconCultist = () => (
  <svg className="w-32 h-32 text-emerald-500 transition-all duration-500 filter drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
    {/* Hooded Robe Shape */}
    <path d="M50,10 Q20,10 20,40 L10,90 L90,90 L80,40 Q80,10 50,10 Z" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    
    {/* Hood opening / Void face */}
    <path d="M50,15 Q30,15 30,45 Q50,35 70,45 Q70,15 50,15 Z" fill="black" fillOpacity="0.6" />
    
    {/* Glowing Eyes */}
    <circle cx="42" cy="35" r="2" fill="#34d399" className="animate-pulse" />
    <circle cx="58" cy="35" r="2" fill="#34d399" className="animate-pulse" />
    
    {/* Shoulders/Drapery */}
    <path d="M20,40 Q10,50 10,90 M80,40 Q90,50 90,90" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M30,90 Q50,80 70,90" fill="none" stroke="currentColor" strokeWidth="1" />
    
    {/* Amulet */}
    <path d="M50,55 L50,75 M40,60 L60,60" stroke="currentColor" strokeWidth="1" />
    <circle cx="50" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconCreature = () => (
  <svg className="w-32 h-32 text-emerald-500 transition-all duration-500 filter drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
    {/* Bulbous Head */}
    <path d="M30,30 Q50,0 70,30 Q80,40 75,55" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M25,55 Q20,40 30,30" fill="none" stroke="currentColor" strokeWidth="2" />
    
    {/* Many Eyes */}
    <circle cx="40" cy="35" r="3" fill="currentColor" />
    <circle cx="60" cy="35" r="3" fill="currentColor" />
    <circle cx="50" cy="25" r="2" fill="currentColor" />
    <circle cx="30" cy="45" r="1.5" fill="currentColor" />
    <circle cx="70" cy="45" r="1.5" fill="currentColor" />
    
    {/* Tentacles */}
    <path d="M25,55 Q10,70 20,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M35,55 Q30,80 40,95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50,55 Q50,85 50,95" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M65,55 Q70,80 60,95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M75,55 Q90,70 80,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    
    {/* Texture dots */}
    <circle cx="45" cy="15" r="1" fillOpacity="0.5" />
    <circle cx="55" cy="18" r="1" fillOpacity="0.5" />
    <circle cx="65" cy="25" r="1" fillOpacity="0.5" />
  </svg>
);

const TypeCard = ({ type, label, icon, desc, onClick }: { type: ActorType, label: string, icon: React.ReactNode, desc: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="relative flex flex-col items-center p-8 bg-black/40 backdrop-blur-md border border-emerald-900/30 hover:border-emerald-500/50 rounded-2xl transition-all duration-500 hover:bg-black/70 hover:scale-105 group overflow-hidden shadow-xl"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-black/80 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="mb-6 z-10 transform group-hover:-translate-y-2 transition-transform duration-500">{icon}</div>
    <h3 className="text-xl font-bold text-emerald-100 mb-2 z-10 tracking-widest uppercase font-scary drop-shadow-md">{label}</h3>
    <p className="text-sm text-gray-400 text-center z-10 group-hover:text-emerald-200 transition-colors font-serif border-t border-emerald-900/30 pt-3 mt-1">{desc}</p>
  </button>
);

// --- Main App ---

const App: React.FC = () => {
  const [actorType, setActorType] = useState<ActorType | null>(null);
  const [sheetFiles, setSheetFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [resultJson, setResultJson] = useState<CoC7Actor | null>(null);
  const [generatedTokenUrl, setGeneratedTokenUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Parallax state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Smoother, smaller movement
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve({ data: base64, mimeType: file.type });
        } else {
          reject(new Error("Failed to convert file"));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const processData = async () => {
    if (sheetFiles.length === 0 || !actorType) return;

    setIsLoading(true);
    setError(null);
    setResultJson(null);
    setGeneratedTokenUrl(null);

    try {
      // 1. Extract JSON
      setLoadingStep("РАСШИФРОВКА РУН (Оцифровка)...");
      
      const filePromises = sheetFiles.map(fileToBase64);
      const filesData = await Promise.all(filePromises);

      const actorData = await extractCharacterData(filesData, REFERENCE_JSON_STRING, actorType);
      setResultJson(actorData);

      // 2. Generate Token
      setLoadingStep("ПРИЗЫВ СУЩНОСТИ (Генерация токена)...");
      
      let description = "";
      if (actorData.system.biography) {
         description = actorData.system.biography;
      } else if (actorType === 'creature') {
         description = `${actorData.name} - Lovecraftian monster. ${actorData.system.infos?.type || ''}. Terrible appearance.`;
      } else {
         description = `${actorData.system.infos.occupation || 'Character'} ${actorData.system.infos.sex || ''}, age ${actorData.system.infos.age || 'unknown'}. 1920s era.`;
      }

      // Truncate description for image gen if too long
      const promptDescription = description.length > 300 ? description.substring(0, 300) : description;
      
      const rawTokenBase64 = await generateTokenImage(promptDescription, actorType);
      
      // 3. Process Token
      await processAndSetToken(rawTokenBase64);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Произошла непредвиденная ошибка.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const processAndSetToken = (base64Data: string) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = `data:image/png;base64,${base64Data}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, size, size);

        // Circular Clip
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw Image
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size / 2) - (img.width / 2) * scale;
        const y = (size / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Effects
        // Vignette
        const gradient = ctx.createRadialGradient(size/2, size/2, size/3, size/2, size/2, size/2);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.7, "rgba(10,10,10,0.3)");
        gradient.addColorStop(1, "rgba(0,0,0,0.8)");
        ctx.fillStyle = gradient;
        ctx.fill();

        // Token Border
        ctx.strokeStyle = actorType === 'creature' ? '#4a4a4a' : '#2f2f2f'; // Darker grey for monsters
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner thin line
        ctx.strokeStyle = actorType === 'creature' ? '#800000' : '#d4af37'; // Red for monsters, gold for humans
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
        ctx.stroke();

        setGeneratedTokenUrl(canvas.toDataURL('image/png'));
        resolve();
      };
    });
  };

  const handleDownloadJson = () => {
    if (!resultJson) return;
    const blob = new Blob([JSON.stringify(resultJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resultJson.name || 'character'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadToken = () => {
    if (!generatedTokenUrl) return;
    const link = document.createElement('a');
    link.href = generatedTokenUrl;
    link.download = `${resultJson?.name || 'token'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setResultJson(null);
    setSheetFiles([]);
    setActorType(null);
    setGeneratedTokenUrl(null);
  }

  // Handle accumulation of files instead of replacement
  const handleFileSelect = (files: File[]) => {
    setSheetFiles(prev => [...prev, ...files]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-gray-200 font-sans selection:bg-emerald-900 selection:text-white">
      
      {/* --- Background Stack (Fixed position to prevent scroll issues) --- */}
      
      {/* 1. Background Image - Blurred Wet Glass */}
      <div 
        className="fixed inset-[-50px] z-0 bg-cover bg-center transition-transform duration-100 ease-out"
        style={{
          // Rain drops on window with bokeh city lights
          backgroundImage: "url('https://images.unsplash.com/photo-1496034663057-6245f11be793?q=80&w=2670&auto=format&fit=crop')",
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          // Filter: Blur for depth, hue-rotate for Lovecraftian teal/blue tint, brightness down for mood
          filter: 'blur(3px) brightness(0.5) contrast(1.1) hue-rotate(180deg)'
        }}
      />

      {/* 2. Semi-transparent Overlay to unify tone */}
      <div className="fixed inset-0 z-0 bg-black/30 pointer-events-none mix-blend-multiply" />
      
      {/* 3. Noise Texture */}
      <div className="fixed inset-0 z-0 bg-noise opacity-20 pointer-events-none" />

      {/* 4. Mysterious Glowing Runes */}
      {isLoading && <MysteriousRunes />}

      {/* --- Main Content --- */}
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center min-h-screen">
        <header className="mb-8 text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-scary text-emerald-500 tracking-[0.1em] drop-shadow-[0_4px_10px_rgba(16,185,129,0.3)] pb-4 inline-block border-b border-emerald-900/50">
            АРХИВЫ <span className="text-gray-400">АРКХЕМА</span>
          </h1>
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-gray-400 font-serif italic text-lg tracking-wider">
              "Цифровой ритуал переноса душ"
            </p>
            <p className="text-sm text-gray-300 font-light leading-relaxed drop-shadow-md">
              Автоматическая конвертация листов персонажей (PDF, Фото, Скриншоты) в формат <strong className="text-emerald-400">Foundry VTT (v11)</strong>. 
              Загрузите изображение, и ритуал создаст готовый JSON-файл актера и уникальный токен.
            </p>
          </div>
        </header>

        {/* Card Container - Glassmorphism */}
        <div className="w-full max-w-5xl bg-gray-900/60 backdrop-blur-2xl border border-white/5 p-10 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Decorative Corner Borders */}
          <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-emerald-800/60 pointer-events-none rounded-tl-xl" />
          <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-emerald-800/60 pointer-events-none rounded-tr-xl" />
          <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-emerald-800/60 pointer-events-none rounded-bl-xl" />
          <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-emerald-800/60 pointer-events-none rounded-br-xl" />

          {/* Step 0: Select Type */}
          {!actorType && (
             <div className="animate-fade-in space-y-8">
                <h2 className="text-2xl text-center font-bold text-gray-300 mb-8 border-b border-gray-800 pb-4 tracking-widest uppercase font-scary">Выберите сущность для призыва</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                  <TypeCard 
                    type="character" 
                    label="Сыщик" 
                    icon={<IconInvestigator />}
                    desc="Классический лист персонажа 7-й редакции." 
                    onClick={() => setActorType('character')}
                  />
                  <TypeCard 
                    type="npc" 
                    label="NPC" 
                    icon={<IconCultist />}
                    desc="Персонаж Хранителя или важный союзник." 
                    onClick={() => setActorType('npc')}
                  />
                  <TypeCard 
                    type="creature" 
                    label="Чудовище" 
                    icon={<IconCreature />}
                    desc="Мифологическое создание или монстр." 
                    onClick={() => setActorType('creature')}
                  />
                </div>
             </div>
          )}

          {/* Step 1: Upload */}
          {actorType && !resultJson && !isLoading && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                 <button onClick={() => setActorType(null)} className="text-gray-500 hover:text-emerald-500 text-sm flex items-center transition-colors group">
                   <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> ВЕРНУТЬСЯ
                 </button>
                 <span className="text-emerald-700 font-bold tracking-[0.2em] uppercase text-sm border border-emerald-900/50 px-3 py-1 rounded bg-black/40">{actorType === 'character' ? 'Сыщик' : actorType === 'npc' ? 'NPC' : 'Чудовище'}</span>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-200 uppercase tracking-widest font-scary">Материалы дела</h2>
                <p className="text-sm text-gray-500 font-serif italic">Загрузите страницы чарника или вставьте из буфера обмена (Ctrl+V)</p>
              </div>
              
              <div className="max-w-2xl mx-auto w-full">
                <FileUpload
                  accept="image/*,application/pdf"
                  label={sheetFiles.length > 0 ? `Добавлено страниц: ${sheetFiles.length}` : "Перетащите файлы сюда"}
                  onFileSelect={handleFileSelect}
                />
              </div>

              {sheetFiles.length > 0 && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {sheetFiles.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700 truncate max-w-[200px]">
                        {f.name}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={processData}
                    className="w-full py-4 text-xl font-bold text-black bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.99] border border-emerald-500/50 uppercase tracking-widest"
                  >
                    НАЧАТЬ РИТУАЛ
                  </button>
                  <button 
                    onClick={() => setSheetFiles([])}
                    className="w-full text-xs text-red-900 hover:text-red-500 transition-colors uppercase tracking-wider"
                  >
                    Очистить список
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-pulse relative z-20">
              <div className="w-32 h-32 border-2 border-emerald-900 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                 <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                 <span className="text-4xl animate-bounce">👁</span>
              </div>
              <p className="text-xl font-bold text-emerald-500 tracking-[0.2em] text-center uppercase drop-shadow-md">{loadingStep}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-8 bg-red-950/40 backdrop-blur-sm border border-red-900/50 rounded-xl text-center space-y-4 shadow-lg">
              <h3 className="text-red-500 font-bold text-2xl tracking-widest uppercase">РИТУАЛ НАРУШЕН</h3>
              <p className="text-red-300/70 font-serif italic">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="px-8 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800 rounded text-red-200 transition-colors uppercase text-sm tracking-wider"
              >
                Повторить попытку
              </button>
            </div>
          )}

          {/* Step 2: Results */}
          {resultJson && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in-up">
              {/* Token Column */}
              <div className="flex flex-col items-center space-y-6 border-r-0 md:border-r border-gray-700/50 pr-0 md:pr-12">
                <h3 className="text-xl font-bold text-emerald-700 tracking-wider">ОБРАЗ</h3>
                {generatedTokenUrl ? (
                  <div className="relative group cursor-pointer" onClick={handleDownloadToken}>
                     <div className="absolute -inset-4 bg-emerald-900/20 rounded-full blur-xl group-hover:bg-emerald-500/20 transition duration-1000"></div>
                     <img 
                      src={generatedTokenUrl} 
                      alt="Generated Token" 
                      className="relative w-64 h-64 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gray-900 rounded-full flex items-center justify-center border border-dashed border-gray-700">
                    <span className="text-gray-600">Нет образа</span>
                  </div>
                )}
                <button
                  onClick={handleDownloadToken}
                  disabled={!generatedTokenUrl}
                  className="w-full px-6 py-3 bg-transparent hover:bg-emerald-900/20 text-emerald-500 font-bold border border-emerald-900 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-widest hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Сохранить Токен
                </button>
              </div>

              {/* Data Column */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="w-full space-y-4">
                  <h3 className="text-xl font-bold text-emerald-700 tracking-wider text-center md:text-left">ДОСЬЕ</h3>
                  
                  <div className="bg-black/60 p-6 rounded-xl border border-emerald-900/30 text-left space-y-3 font-serif text-gray-400 relative shadow-inner">
                     {/* Paper texture overlay */}
                    <div className="absolute inset-0 bg-white opacity-[0.02] pointer-events-none mix-blend-overlay"></div>
                    
                    <p className="border-b border-gray-800 pb-2"><strong className="text-emerald-600 font-bold mr-2">ИМЯ:</strong> <span className="text-gray-200">{resultJson.name}</span></p>
                    
                    {actorType !== 'creature' && (
                        <>
                        <p><strong className="text-gray-500 mr-2 text-xs uppercase">Профессия:</strong> {resultJson.system.infos.occupation || '—'}</p>
                        <p><strong className="text-gray-500 mr-2 text-xs uppercase">Возраст:</strong> {resultJson.system.infos.age || '—'}</p>
                        </>
                    )}
                     <div className="pt-2 pb-4">
                        <strong className="text-emerald-800 font-bold text-sm block mb-2">ХАРАКТЕРИСТИКИ</strong>
                        <div className="grid grid-cols-4 gap-2 text-xs text-center">
                          <div className="bg-gray-900/50 p-1 border border-gray-800 rounded">STR<br/><span className="text-white text-lg">{resultJson.system.characteristics.str.value}</span></div>
                          <div className="bg-gray-900/50 p-1 border border-gray-800 rounded">DEX<br/><span className="text-white text-lg">{resultJson.system.characteristics.dex.value}</span></div>
                          <div className="bg-gray-900/50 p-1 border border-gray-800 rounded">POW<br/><span className="text-white text-lg">{resultJson.system.characteristics.pow.value}</span></div>
                          <div className="bg-gray-900/50 p-1 border border-gray-800 rounded">SIZ<br/><span className="text-white text-lg">{resultJson.system.characteristics.siz.value}</span></div>
                        </div>
                    </div>

                    {/* Description Block */}
                    {resultJson.system.biography && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <strong className="text-emerald-800 font-bold text-sm block mb-2">ОПИСАНИЕ (Заметки)</strong>
                        <div 
                          className="text-xs text-gray-400 italic leading-relaxed max-h-[150px] overflow-y-auto pr-2"
                          dangerouslySetInnerHTML={{ __html: resultJson.system.biography }}
                        />
                      </div>
                    )}

                  </div>
                </div>

                <div className="w-full space-y-3 pt-6">
                   <button
                    onClick={handleDownloadJson}
                    className="w-full py-4 bg-emerald-900 hover:bg-emerald-800 text-black font-bold border border-emerald-600 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.1)] transition uppercase tracking-[0.15em] hover:scale-[1.01]"
                  >
                    СКАЧАТЬ JSON
                  </button>
                  <button
                    onClick={resetAll}
                    className="w-full py-4 mt-4 bg-gray-900/50 hover:bg-gray-800 text-gray-400 hover:text-white font-bold border border-gray-700 rounded-lg transition uppercase tracking-[0.15em] flex items-center justify-center gap-2"
                  >
                    <span>↺</span> НА ГЛАВНУЮ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;