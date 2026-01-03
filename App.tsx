
import React, { useState, useEffect, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { extractCharacterData, ActorType } from './services/geminiService';
import { CoC7Actor } from './types';

// Removed redundant Window interface declaration to fix conflicting modifiers and duplicate identifier errors.
// The environment provides aistudio and its methods globally.

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

const IconInvestigator = () => (
  <svg className="w-32 h-32 text-emerald-500 transition-all duration-500 filter drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
    <path d="M20,40 Q50,30 80,40 L85,45 L15,45 Z" fillOpacity="0.8" />
    <path d="M25,40 L25,25 Q50,15 75,25 L75,40" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M10,45 Q50,55 90,45 L95,48 Q50,60 5,48 Z" fillOpacity="0.9" />
    <circle cx="65" cy="65" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M78,78 L90,90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="65" cy="65" r="15" fill="currentColor" fillOpacity="0.2" />
    <path d="M10,80 L20,60 L45,60 L45,68 L25,68 L25,85 Z" fillOpacity="0.6" />
    <rect x="45" y="60" width="20" height="8" rx="1" fillOpacity="0.6" />
    <rect x="65" y="62" width="15" height="4" fillOpacity="0.6" />
  </svg>
);

const IconCultist = () => (
  <svg className="w-32 h-32 text-emerald-500 transition-all duration-500 filter drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
    <path d="M50,10 Q20,10 20,40 L10,90 L90,90 L80,40 Q80,10 50,10 Z" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <path d="M50,15 Q30,15 30,45 Q50,35 70,45 Q70,15 50,15 Z" fill="black" fillOpacity="0.6" />
    <circle cx="42" cy="35" r="2" fill="#34d399" className="animate-pulse" />
    <circle cx="58" cy="35" r="2" fill="#34d399" className="animate-pulse" />
    <path d="M20,40 Q10,50 10,90 M80,40 Q90,50 90,90" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M50,55 L50,75 M40,60 L60,60" stroke="currentColor" strokeWidth="1" />
    <circle cx="50" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconCreature = () => (
  <svg className="w-32 h-32 text-emerald-500 transition-all duration-500 filter drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
    <path d="M30,30 Q50,0 70,30 Q80,40 75,55" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M25,55 Q20,40 30,30" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="40" cy="35" r="3" fill="currentColor" />
    <circle cx="60" cy="35" r="3" fill="currentColor" />
    <path d="M25,55 Q10,70 20,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M35,55 Q30,80 40,95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50,55 Q50,85 50,95" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M65,55 Q70,80 60,95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M75,55 Q90,70 80,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

const App: React.FC = () => {
  const [actorType, setActorType] = useState<ActorType | null>(null);
  const [sheetFiles, setSheetFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [resultJson, setResultJson] = useState<CoC7Actor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hasUserKey, setHasUserKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore - window.aistudio is pre-configured and accessible in the context.
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasUserKey(selected);
    };
    checkKey();

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore - window.aistudio is pre-configured and accessible in the context.
    await window.aistudio.openSelectKey();
    setHasUserKey(true);
  };

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

    try {
      setLoadingStep("РАСШИФРОВКА РУН (Оцифровка)...");
      const filePromises = sheetFiles.map(fileToBase64);
      const filesData = await Promise.all(filePromises);
      const actorData = await extractCharacterData(filesData, REFERENCE_JSON_STRING, actorType);
      setResultJson(actorData);
    } catch (err: any) {
      console.error("Process Data Error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasUserKey(false);
        setError("API ключ не найден. Пожалуйста, выберите ключ в диалоговом окне.");
        // @ts-ignore - window.aistudio is pre-configured and accessible in the context.
        await window.aistudio.openSelectKey();
        setHasUserKey(true);
      } else {
        setError(err.message || "Произошла непредвиденная ошибка.");
      }
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
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

  const resetAll = () => {
    setResultJson(null);
    setSheetFiles([]);
    setActorType(null);
    setError(null);
  }

  const handleFileSelect = (files: File[]) => {
    setSheetFiles(prev => [...prev, ...files]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-gray-200 font-sans selection:bg-emerald-900 selection:text-white">
      <div 
        className="fixed inset-[-50px] z-0 bg-cover bg-center transition-transform duration-100 ease-out"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1496034663057-6245f11be793?q=80&w=2670&auto=format&fit=crop')",
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          filter: 'blur(3px) brightness(0.5) contrast(1.1) hue-rotate(180deg)'
        }}
      />
      <div className="fixed inset-0 z-0 bg-black/30 pointer-events-none mix-blend-multiply" />
      <div className="fixed inset-0 z-0 bg-noise opacity-20 pointer-events-none" />
      
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={handleSelectKey}
          className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${hasUserKey ? 'border-emerald-500 text-emerald-500 bg-emerald-950/20' : 'border-gray-700 text-gray-400 bg-black/40 hover:border-emerald-500'}`}
        >
          <span className={hasUserKey ? 'text-emerald-400' : 'text-gray-600'}>●</span>
          {hasUserKey ? 'СВОЙ КЛЮЧ АКТИВЕН' : 'ИСПОЛЬЗОВАТЬ СВОЙ КЛЮЧ'}
        </button>
      </div>

      {isLoading && <MysteriousRunes />}
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
              Автоматическая конвертация листов персонажей в формат <strong className="text-emerald-400">Foundry VTT (v11)</strong>. 
            </p>
          </div>
        </header>
        <div className="w-full max-w-4xl bg-gray-900/60 backdrop-blur-2xl border border-white/5 p-10 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {!actorType && (
             <div className="animate-fade-in space-y-8">
                <h2 className="text-2xl text-center font-bold text-gray-300 mb-8 border-b border-gray-800 pb-4 tracking-widest uppercase font-scary">Выберите сущность</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                  <TypeCard 
                    type="character" 
                    label="Сыщик" 
                    icon={<IconInvestigator />}
                    desc="Классический лист персонажа." 
                    onClick={() => setActorType('character')}
                  />
                  <TypeCard 
                    type="npc" 
                    label="NPC" 
                    icon={<IconCultist />}
                    desc="Персонаж Хранителя." 
                    onClick={() => setActorType('npc')}
                  />
                  <TypeCard 
                    type="creature" 
                    label="Чудовище" 
                    icon={<IconCreature />}
                    desc="Мифологическое создание." 
                    onClick={() => setActorType('creature')}
                  />
                </div>
             </div>
          )}
          {actorType && !resultJson && !isLoading && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                 <button onClick={() => setActorType(null)} className="text-gray-500 hover:text-emerald-500 text-sm flex items-center transition-colors group">
                   <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> ВЕРНУТЬСЯ
                 </button>
                 <span className="text-emerald-700 font-bold tracking-[0.2em] uppercase text-sm border border-emerald-900/50 px-3 py-1 rounded bg-black/40">{actorType === 'character' ? 'Сыщик' : actorType === 'npc' ? 'NPC' : 'Чудовище'}</span>
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
                    className="w-full py-4 text-xl font-bold text-black bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 rounded-lg transition-all border border-emerald-500/50 uppercase tracking-widest"
                  >
                    НАЧАТЬ РИТУАЛ
                  </button>
                </div>
              )}
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-pulse relative z-20">
              <div className="w-32 h-32 border-2 border-emerald-900 rounded-full flex items-center justify-center relative">
                 <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                 <span className="text-4xl animate-bounce">👁</span>
              </div>
              <p className="text-xl font-bold text-emerald-500 tracking-[0.2em] text-center uppercase">{loadingStep}</p>
            </div>
          )}
          {error && (
            <div className="p-8 bg-red-950/40 backdrop-blur-sm border border-red-900/50 rounded-xl text-center space-y-4 shadow-lg">
              <h3 className="text-red-500 font-bold text-2xl tracking-widest uppercase">РИТУАЛ НАРУШЕН</h3>
              <p className="text-red-300/70 font-serif italic text-sm leading-relaxed">{error}</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
                <button 
                  onClick={() => setError(null)}
                  className="px-8 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-800 rounded text-red-200 transition-colors uppercase text-sm tracking-wider"
                >
                  Повторить попытку
                </button>
              </div>
            </div>
          )}
          {resultJson && !isLoading && (
            <div className="animate-fade-in-up space-y-8 max-w-2xl mx-auto">
              <div className="flex flex-col items-center space-y-6">
                <h3 className="text-2xl font-bold text-emerald-700 tracking-wider font-scary uppercase">ДОСЬЕ СФОРМИРОВАНО</h3>
                <div className="w-full bg-black/60 p-8 rounded-2xl border border-emerald-900/30 text-left space-y-4 font-serif text-gray-400 shadow-inner">
                  <p className="border-b border-gray-800 pb-3"><strong className="text-emerald-600 font-bold mr-2 text-lg uppercase tracking-widest">ИМЯ:</strong> <span className="text-gray-100 text-xl">{resultJson.name}</span></p>
                  {actorType !== 'creature' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p><strong className="text-gray-500 mr-2 uppercase text-xs">Профессия:</strong> <span className="text-gray-300">{resultJson.system.infos.occupation || '—'}</span></p>
                      <p><strong className="text-gray-500 mr-2 uppercase text-xs">Возраст:</strong> <span className="text-gray-300">{resultJson.system.infos.age || '—'}</span></p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-800">
                    <strong className="text-emerald-800 font-bold text-xs block mb-3 uppercase tracking-tighter">Основные Характеристики</strong>
                    <div className="grid grid-cols-4 gap-3 text-xs text-center">
                      <div className="bg-emerald-950/20 p-2 border border-emerald-900/30 rounded">STR<br/><span className="text-white text-xl font-bold">{resultJson.system.characteristics.str.value}</span></div>
                      <div className="bg-emerald-950/20 p-2 border border-emerald-900/30 rounded">DEX<br/><span className="text-white text-xl font-bold">{resultJson.system.characteristics.dex.value}</span></div>
                      <div className="bg-emerald-950/20 p-2 border border-emerald-900/30 rounded">POW<br/><span className="text-white text-xl font-bold">{resultJson.system.characteristics.pow.value}</span></div>
                      <div className="bg-emerald-950/20 p-2 border border-emerald-900/30 rounded">SIZ<br/><span className="text-white text-xl font-bold">{resultJson.system.characteristics.siz.value}</span></div>
                    </div>
                  </div>
                  {resultJson.system.biography && (
                    <div className="mt-6 pt-4 border-t border-gray-800">
                      <strong className="text-emerald-800 font-bold text-xs block mb-2 uppercase">Краткое Досье</strong>
                      <div 
                        className="text-sm text-gray-400 italic leading-relaxed max-h-[200px] overflow-y-auto pr-2 custom-scrollbar"
                        dangerouslySetInnerHTML={{ __html: resultJson.system.biography }}
                      />
                    </div>
                  )}
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleDownloadJson}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-black font-black border border-emerald-400 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all uppercase tracking-[0.2em] transform hover:-translate-y-1 active:translate-y-0"
                  >
                    СКАЧАТЬ ДЛЯ FOUNDRY
                  </button>
                  <button
                    onClick={resetAll}
                    className="w-full py-5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white font-bold border border-gray-700 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    НОВЫЙ РИТУАЛ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <footer className="mt-12 text-gray-600 text-xs font-serif tracking-widest uppercase opacity-50">
          Только для Call of Cthulhu 7th Edition
        </footer>
      </div>
    </div>
  );
};

export default App;
