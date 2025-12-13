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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
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

const TypeCard = ({ type, label, icon, desc, onClick }: { type: ActorType, label: string, icon: string, desc: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="relative flex flex-col items-center p-6 bg-black/60 backdrop-blur-sm border border-emerald-900/30 hover:border-emerald-500 rounded-lg transition-all hover:bg-black/80 hover:scale-105 group overflow-hidden"
  >
    <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <span className="text-4xl mb-4 text-emerald-600 group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all">{icon}</span>
    <h3 className="text-xl font-bold text-emerald-100 mb-2 z-10">{label}</h3>
    <p className="text-xs text-gray-400 text-center z-10 group-hover:text-gray-300">{desc}</p>
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
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
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
      
      {/* --- Background Layers --- */}
      
      {/* 1. Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a100d] to-[#020503] z-[-10]" />
      
      {/* 2. Noise Texture */}
      <div className="absolute inset-0 bg-noise opacity-30 z-[-9] pointer-events-none" />

      {/* 3. Parallax Image Layer - Background */}
      <div 
        className="absolute inset-[-5%] w-[110%] h-[110%] z-0 bg-cover bg-center pointer-events-none transition-transform duration-100 ease-out saturate-0 contrast-125 brightness-[0.4]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2456&auto=format&fit=crop')", // Dark Library/Books
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
        }}
      />

      {/* 4. Mysterious Glowing Runes (Only when Loading) */}
      {isLoading && <MysteriousRunes />}

      {/* --- Main Content --- */}
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center min-h-screen">
        <header className="mb-12 text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-scary text-emerald-700 tracking-[0.1em] drop-shadow-[0_4px_10px_rgba(0,0,0,1)] pb-4 inline-block border-b border-emerald-900/30">
            АРХИВЫ <span className="text-gray-400">АРКХЕМА</span>
          </h1>
          <p className="text-gray-500 font-serif italic max-w-2xl mx-auto text-lg tracking-wider">
            "Цифровой ритуал переноса душ"
          </p>
        </header>

        {/* Card Container */}
        <div className="w-full max-w-4xl bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-800 p-8 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Decorative Corner Borders */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-emerald-900/50 pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-emerald-900/50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-emerald-900/50 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-emerald-900/50 pointer-events-none" />

          {/* Step 0: Select Type */}
          {!actorType && (
             <div className="animate-fade-in space-y-8">
                <h2 className="text-2xl text-center font-bold text-gray-300 mb-8 border-b border-gray-800 pb-4">Выберите сущность</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TypeCard 
                    type="character" 
                    label="Сыщик" 
                    icon="🕵️" 
                    desc="Классический лист персонажа." 
                    onClick={() => setActorType('character')}
                  />
                  <TypeCard 
                    type="npc" 
                    label="NPC" 
                    icon="🎭" 
                    desc="Персонаж Хранителя." 
                    onClick={() => setActorType('npc')}
                  />
                  <TypeCard 
                    type="creature" 
                    label="Чудовище" 
                    icon="🦑" 
                    desc="Создание из тьмы." 
                    onClick={() => setActorType('creature')}
                  />
                </div>
             </div>
          )}

          {/* Step 1: Upload */}
          {actorType && !resultJson && !isLoading && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                 <button onClick={() => setActorType(null)} className="text-gray-500 hover:text-emerald-500 text-sm flex items-center transition-colors">
                   ← ВЕРНУТЬСЯ
                 </button>
                 <span className="text-emerald-700 font-bold tracking-widest uppercase">{actorType === 'character' ? 'Сыщик' : actorType === 'npc' ? 'NPC' : 'Чудовище'}</span>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-200">Материалы дела</h2>
                <p className="text-sm text-gray-500 font-serif italic">Загрузите страницы или скопируйте (Ctrl+V)</p>
              </div>
              
              <FileUpload
                accept="image/*,application/pdf"
                label={sheetFiles.length > 0 ? `Добавлено страниц: ${sheetFiles.length}` : "Загрузить документы"}
                onFileSelect={handleFileSelect}
              />

              {sheetFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {sheetFiles.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700 truncate max-w-[200px]">
                        {f.name}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={processData}
                    className="w-full py-4 text-xl font-bold text-black bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 rounded-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.99] border border-emerald-500/50"
                  >
                    НАЧАТЬ РИТУАЛ
                  </button>
                  <button 
                    onClick={() => setSheetFiles([])}
                    className="w-full text-xs text-red-900 hover:text-red-500 transition-colors"
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
              <div className="w-32 h-32 border-2 border-emerald-900 rounded-full flex items-center justify-center relative">
                 <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                 <span className="text-4xl animate-bounce">👁</span>
              </div>
              <p className="text-xl font-bold text-emerald-500 tracking-[0.2em] text-center uppercase drop-shadow-md">{loadingStep}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-8 bg-red-950/20 border border-red-900/50 rounded-sm text-center space-y-4">
              <h3 className="text-red-500 font-bold text-2xl tracking-widest">РИТУАЛ НАРУШЕН</h3>
              <p className="text-red-300/70 font-serif italic">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="px-8 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800 rounded-sm text-red-200 transition-colors uppercase text-sm tracking-wider"
              >
                Повторить попытку
              </button>
            </div>
          )}

          {/* Step 2: Results */}
          {resultJson && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in-up">
              {/* Token Column */}
              <div className="flex flex-col items-center space-y-6 border-r-0 md:border-r border-gray-800 pr-0 md:pr-12">
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
                  className="w-full px-6 py-3 bg-transparent hover:bg-emerald-900/20 text-emerald-500 font-bold border border-emerald-900 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-widest"
                >
                  Сохранить Токен
                </button>
              </div>

              {/* Data Column */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="w-full space-y-4">
                  <h3 className="text-xl font-bold text-emerald-700 tracking-wider text-center md:text-left">ДОСЬЕ</h3>
                  
                  <div className="bg-black/60 p-6 rounded-sm border border-emerald-900/30 text-left space-y-3 font-serif text-gray-400 relative">
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
                          className="text-xs text-gray-400 italic leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: resultJson.system.biography }}
                        />
                      </div>
                    )}

                  </div>
                </div>

                <div className="w-full space-y-3 pt-6">
                   <button
                    onClick={handleDownloadJson}
                    className="w-full py-4 bg-emerald-900 hover:bg-emerald-800 text-black font-bold border border-emerald-600 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] transition uppercase tracking-[0.15em]"
                  >
                    СКАЧАТЬ JSON
                  </button>
                  <button
                    onClick={resetAll}
                    className="w-full py-4 mt-4 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white font-bold border border-gray-700 rounded-sm transition uppercase tracking-[0.15em] flex items-center justify-center gap-2"
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