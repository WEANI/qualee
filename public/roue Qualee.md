import React, { useState } from 'react';

const FortuneWheel3D \= () \=\> {  
  const \[prizes, setPrizes\] \= useState(\[  
    { id: 1, name: '500$', probability: 5, color: '\#E85A5A', textColor: '\#ffffff' },  
    { id: 2, name: '150$', probability: 12, color: '\#F5C6C6', textColor: '\#8B4513' },  
    { id: 3, name: '$25', probability: 20, color: '\#D4548A', textColor: '\#ffffff' },  
    { id: 4, name: '100$', probability: 12, color: '\#D4A574', textColor: '\#ffffff' },  
    { id: 5, name: 'UNLUCKY', probability: 10, color: '\#1a1a1a', textColor: '\#ff4444' },  
    { id: 6, name: '$50', probability: 13, color: '\#E85A5A', textColor: '\#ffffff' },  
    { id: 7, name: '250$', probability: 8, color: '\#F5C6C6', textColor: '\#8B4513' },  
    { id: 8, name: '75$', probability: 12, color: '\#D4548A', textColor: '\#ffffff' },  
    { id: 9, name: '200$', probability: 8, color: '\#D4A574', textColor: '\#ffffff' },  
  \]);

  const \[isSpinning, setIsSpinning\] \= useState(false);  
  const \[rotation, setRotation\] \= useState(0);  
  const \[winner, setWinner\] \= useState(null);  
  const \[showConfig, setShowConfig\] \= useState(false);  
  const \[bgColor, setBgColor\] \= useState('\#4a4a52');

  const totalProbability \= prizes.reduce((sum, p) \=\> sum \+ p.probability, 0);  
  const segmentAngle \= 360 / prizes.length;

  const selectWinner \= () \=\> {  
    const random \= Math.random() \* totalProbability;  
    let cumulative \= 0;  
    for (let i \= 0; i \< prizes.length; i++) {  
      cumulative \+= prizes\[i\].probability;  
      if (random \<= cumulative) return i;  
    }  
    return prizes.length \- 1;  
  };

  const spinWheel \= () \=\> {  
    if (isSpinning) return;  
    setIsSpinning(true);  
    setWinner(null);  
      
    const winnerIndex \= selectWinner();  
    const segmentMiddle \= winnerIndex \* segmentAngle \+ segmentAngle / 2;  
    const extraSpins \= 5 \+ Math.random() \* 3;  
    const targetRotation \= rotation \+ (extraSpins \* 360\) \+ (360 \- segmentMiddle) \- (rotation % 360);  
      
    setRotation(targetRotation);  
      
    setTimeout(() \=\> {  
      setIsSpinning(false);  
      setWinner(prizes\[winnerIndex\]);  
    }, 5000);  
  };

  const updatePrize \= (index, field, value) \=\> {  
    const newPrizes \= \[...prizes\];  
    newPrizes\[index\] \= { ...newPrizes\[index\], \[field\]: field \=== 'probability' ? Number(value) : value };  
    setPrizes(newPrizes);  
  };

  const addPrize \= () \=\> {  
    if (prizes.length \>= 12\) return;  
    setPrizes(\[...prizes, {  
      id: Date.now(),  
      name: 'NEW',  
      probability: 10,  
      color: '\#D4548A',  
      textColor: '\#ffffff'  
    }\]);  
  };

  const removePrize \= (index) \=\> {  
    if (prizes.length \> 3\) {  
      setPrizes(prizes.filter((\_, i) \=\> i \!== index));  
    }  
  };

  const createSegmentPath \= (index, radius, innerRadius) \=\> {  
    const startAngle \= (index \* segmentAngle \- 90\) \* Math.PI / 180;  
    const endAngle \= ((index \+ 1\) \* segmentAngle \- 90\) \* Math.PI / 180;  
      
    const x1 \= 200 \+ radius \* Math.cos(startAngle);  
    const y1 \= 200 \+ radius \* Math.sin(startAngle);  
    const x2 \= 200 \+ radius \* Math.cos(endAngle);  
    const y2 \= 200 \+ radius \* Math.sin(endAngle);  
    const x3 \= 200 \+ innerRadius \* Math.cos(endAngle);  
    const y3 \= 200 \+ innerRadius \* Math.sin(endAngle);  
    const x4 \= 200 \+ innerRadius \* Math.cos(startAngle);  
    const y4 \= 200 \+ innerRadius \* Math.sin(startAngle);  
      
    return \`M ${x4} ${y4} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z\`;  
  };

  const getTextPosition \= (index) \=\> {  
    const midAngle \= ((index \* segmentAngle) \+ (segmentAngle / 2\) \- 90\) \* Math.PI / 180;  
    const radius \= 130;  
    return {  
      x: 200 \+ radius \* Math.cos(midAngle),  
      y: 200 \+ radius \* Math.sin(midAngle),  
      rotation: index \* segmentAngle \+ segmentAngle / 2  
    };  
  };

  // Decorative balls \- adjusted based on segment count  
  const decorativeBalls \= \[\];  
  const ballCount \= Math.max(12, prizes.length);  
  for (let i \= 0; i \< ballCount; i++) {  
    const angle \= (i \* (360 / ballCount) \- 90\) \* Math.PI / 180;  
    decorativeBalls.push({  
      x: 200 \+ 185 \* Math.cos(angle),  
      y: 200 \+ 185 \* Math.sin(angle)  
    });  
  }

  const isUnlucky \= winner && winner.name.toUpperCase() \=== 'UNLUCKY';

  return (  
    \<div   
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"  
      style={{ backgroundColor: bgColor }}  
    \>  
      {/\* Config Button \*/}  
      \<button  
        onClick={() \=\> setShowConfig(\!showConfig)}  
        className="absolute top-4 right-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-900 font-bold py-2 px-5 rounded-lg shadow-lg transition-all z-50 flex items-center gap-2"  
      \>  
        ⚙️ Config  
      \</button\>

      {/\* Config Panel \*/}  
      {showConfig && (  
        \<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4 backdrop-blur-sm"\>  
          \<div className="bg-gray-900 rounded-2xl p-6 max-w-xl w-full max-h-\[85vh\] overflow-y-auto border border-amber-500/30"\>  
            \<div className="flex justify-between items-center mb-6"\>  
              \<h2 className="text-2xl font-bold text-amber-400"\>🎰 Configuration\</h2\>  
              \<button onClick={() \=\> setShowConfig(false)} className="text-gray-400 hover:text-white text-2xl"\>×\</button\>  
            \</div\>

            \<div className="mb-6 p-4 bg-black/30 rounded-xl"\>  
              \<h3 className="text-amber-400 font-semibold mb-3"\>🎨 Arrière-plan\</h3\>  
              \<input type="color" value={bgColor} onChange={(e) \=\> setBgColor(e.target.value)} className="w-full h-12 rounded cursor-pointer" /\>  
            \</div\>

            \<div className="p-4 bg-black/30 rounded-xl"\>  
              \<div className="flex justify-between items-center mb-3"\>  
                \<h3 className="text-amber-400 font-semibold"\>🎁 Prix ({prizes.length}/12 segments)\</h3\>  
                \<button  
                  onClick={addPrize}  
                  disabled={prizes.length \>= 12}  
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm font-semibold"  
                \>  
                  \+ Ajouter  
                \</button\>  
              \</div\>  
              \<div className="space-y-2 max-h-\[40vh\] overflow-y-auto"\>  
                {prizes.map((prize, index) \=\> (  
                  \<div key={prize.id} className="bg-gray-800/50 p-3 rounded-lg flex gap-2 items-center flex-wrap"\>  
                    \<span className="text-gray-500 text-sm w-5"\>{index \+ 1}\</span\>  
                    \<input  
                      type="text"  
                      value={prize.name}  
                      onChange={(e) \=\> updatePrize(index, 'name', e.target.value)}  
                      className="flex-1 min-w-\[70px\] bg-gray-700 text-white px-3 py-2 rounded text-sm"  
                    /\>  
                    \<input  
                      type="number" min="1" max="100" value={prize.probability}  
                      onChange={(e) \=\> updatePrize(index, 'probability', e.target.value)}  
                      className="w-14 bg-gray-700 text-white px-2 py-2 rounded text-sm text-center"  
                    /\>  
                    \<span className="text-gray-400 text-xs"\>%\</span\>  
                    \<input type="color" value={prize.color} onChange={(e) \=\> updatePrize(index, 'color', e.target.value)} className="w-9 h-9 rounded cursor-pointer" /\>  
                    \<input type="color" value={prize.textColor} onChange={(e) \=\> updatePrize(index, 'textColor', e.target.value)} className="w-9 h-9 rounded cursor-pointer" /\>  
                    \<button  
                      onClick={() \=\> removePrize(index)}  
                      disabled={prizes.length \<= 3}  
                      className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded disabled:opacity-30"  
                    \>  
                      ✕  
                    \</button\>  
                  \</div\>  
                ))}  
              \</div\>  
            \</div\>  
          \</div\>  
        \</div\>  
      )}

      {/\* Title \*/}  
      \<h1   
        className="text-4xl md:text-5xl font-black mb-6 tracking-wide"  
        style={{  
          background: 'linear-gradient(180deg, \#ffd700 0%, \#b8860b 50%, \#8b6914 100%)',  
          WebkitBackgroundClip: 'text',  
          WebkitTextFillColor: 'transparent',  
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'  
        }}  
      \>  
        FORTUNE WHEEL  
      \</h1\>

      {/\* Wheel Assembly \*/}  
      \<div className="relative" style={{ perspective: '1200px' }}\>  
          
        {/\* Pointer at TOP pointing DOWN \*/}  
        \<div   
          className="absolute left-1/2 \-translate-x-1/2 z-30"  
          style={{ top: '-25px' }}  
        \>  
          \<svg width="70" height="90" viewBox="0 0 70 90" style={{ filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.5))' }}\>  
            \<defs\>  
              \<linearGradient id="pointerGradient" x1="0%" y1="0%" x2="100%" y2="0%"\>  
                \<stop offset="0%" stopColor="\#4A0F2A" /\>  
                \<stop offset="25%" stopColor="\#6B1B3D" /\>  
                \<stop offset="50%" stopColor="\#8B2252" /\>  
                \<stop offset="75%" stopColor="\#6B1B3D" /\>  
                \<stop offset="100%" stopColor="\#4A0F2A" /\>  
              \</linearGradient\>  
              \<radialGradient id="pointerCenterGold" cx="50%" cy="40%" r="50%"\>  
                \<stop offset="0%" stopColor="\#F5E6A3" /\>  
                \<stop offset="40%" stopColor="\#D4AF37" /\>  
                \<stop offset="70%" stopColor="\#B8860B" /\>  
                \<stop offset="100%" stopColor="\#8B6914" /\>  
              \</radialGradient\>  
              \<linearGradient id="pointerShine" x1="0%" y1="0%" x2="100%" y2="100%"\>  
                \<stop offset="0%" stopColor="rgba(255,255,255,0.4)" /\>  
                \<stop offset="50%" stopColor="rgba(255,255,255,0.1)" /\>  
                \<stop offset="100%" stopColor="rgba(0,0,0,0.1)" /\>  
              \</linearGradient\>  
            \</defs\>  
              
            {/\* Teardrop shape pointing DOWN \*/}  
            \<path   
              d="M35 90 C15 70, 5 50, 5 35 C5 15, 18 2, 35 2 C52 2, 65 15, 65 35 C65 50, 55 70, 35 90 Z"   
              fill="url(\#pointerGradient)"   
              stroke="\#3A0820"   
              strokeWidth="2"  
            /\>  
              
            {/\* Shine overlay \*/}  
            \<path   
              d="M35 90 C15 70, 5 50, 5 35 C5 15, 18 2, 35 2 C52 2, 65 15, 65 35 C65 50, 55 70, 35 90 Z"   
              fill="url(\#pointerShine)"   
            /\>  
              
            {/\* Gold center circle with concentric rings \*/}  
            \<circle cx="35" cy="32" r="22" fill="url(\#pointerCenterGold)" stroke="\#8B6914" strokeWidth="1" /\>  
            \<circle cx="35" cy="32" r="17" fill="\#B8860B" /\>  
            \<circle cx="35" cy="32" r="13" fill="\#D4AF37" /\>  
            \<circle cx="35" cy="32" r="10" fill="none" stroke="\#8B6914" strokeWidth="1.5" /\>  
            \<circle cx="35" cy="32" r="7" fill="none" stroke="\#B8860B" strokeWidth="1" /\>  
            \<circle cx="35" cy="32" r="4" fill="\#8B6914" /\>  
            \<circle cx="35" cy="32" r="2" fill="\#D4AF37" /\>  
              
            {/\* Highlight \*/}  
            \<ellipse cx="28" cy="25" rx="6" ry="5" fill="rgba(255,255,255,0.35)" /\>  
          \</svg\>  
        \</div\>

        {/\* Main Wheel \*/}  
        \<div className="relative" style={{ transform: 'rotateX(5deg)' }}\>  
          \<svg  
            width="400"  
            height="400"  
            viewBox="0 0 400 400"  
            style={{  
              transform: \`rotate(${rotation}deg)\`,  
              transition: isSpinning ? 'transform 5s cubic-bezier(0.15, 0.60, 0.15, 1)' : 'none',  
              filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.4))'  
            }}  
          \>  
            \<defs\>  
              \<linearGradient id="goldRimOuter" x1="0%" y1="0%" x2="100%" y2="100%"\>  
                \<stop offset="0%" stopColor="\#D4AF37" /\>  
                \<stop offset="20%" stopColor="\#F5E6A3" /\>  
                \<stop offset="40%" stopColor="\#D4AF37" /\>  
                \<stop offset="60%" stopColor="\#B8860B" /\>  
                \<stop offset="80%" stopColor="\#D4AF37" /\>  
                \<stop offset="100%" stopColor="\#8B6914" /\>  
              \</linearGradient\>  
                
              \<linearGradient id="goldRimInner" x1="0%" y1="100%" x2="100%" y2="0%"\>  
                \<stop offset="0%" stopColor="\#B8860B" /\>  
                \<stop offset="25%" stopColor="\#D4AF37" /\>  
                \<stop offset="50%" stopColor="\#F5E6A3" /\>  
                \<stop offset="75%" stopColor="\#D4AF37" /\>  
                \<stop offset="100%" stopColor="\#8B6914" /\>  
              \</linearGradient\>

              \<radialGradient id="centerHubGold" cx="35%" cy="35%" r="65%"\>  
                \<stop offset="0%" stopColor="\#F5E6A3" /\>  
                \<stop offset="30%" stopColor="\#D4AF37" /\>  
                \<stop offset="60%" stopColor="\#B8860B" /\>  
                \<stop offset="100%" stopColor="\#8B6914" /\>  
              \</radialGradient\>

              \<linearGradient id="segmentShine" x1="0%" y1="0%" x2="0%" y2="100%"\>  
                \<stop offset="0%" stopColor="rgba(255,255,255,0.3)" /\>  
                \<stop offset="50%" stopColor="rgba(255,255,255,0.05)" /\>  
                \<stop offset="100%" stopColor="rgba(0,0,0,0.15)" /\>  
              \</linearGradient\>

              \<linearGradient id="blackSegmentShine" x1="0%" y1="0%" x2="0%" y2="100%"\>  
                \<stop offset="0%" stopColor="rgba(255,255,255,0.15)" /\>  
                \<stop offset="50%" stopColor="rgba(255,255,255,0.02)" /\>  
                \<stop offset="100%" stopColor="rgba(0,0,0,0.3)" /\>  
              \</linearGradient\>  
            \</defs\>

            {/\* Outer gold ring \*/}  
            \<circle cx="200" cy="200" r="198" fill="url(\#goldRimOuter)" /\>  
            \<circle cx="200" cy="200" r="190" fill="url(\#goldRimInner)" /\>  
            \<circle cx="200" cy="200" r="182" fill="\#1a1a1a" /\>

            {/\* Segments \*/}  
            {prizes.map((prize, index) \=\> {  
              const pos \= getTextPosition(index);  
              const isBlackSegment \= prize.color \=== '\#1a1a1a' || prize.color \=== '\#000000';  
              return (  
                \<g key={prize.id}\>  
                  \<path  
                    d={createSegmentPath(index, 178, 60)}  
                    fill={prize.color}  
                    stroke="rgba(0,0,0,0.15)"  
                    strokeWidth="1"  
                  /\>  
                  \<path  
                    d={createSegmentPath(index, 178, 60)}  
                    fill={isBlackSegment ? "url(\#blackSegmentShine)" : "url(\#segmentShine)"}  
                  /\>  
                  {/\* Skull icon for UNLUCKY segment \*/}  
                  {prize.name.toUpperCase() \=== 'UNLUCKY' && (  
                    \<text  
                      x={200 \+ 105 \* Math.cos(((index \* segmentAngle) \+ (segmentAngle / 2\) \- 90\) \* Math.PI / 180)}  
                      y={200 \+ 105 \* Math.sin(((index \* segmentAngle) \+ (segmentAngle / 2\) \- 90\) \* Math.PI / 180)}  
                      fontSize="16"  
                      textAnchor="middle"  
                      dominantBaseline="middle"  
                      transform={\`rotate(${index \* segmentAngle \+ segmentAngle / 2}, ${200 \+ 105 \* Math.cos(((index \* segmentAngle) \+ (segmentAngle / 2\) \- 90\) \* Math.PI / 180)}, ${200 \+ 105 \* Math.sin(((index \* segmentAngle) \+ (segmentAngle / 2\) \- 90\) \* Math.PI / 180)})\`}  
                    \>  
                      💀  
                    \</text\>  
                  )}  
                  \<text  
                    x={pos.x}  
                    y={pos.y}  
                    fill={prize.textColor}  
                    fontSize={prize.name.length \> 6 ? "14" : "18"}  
                    fontWeight="bold"  
                    fontFamily="Arial Black, sans-serif"  
                    textAnchor="middle"  
                    dominantBaseline="middle"  
                    transform={\`rotate(${pos.rotation}, ${pos.x}, ${pos.y})\`}  
                    style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}  
                  \>  
                    {prize.name}  
                  \</text\>  
                \</g\>  
              );  
            })}

            {/\* Decorative balls \*/}  
            {decorativeBalls.map((ball, i) \=\> (  
              \<g key={\`ball-${i}\`}\>  
                \<ellipse cx={ball.x \+ 2} cy={ball.y \+ 3} rx="8" ry="6" fill="rgba(0,0,0,0.3)" /\>  
                \<circle cx={ball.x} cy={ball.y} r="9" fill="\#E0E0E0" /\>  
                \<circle cx={ball.x} cy={ball.y} r="8" fill="\#F8F8F8" /\>  
                \<circle cx={ball.x} cy={ball.y} r="6" fill="\#FFFFFF" /\>  
                \<ellipse cx={ball.x \- 2} cy={ball.y \- 2} rx="3" ry="2.5" fill="rgba(255,255,255,1)" /\>  
              \</g\>  
            ))}

            {/\* Center Hub with concentric rings \*/}  
            \<circle cx="200" cy="200" r="58" fill="url(\#goldRimOuter)" /\>  
            \<circle cx="200" cy="200" r="54" fill="url(\#centerHubGold)" /\>  
              
            {/\* Concentric decorative rings \*/}  
            \<circle cx="200" cy="200" r="48" fill="none" stroke="\#8B6914" strokeWidth="2" /\>  
            \<circle cx="200" cy="200" r="42" fill="none" stroke="\#B8860B" strokeWidth="2" /\>  
            \<circle cx="200" cy="200" r="36" fill="none" stroke="\#8B6914" strokeWidth="1.5" /\>  
            \<circle cx="200" cy="200" r="30" fill="none" stroke="\#D4AF37" strokeWidth="1.5" /\>  
            \<circle cx="200" cy="200" r="24" fill="none" stroke="\#8B6914" strokeWidth="1" /\>  
            \<circle cx="200" cy="200" r="18" fill="none" stroke="\#B8860B" strokeWidth="1" /\>  
              
            {/\* Center highlight \*/}  
            \<ellipse cx="185" cy="185" rx="18" ry="14" fill="rgba(255,255,255,0.25)" /\>  
          \</svg\>

          {/\* SPIN Button \*/}  
          \<button  
            onClick={spinWheel}  
            disabled={isSpinning}  
            className="absolute top-1/2 left-1/2 \-translate-x-1/2 \-translate-y-1/2 w-24 h-24 rounded-full font-black text-lg tracking-wider transition-all z-20 flex items-center justify-center"  
            style={{  
              background: isSpinning   
                ? 'radial-gradient(circle at 35% 35%, \#666 0%, \#444 50%, \#333 100%)'  
                : 'radial-gradient(circle at 35% 35%, \#F5E6A3 0%, \#D4AF37 30%, \#B8860B 70%, \#8B6914 100%)',  
              color: isSpinning ? '\#888' : '\#4a2c00',  
              boxShadow: isSpinning   
                ? 'inset 0 2px 5px rgba(0,0,0,0.5)'  
                : '0 4px 15px rgba(139,105,20,0.5), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 \-2px 0 rgba(0,0,0,0.2)',  
              cursor: isSpinning ? 'not-allowed' : 'pointer',  
              textShadow: isSpinning ? 'none' : '0 1px 0 rgba(255,255,255,0.3)',  
              border: '3px solid \#8B6914',  
              transform: 'translate(-50%, \-50%) rotateX(-5deg)'  
            }}  
          \>  
            {isSpinning ? (  
              \<span className="animate-pulse"\>•••\</span\>  
            ) : (  
              'SPIN'  
            )}  
          \</button\>  
        \</div\>

        {/\* Gold Pedestal \*/}  
        \<div className="flex flex-col items-center \-mt-2" style={{ filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.4))' }}\>  
          \<svg width="80" height="55" viewBox="0 0 80 55"\>  
            \<defs\>  
              \<linearGradient id="standNeck" x1="0%" y1="0%" x2="100%" y2="0%"\>  
                \<stop offset="0%" stopColor="\#8B6914" /\>  
                \<stop offset="25%" stopColor="\#B8860B" /\>  
                \<stop offset="50%" stopColor="\#F5E6A3" /\>  
                \<stop offset="75%" stopColor="\#B8860B" /\>  
                \<stop offset="100%" stopColor="\#8B6914" /\>  
              \</linearGradient\>  
            \</defs\>  
            \<path d="M28 0 L52 0 L58 55 L22 55 Z" fill="url(\#standNeck)" /\>  
            \<ellipse cx="40" cy="5" rx="14" ry="5" fill="\#D4AF37" /\>  
          \</svg\>  
            
          \<svg width="130" height="55" viewBox="0 0 130 55" className="-mt-1"\>  
            \<defs\>  
              \<linearGradient id="standBase" x1="0%" y1="0%" x2="100%" y2="0%"\>  
                \<stop offset="0%" stopColor="\#8B6914" /\>  
                \<stop offset="20%" stopColor="\#B8860B" /\>  
                \<stop offset="40%" stopColor="\#D4AF37" /\>  
                \<stop offset="50%" stopColor="\#F5E6A3" /\>  
                \<stop offset="60%" stopColor="\#D4AF37" /\>  
                \<stop offset="80%" stopColor="\#B8860B" /\>  
                \<stop offset="100%" stopColor="\#8B6914" /\>  
              \</linearGradient\>  
            \</defs\>  
            \<path d="M45 0 L85 0 L110 40 L110 48 L20 48 L20 40 Z" fill="url(\#standBase)" /\>  
            \<ellipse cx="65" cy="5" rx="22" ry="7" fill="\#D4AF37" /\>  
            \<rect x="20" y="45" width="90" height="8" rx="2" fill="url(\#standBase)" /\>  
            \<ellipse cx="55" cy="25" rx="12" ry="16" fill="rgba(255,255,255,0.1)" /\>  
          \</svg\>  
        \</div\>  
      \</div\>

      {/\* Winner Display \*/}  
      {winner && (  
        \<div   
          className="mt-8 p-6 rounded-2xl text-center max-w-sm"  
          style={{  
            background: isUnlucky   
              ? 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(60,20,20,0.9) 100%)'  
              : 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(139,105,20,0.3) 100%)',  
            border: isUnlucky ? '2px solid \#ff4444' : '2px solid \#D4AF37',  
            boxShadow: isUnlucky ? '0 0 40px rgba(255,50,50,0.4)' : '0 0 40px rgba(212,175,55,0.3)'  
          }}  
        \>  
          \<p className={isUnlucky ? "text-red-400 text-lg" : "text-amber-400 text-lg"}\>  
            {isUnlucky ? '😈 Pas de chance\!' : '🎉 Félicitations\!'}  
          \</p\>  
          \<p   
            className="text-4xl font-black mt-2"   
            style={{   
              color: isUnlucky ? '\#ff4444' : '\#ffffff',  
              textShadow: isUnlucky ? '0 0 20px rgba(255,50,50,0.5)' : '0 0 20px rgba(212,175,55,0.5)'   
            }}  
          \>  
            {isUnlucky ? '💀 ' : ''}{winner.name}{isUnlucky ? ' 💀' : ''}  
          \</p\>  
          {isUnlucky && (  
            \<p className="text-gray-400 text-sm mt-2"\>Retentez votre chance\!\</p\>  
          )}  
        \</div\>  
      )}

      {/\* Footer \*/}  
      \<p className="mt-6 text-gray-500 text-sm"\>  
        Cliquez sur \<span className="text-amber-400 font-bold"\>SPIN\</span\> au centre pour tourner\!  
      \</p\>  
    \</div\>  
  );  
};

export default FortuneWheel3D;  
