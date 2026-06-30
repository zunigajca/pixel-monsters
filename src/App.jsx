import React, { useState, useEffect } from 'react';
import { PixelSprite } from './PixelSprite';
import { SOUNDS } from './sound';



const MONSTER_TEMPLATES = {
  slime: { id: 'slime', name: 'Slime-bough', type: 'Tank', maxHp: 60, attack: 8, speed: 2, 
    passive: { name: "Sticky Armor", desc: "Reduces attacker speed by 2 when hit. Cooldown: 2 turns.", cooldown: 2 } 
  },
  fox: { id: 'fox', name: 'Ember-fox', type: 'Glass Cannon', maxHp: 30, attack: 18, speed: 8, 
    passive: { name: "Blazing Dash", desc: "Gain +6 Speed for 2 turns. Cooldown: 4 turns.", duration: 2, cooldown: 4 } 
  },
  pup: { id: 'pup', name: 'Spark-pup', type: 'Disruptor', maxHp: 45, attack: 12, speed: 5, 
    passive: { name: "Overcharge", desc: "Empowers next attack by +8 DMG. Cooldown: 3 turns.", duration: 1, cooldown: 3 } 
  },
  draco: { id: 'draco', name: 'Pyre-Draco', type: 'Brawler', maxHp: 55, attack: 14, speed: 4, 
    passive: { name: "Fury Stance", desc: "Gain +4 ATK for 2 turns when dropped below 50% HP. Once per battle.", cooldown: 99 } 
  },
  golem: { id: 'golem', name: 'Clay-Golem', type: 'Wall', maxHp: 80, attack: 6, speed: 1, 
    passive: { name: "Fortify", desc: "Blocks 50% incoming damage for 2 turns. Cooldown: 5 turns.", duration: 2, cooldown: 5 } 
  },
  ghost: { id: 'ghost', name: 'Void-Ghost', type: 'Stalker', maxHp: 40, attack: 15, speed: 7, 
    passive: { name: "Phase Shift", desc: "Guaranteed to dodge the next attack. Cooldown: 4 turns.", duration: 1, cooldown: 4 } 
  },
  leaflet: { id: 'leaflet', name: 'Leaflet-Sprout', type: 'Healer/Regen', maxHp: 50, attack: 10, speed: 3, 
    passive: { name: "Root Heal", desc: "Heals self for 12 HP. Cooldown: 3 turns.", cooldown: 3 } 
  },
  aero: { id: 'aero', name: 'Aero-Gale', type: 'Speeder', maxHp: 35, attack: 13, speed: 9, 
    passive: { name: "Tailwind", desc: "Grants all allies +3 Speed for 2 turns. Cooldown: 5 turns.", duration: 2, cooldown: 5 } 
  },
  finne: { id: 'finne', name: 'Finne-Chomper', type: 'Striker', maxHp: 48, attack: 16, speed: 6, 
    passive: { name: "Blood Hunt", desc: "Deals +6 DMG if target is below half HP. Permanent Passive.", cooldown: 0 } 
  }
};

function App() {
  const [bgmOn, setBgmOn] = useState(false);

  const toggleBGM = () => {
    if (bgmOn) {
      SOUNDS.stopBGM();
      setBgmOn(false);
    } else {
      SOUNDS.startBGM();
      setBgmOn(true);
    }
  };

  const [hasChosenStarter, setHasChosenStarter] = useState(false);
  const [playerTeam, setPlayerTeam] = useState([]);
  const [enemyTeam, setEnemyTeam] = useState([]);
  const [battleLogs, setBattleLogs] = useState([]);
  const [isFighting, setIsFighting] = useState(false);
  const [winner, setWinner] = useState(null);
  const [activeAnims, setActiveAnims] = useState({});

  // 🪙 Progression Wallet & Global Meta Stats
  const [gold, setGold] = useState(100);
  const [trainerLvl, setTrainerLvl] = useState(1);
  const [trainerExp, setTrainerExp] = useState(0);
  const [wave, setWave] = useState(1);

  // 🔥 Visual Combat Overlays & Result Screens States
  const [floatingTexts, setFloatingTexts] = useState({});
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [matchSummary, setMatchSummary] = useState({ outcome: '', gold: 0, exp: 0 });

  // 🛒 Shop Selection Modals Toggle
  const [isChoosingRecruit, setIsChoosingRecruit] = useState(false);

  // Trainer Level 1-2: 2 Slots | Level 3-4: 3 Slots | Level 5+: 4 Slots
  const maxTeamSlots = Math.min(4, 2 + Math.floor((trainerLvl - 1) / 2));

  // Dynamic Scaling Enemy Wave Generator
  const generateEnemyWave = (targetWave) => {
    if (targetWave % 10 === 0) {
      const BOSS_TEMPLATES = {
        kraken: { 
          id: 'kraken', name: 'Nebula-Kraken', type: 'Cosmic', maxHp: 120, attack: 10, speed: 4,
          passive: { name: "Event Horizon", desc: "Slows player squad speed by 4 and gains +5 ATK for 3 rounds.", duration: 3, cooldown: 99 }
        },
        behemoth: { 
          id: 'behemoth', name: 'Rust-Behemoth', type: 'Mecha', maxHp: 150, attack: 7, speed: 2,
          passive: { name: "Overdrive Meltdown", desc: "Permanently gains +1 ATK and +1 SPD on turn. Breaks shield at 30% HP.", duration: 0, cooldown: 0 }
        },
        specter: { 
          id: 'specter', name: 'Chrono-Specter', type: 'Phantasm', maxHp: 100, attack: 12, speed: 6,
          passive: { name: "Time Rewind", desc: "Heals 25 HP and clears debuffs every 4 turns.", cooldown: 4 }
        }
      };

      const bossKeys = Object.keys(BOSS_TEMPLATES);
      const randomBossKey = bossKeys[Math.floor(Math.random() * bossKeys.length)];
      const bossTemplate = BOSS_TEMPLATES[randomBossKey];
      const bossMultiplier = 1.4 + (targetWave / 10) * 0.4; 

      const bossMonster = {
        ...bossTemplate,
        name: `👑 TITAN ${bossTemplate.name} (BOSS)`,
        maxHp: Math.floor(bossTemplate.maxHp * bossMultiplier),
        hp: Math.floor(bossTemplate.maxHp * bossMultiplier),
        attack: Math.floor(bossTemplate.attack * bossMultiplier),
        speed: bossTemplate.speed,
        level: targetWave,
        isBoss: true,
        key: `boss-${targetWave}-${bossTemplate.id}`,
        skillCd: 0,
        skillActiveDur: 0
      };
      
      setEnemyTeam([bossMonster]);
    } else {
      const keys = Object.keys(MONSTER_TEMPLATES);
      const enemyCount = maxTeamSlots; 
      const newEnemyTeam = [];

      for (let i = 0; i < enemyCount; i++) {
        const randKey = keys[Math.floor(Math.random() * keys.length)];
        const statMultiplier = 1 + (targetWave - 1) * 0.01; 
        const enemyLevel = Math.max(1, Math.floor(trainerLvl + (targetWave % 10) / 3));
        const baseTemplate = MONSTER_TEMPLATES[randKey];

        newEnemyTeam.push({
          ...baseTemplate,
          name: `Vanguard ${baseTemplate.name}`,
          maxHp: Math.floor(baseTemplate.maxHp * statMultiplier),
          hp: Math.floor(baseTemplate.maxHp * statMultiplier),
          attack: Math.floor(baseTemplate.attack * statMultiplier),
          level: enemyLevel,
          isBoss: false,
          key: `e-${i}-${randKey}`
        });
      }
      setEnemyTeam(newEnemyTeam);
    }
  };

  const handleSelectStarter = (pack) => {
    const chosen = pack.monsters.map((id, index) => ({
      ...MONSTER_TEMPLATES[id],
      hp: MONSTER_TEMPLATES[id].maxHp,
      level: 1,
      exp: 0,
      key: `p-${index}-${id}`
    }));
    setPlayerTeam(chosen);
    setHasChosenStarter(true);
    SOUNDS.success();
  };

  useEffect(() => {
    if (hasChosenStarter) {
      generateEnemyWave(wave);
    }
  }, [hasChosenStarter, wave]);

  const triggerAnimation = (key, type) => {
    setActiveAnims(prev => ({ ...prev, [key]: type }));
    setTimeout(() => { setActiveAnims(prev => ({ ...prev, [key]: "" })); }, 450);
  };

  const triggerFloatingText = (monsterKey, text, color = '#ef4444') => {
    setFloatingTexts(prev => ({ ...prev, [monsterKey]: { text, color } }));
    setTimeout(() => {
      setFloatingTexts(prev => {
        const copy = { ...prev };
        delete copy[monsterKey];
        return copy;
      });
    }, 900);
  };

  const buyTrainerExp = (cost) => {
    if (gold < cost) return;
    setGold(g => g - cost);
    SOUNDS.coin(); // 🪙 Play arcade coin trigger
    
    setTrainerExp(prevExp => {
      let totalExp = prevExp + 50;
      let currentLvl = trainerLvl;
      let expNeeded = Math.floor(100 * Math.pow(currentLvl, 1.2));
      while (totalExp >= expNeeded) {
        totalExp -= expNeeded;
        currentLvl++;
        setTrainerLvl(currentLvl);
        triggerFloatingText('global-trainer', 'LEVEL UP!', '#eab308');
        SOUNDS.success(); // 🎉 Triumphant level up audio spin
        expNeeded = Math.floor(100 * Math.pow(currentLvl, 1.2));
      }
      return totalExp;
    });
  };

  const buyMonsterExp = (monsterKey, cost) => {
    if (gold < cost) return;
    setGold(g => g - cost);
    SOUNDS.coin(); // 🪙 Play arcade coin trigger

    setPlayerTeam(prev => prev.map(m => {
      if (m.key !== monsterKey) return m;

      let newExp = m.exp + 50;
      let newLvl = m.level;
      let newAtk = m.attack;
      let newMaxHp = m.maxHp;
      let expNeeded = Math.floor(100 * Math.pow(newLvl, 1.2));

      while (newExp >= expNeeded) {
        newExp -= expNeeded;
        newLvl += 1;
        newAtk += 2;
        newMaxHp += 5;
        triggerFloatingText(m.key, 'LEVEL UP!', '#ca8a04');
        SOUNDS.success(); // 🎉 Level up celebrate spin
        expNeeded = Math.floor(100 * Math.pow(newLvl, 1.2));
      }

      return { ...m, exp: newExp, level: newLvl, attack: newAtk, maxHp: newMaxHp };
    }));
  };

  const openRecruitSelection = (cost) => {
    if (gold < cost || playerTeam.length >= maxTeamSlots) return;
    setIsChoosingRecruit(true);
  };

  const finalizeRecruitment = (monsterId, cost) => {
    setGold(g => g - cost);
    SOUNDS.coin(); // 🪙 Play arcade coin trigger
    const template = MONSTER_TEMPLATES[monsterId];

    const newMonster = {
      ...template,
      hp: template.maxHp,
      level: trainerLvl,
      exp: 0,
      key: `p-${Date.now()}-${monsterId}`
    };

    setPlayerTeam([...playerTeam, newMonster]);
    setIsChoosingRecruit(false);
  };

  const startAutoBattle = async () => {
    setIsFighting(true);
    
    let pTeam = playerTeam.map(m => ({ ...m, hp: m.maxHp, skillCd: 0, skillActiveDur: 0 })); 
    let eTeam = [...enemyTeam].map(m => ({ ...m, skillCd: 0, skillActiveDur: 0 }));
    setPlayerTeam(pTeam);
    
    while (pTeam.some(m => m.hp > 0) && eTeam.some(m => m.hp > 0)) {
      let order = [
        ...pTeam.filter(m => m.hp > 0).map(m => {
          let currentSpeed = m.speed;
          if (m.id === 'fox' && m.skillActiveDur > 0) currentSpeed += 6;
          const aeroActive = pTeam.some(a => a.id === 'aero' && a.skillActiveDur > 0);
          if (aeroActive) currentSpeed += 3;
          const krakenDebuff = eTeam.some(b => b.id === 'kraken' && b.skillActiveDur > 0);
          if (krakenDebuff) currentSpeed = Math.max(1, currentSpeed - 4);
          return { ...m, currentSpeed, team: 'player' };
        }),
        ...eTeam.filter(m => m.hp > 0).map(m => {
          let currentSpeed = m.speed;
          if (m.id === 'fox' && m.skillActiveDur > 0) currentSpeed += 6;
          const aeroActive = eTeam.some(a => a.id === 'aero' && a.skillActiveDur > 0);
          if (aeroActive) currentSpeed += 3;
          return { ...m, currentSpeed, team: 'enemy' };
        })
      ].sort((a, b) => b.currentSpeed - a.currentSpeed);

      for (let attacker of order) {
        if (pTeam.filter(m => m.hp > 0).length === 0 || eTeam.filter(m => m.hp > 0).length === 0) break;

        let activeAttacker = attacker.team === 'player' 
          ? pTeam.find(m => m.key === attacker.key && m.hp > 0)
          : eTeam.find(m => m.key === attacker.key && m.hp > 0);
        
        if (!activeAttacker) continue;

        let ownTeamList = attacker.team === 'player' ? pTeam : eTeam;
        let opposingTeamList = attacker.team === 'player' ? eTeam : pTeam;
        let target = opposingTeamList.find(m => m.hp > 0);
        if (!target) break;

        if (activeAttacker.skillActiveDur > 0) {
          activeAttacker.skillActiveDur--;
        }
        if (activeAttacker.skillCd > 0) activeAttacker.skillCd--;

        if (activeAttacker.skillCd === 0 && activeAttacker.passive) {
          const spec = activeAttacker.passive;
          
          if (activeAttacker.id === 'kraken') {
            activeAttacker.skillActiveDur = spec.duration;
            activeAttacker.skillCd = spec.cooldown;
            triggerFloatingText(activeAttacker.key, '🌌 EVENT HORIZON', '#a855f7');
          }
          else if (activeAttacker.id === 'specter') {
            activeAttacker.hp = Math.min(activeAttacker.maxHp, activeAttacker.hp + 25);
            activeAttacker.skillCd = spec.cooldown;
            triggerFloatingText(activeAttacker.key, '+25 TIME REWIND', '#3b82f6');
          }
          else if (['fox', 'golem', 'ghost', 'aero', 'pup'].includes(activeAttacker.id)) {
            activeAttacker.skillActiveDur = spec.duration;
            activeAttacker.skillCd = spec.cooldown;
            triggerFloatingText(activeAttacker.key, `⚡ ${spec.name}`, '#eab308');
          } 
          else if (activeAttacker.id === 'leaflet' && activeAttacker.hp < activeAttacker.maxHp) {
            activeAttacker.hp = Math.min(activeAttacker.maxHp, activeAttacker.hp + 12);
            activeAttacker.skillCd = spec.cooldown;
            triggerFloatingText(activeAttacker.key, '+12 ROOT HEAL', '#22c55e');
          }
        }

        if (activeAttacker.id === 'draco' && activeAttacker.hp < (activeAttacker.maxHp / 2) && activeAttacker.skillCd === 0) {
          activeAttacker.skillActiveDur = 2;
          activeAttacker.skillCd = 99;
          triggerFloatingText(activeAttacker.key, '😡 FURY STANCE', '#f43f5e');
        }

        triggerAnimation(activeAttacker.key, attacker.team === 'player' ? 'anim-dash-right' : 'anim-dash-left');
        await new Promise(r => setTimeout(r, 150));

        let baseDamage = activeAttacker.attack + Math.floor(activeAttacker.level * 1.5);
        
        if (activeAttacker.id === 'kraken' && activeAttacker.skillActiveDur > 0) {
          baseDamage += 5;
        }

        if (activeAttacker.id === 'behemoth') {
          activeAttacker.attack += 1;
          activeAttacker.speed += 1;
          triggerFloatingText(activeAttacker.key, '⚙️ OVERDRIVE TICK', '#ef4444');
        }

        if (target.id === 'behemoth' && target.hp < (target.maxHp * 0.3)) {
          baseDamage = Math.floor(baseDamage * 0.6);
          triggerFloatingText(target.key, '🛡️ PLATING BLOCKED', '#a3a3a3');
        }

        if (activeAttacker.id === 'pup' && activeAttacker.skillActiveDur > 0) baseDamage += 8;
        if (activeAttacker.id === 'draco' && activeAttacker.skillActiveDur > 0) baseDamage += 4;
        if (activeAttacker.id === 'finne' && target.hp < (target.maxHp / 2)) {
          baseDamage += 6;
          triggerFloatingText(activeAttacker.key, '🦈 BLOOD HUNT', '#ef4444');
        }

        let isDodged = false;
        if (target.id === 'ghost' && target.skillActiveDur > 0) {
          target.skillActiveDur = 0; 
          baseDamage = 0;
          isDodged = true;
          triggerFloatingText(target.key, '💨 DODGED!', '#60a5fa');
        } else if (target.id === 'golem' && target.skillActiveDur > 0) {
          baseDamage = Math.floor(baseDamage * 0.5);
          triggerFloatingText(target.key, '🛡️ FORTIFIED', '#a3a3a3');
        }

        if (baseDamage > 0) {
          target.hp = Math.max(0, target.hp - baseDamage);
          triggerFloatingText(target.key, `-${baseDamage}`, '#ef4444');
          SOUNDS.hit(); // ⚔️ Crisp retro impact sound
          
          if (target.id === 'slime' && target.skillCd === 0 && activeAttacker.hp > 0) {
            activeAttacker.speed = Math.max(1, activeAttacker.speed - 2);
            target.skillCd = target.passive.cooldown;
            triggerFloatingText(activeAttacker.key, '🦠 SLIMED! (-2 SPD)', '#22c55e');
          }
          
          triggerAnimation(target.key, 'anim-shake');
        }

        if (target.hp <= 0 && !isDodged) {
          triggerFloatingText(target.key, '💀 FAINTED', '#71717a');
          SOUNDS.hurt(); // 💥 Heavy crunch sound on fainting
        }

        setPlayerTeam([...pTeam]);
        setEnemyTeam([...eTeam]);
        await new Promise(r => setTimeout(r, 600));
      }
    }

    const playerWon = pTeam.some(m => m.hp > 0);
    const isBossWave = wave % 10 === 0;

    if (playerWon) {
      SOUNDS.success(); // 🎉 Victory sound cascade
      const baseGold = Math.floor((40 + Math.floor(Math.random() * 25)) * (1 + wave * 0.01));
      const bossBonusGold = isBossWave ? 150 : 0;
      const totalGoldGained = baseGold + bossBonusGold;
      setGold(g => g + totalGoldGained);
      
      const expRewardPerMonster = isBossWave ? (50 + wave * 6) : (30 + wave * 3);
      const totalTrainerExpGained = isBossWave ? (60 + wave * 5) : (40 + wave * 2);

      pTeam = pTeam.map(m => {
        let newExp = m.exp + expRewardPerMonster;
        let currentLvl = m.level;
        let newAtk = m.attack;
        let newMaxHp = m.maxHp;
        let expNeeded = Math.floor(100 * Math.pow(currentLvl, 1.2));
        
        while (newExp >= expNeeded) {
          newExp -= expNeeded;
          currentLvl += 1;
          newAtk += 2;
          newMaxHp += 5;
          expNeeded = Math.floor(100 * Math.pow(currentLvl, 1.2));
        }
        return { ...m, exp: newExp, level: currentLvl, attack: newAtk, maxHp: newMaxHp };
      });
      setPlayerTeam(pTeam);

      setTrainerExp(prevExp => {
        let totalExp = prevExp + totalTrainerExpGained;
        let currentLvl = trainerLvl;
        let expNeeded = Math.floor(100 * Math.pow(currentLvl, 1.2));

        while (totalExp >= expNeeded) {
          totalExp -= expNeeded;
          currentLvl++;
          setTrainerLvl(currentLvl);
          expNeeded = Math.floor(100 * Math.pow(currentLvl, 1.2));
        }
        return totalExp;
      });

      setWinner('Player');
      setMatchSummary({ outcome: 'VICTORY', gold: totalGoldGained, exp: totalTrainerExpGained });
      setShowResultScreen(true);
    } else {
      SOUNDS.hurt(); // 💥 Heavy loss thud
      const pityGold = 15 + wave + Math.floor(Math.random() * 10);
      setGold(g => g + pityGold);

      setWinner('Enemy');
      setMatchSummary({ outcome: 'DEFEAT', gold: pityGold, exp: 0 });
      setShowResultScreen(true);
    }
    setIsFighting(false);
  };

  const handleAdvanceWave = () => {
    setPlayerTeam(prev => prev.map(m => ({ ...m, hp: m.maxHp })));
    setWave(w => w + 1);
    setWinner(null);
  };

  const [selectedDraftIds, setSelectedDraftIds] = useState([]);

  if (!hasChosenStarter) {
    const isDraftComplete = selectedDraftIds.length === 3;

    const toggleDraftMonster = (id) => {
      if (selectedDraftIds.includes(id)) {
        setSelectedDraftIds(prev => prev.filter(x => x !== id));
      } else if (selectedDraftIds.length < 3) {
        setSelectedDraftIds(prev => [...prev, id]);
        SOUNDS.hit(); // Quick select feedback blip
      }
    };

    const handleConfirmCustomTeam = () => {
      if (selectedDraftIds.length !== 3) return;
      const chosen = selectedDraftIds.map((id, index) => ({
        ...MONSTER_TEMPLATES[id],
        hp: MONSTER_TEMPLATES[id].maxHp,
        level: 1,
        exp: 0,
        key: `p-${index}-${id}`
      }));
      setPlayerTeam(chosen);
      setHasChosenStarter(true);
      SOUNDS.success();
    };

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#111', color: '#fff', fontFamily: 'monospace', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#eab308', fontSize: '28px', marginBottom: '4px' }}>BUILD YOUR STARTER SQUAD</h1>
        <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '24px' }}>Select exactly <span style={{ color: '#eab308', fontWeight: 'bold' }}>3 monsters</span> to form your unique vanguard line ({selectedDraftIds.length}/3 selected)</p>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px', marginBottom: '30px' }}>
          {Object.keys(MONSTER_TEMPLATES).map((key) => {
            const meta = MONSTER_TEMPLATES[key];
            const isSelected = selectedDraftIds.includes(key);
            return (
              <div 
                key={key} 
                onClick={() => toggleDraftMonster(key)}
                style={{ 
                  border: isSelected ? '2px solid #eab308' : '2px solid #333', 
                  backgroundColor: isSelected ? '#26200a' : '#1a1a1a', 
                  borderRadius: '10px', padding: '16px', width: '180px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' 
                }}
              >
                <PixelSprite spriteId={meta.id} size={48} />
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: isSelected ? '#eab308' : '#fff', marginTop: '8px' }}>{meta.name}</div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>{meta.type}</div>
                <div style={{ fontSize: '11px', color: '#aaa', borderTop: '1px solid #333', paddingTop: '6px', textAlign: 'left', lineHeight: '1.4' }}>
                  ❤️ HP: <span style={{ color: '#10b981' }}>{meta.maxHp}</span><br />
                  ⚔️ ATK: <span style={{ color: '#ef4444' }}>{meta.attack}</span><br />
                  ⚡ SPD: <span style={{ color: '#3b82f6' }}>{meta.speed}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={handleConfirmCustomTeam} disabled={!isDraftComplete} style={{ padding: '14px 40px', backgroundColor: isDraftComplete ? '#eab308' : '#333', border: 'none', color: isDraftComplete ? '#000' : '#666', fontWeight: 'bold', borderRadius: '6px', cursor: isDraftComplete ? 'pointer' : 'not-allowed', fontSize: '14px', textTransform: 'uppercase' }}>
          {isDraftComplete ? 'Confirm & Enter Arena' : 'Select 3 Monsters'}
        </button>
      </div>
    );
  }

  const moveSquadMember = (index, direction) => {
    if (isFighting) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= playerTeam.length) return;
    const updated = [...playerTeam];
    const temporary = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temporary;
    setPlayerTeam(updated);
    SOUNDS.hit(); // Simple order swap tap
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f11', color: '#f5f5f7', padding: '24px', fontFamily: 'sans-serif' }}>
      
      {/* GLOBAL HUD HEADER */}
      <header style={{ position: 'relative', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div id="global-trainer">
          <h1 style={{ margin: 0, color: '#eab308', fontSize: '26px', letterSpacing: '0.5px' }}>⚔️ PIXEL-MONSTERS ARENA</h1>
          <div style={{ display: 'flex', gap: '20px', marginTop: '6px', color: '#a3a3a3', fontSize: '13px' }}>
            <span>Waves: <strong style={{ color: '#fff' }}>{wave}</strong></span>
            <span>👑 Trainer Lvl {trainerLvl} Progress: <strong>{trainerExp} / {Math.floor(100 * Math.pow(trainerLvl, 1.2))} EXP</strong> (Max Slots: {maxTeamSlots})</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* 🎵 Retro BGM Toggle Switch Button */}
          <button 
            onClick={toggleBGM}
            style={{ 
              backgroundColor: bgmOn ? '#16a34a' : '#27272a', 
              border: bgmOn ? '1px solid #22c55e' : '1px solid #4b5563', 
              color: '#fff', 
              padding: '10px 14px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {bgmOn ? '🎵 BGM: ON' : '🔇 BGM: OFF'}
          </button>

          <div style={{ backgroundColor: '#1a1a1f', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ca8a04', color: '#eab308', fontWeight: 'bold', fontSize: '16px' }}>
            🪙 {gold}g
          </div>
        </div>

        {/* Floating Text anchor for global trainer rewards */}
        {floatingTexts['global-trainer'] && (
          <div style={{ position: 'absolute', right: '150px', top: '10px', color: floatingTexts['global-trainer'].color, fontWeight: '900', fontSize: '20px', zIndex: 50 }}>
            {floatingTexts['global-trainer'].text}
          </div>
        )}
      </header>

      {/* 3-COLUMN ARCADE INTERFACE CORD */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* === LEFT COLUMN: PLAYER ROSTER SQUAD === */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#151518', padding: '16px', borderRadius: '12px', border: '1px solid #222' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#a3a3a3', letterSpacing: '0.5px' }}>MY TEAM</h3>
          {playerTeam.map((m, idx) => (
            <div key={m.key} style={{ display: 'flex', backgroundColor: '#0a0a0c', padding: '12px', borderRadius: '8px', border: '1px solid #222', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '12px' }}>
                <button disabled={isFighting || idx === 0} onClick={() => moveSquadMember(idx, -1)} style={{ background: '#222', border: 'none', color: idx === 0 ? '#444' : '#fff', cursor: 'pointer', padding: '2px 6px', borderRadius: '3px', fontSize: '10px' }}>▲</button>
                <button disabled={isFighting || idx === playerTeam.length - 1} onClick={() => moveSquadMember(idx, 1)} style={{ background: '#222', border: 'none', color: idx === playerTeam.length - 1 ? '#444' : '#fff', cursor: 'pointer', padding: '2px 6px', borderRadius: '3px', fontSize: '10px' }}>▼</button>
              </div>

              <div style={{ flex: 1, marginRight: '12px' }}>
                <div style={{ fontWeight: 'bold', color: '#60a5fa' }}>{m.name} <span style={{ color: '#ca8a04', fontSize: '11px' }}>Lvl {m.level}</span></div>
                <div style={{ color: '#777', fontSize: '11px', marginTop: '2px' }}>ATK: {m.attack} | HP: {m.hp}/{m.maxHp} | EXP: {m.exp}/{Math.floor(100 * Math.pow(m.level, 1.2))}</div>
                <div style={{ width: '100%', backgroundColor: '#222', height: '6px', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(m.hp / m.maxHp) * 100}%`, backgroundColor: '#22c55e', height: '100%', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* OVERLAY WRAPPER FOR FLOATING TEXT */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px' }}>
                <PixelSprite spriteId={m.id} size={64} animationClass={activeAnims[m.key] || ""} />
                {floatingTexts[m.key] && (
                  <div style={{ position: 'absolute', top: '-16px', color: floatingTexts[m.key].color, fontWeight: '900', fontSize: '14px', textShadow: '2px 2px 0px #000', whiteSpace: 'nowrap', zIndex: 10 }}>
                    {floatingTexts[m.key].text}
                  </div>
                )}
              </div>
            </div>
          ))}
          {playerTeam.length < maxTeamSlots && (
            <div style={{ border: '2px dashed #333', padding: '16px', borderRadius: '8px', textAlign: 'center', color: '#525252', fontSize: '12px' }}>Empty Slot Active. Purchase below to recruit.</div>
          )}
        </div>

        {/* === MIDDLE COLUMN: BATTLE ENGINE MULTIPLEXER CONTROLS === */}
        <div style={{ flex: 0.7, display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          {winner ? (
            <button onClick={handleAdvanceWave} style={{ width: '100%', padding: '16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
              {(wave + 1) % 10 === 0 ? '🚨 APPROACH TITAN NEST' : 'ADVANCE TO NEXT WAVE'}
            </button>
          ) : (
            <button disabled={isFighting || playerTeam.length === 0} onClick={startAutoBattle} style={{ width: '100%', padding: '20px', backgroundColor: isFighting ? '#3f3f46' : wave % 10 === 0 ? '#ef4444' : '#eab308', color: wave % 10 === 0 ? '#fff' : '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isFighting ? 'not-allowed' : 'pointer', fontSize: '16px', letterSpacing: '0.5px' }}>
              {isFighting ? '⚔️ BATTLE IN PROGRESS...' : wave % 10 === 0 ? '👑 ENGAGE BOSS TITAN' : '⚔️ LAUNCH COMBAT'}
            </button>
          )}
        </div>

        {/* === RIGHT COLUMN: OPPOSING ADVERSARIES SQUAD === */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: wave % 10 === 0 ? '#221415' : '#151518', padding: '16px', borderRadius: '12px', border: wave % 10 === 0 ? '1px solid #ef4444' : '1px solid #222' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: wave % 10 === 0 ? '#ef4444' : '#a3a3a3', letterSpacing: '0.5px' }}>
            {wave % 10 === 0 ? '🚨 TARGET BOSS TITAN' : 'ENEMY TEAM'}
          </h3>
          {enemyTeam.map((m) => (
            <div key={m.key} style={{ display: 'flex', backgroundColor: '#0a0a0c', padding: '12px', borderRadius: '8px', border: m.isBoss ? '1px solid #ef4444' : '1px solid #222', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, marginRight: '12px' }}>
                <div style={{ fontWeight: 'bold', color: m.isBoss ? '#ef4444' : '#f43f5e' }}>{m.name} <span style={{ color: '#71717a', fontSize: '11px' }}>Lvl {m.level}</span></div>
                <div style={{ color: '#777', fontSize: '11px', marginTop: '2px' }}>ATK: {m.attack} | HP: {m.hp}/{m.maxHp}</div>
                <div style={{ width: '100%', backgroundColor: '#222', height: '6px', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(m.hp / m.maxHp) * 100}%`, backgroundColor: '#ef4444', height: '100%', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* OVERLAY WRAPPER FOR OPPONENT FLOATING TEXT */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: m.isBoss ? '110px' : '64px' }}>
                <PixelSprite spriteId={m.id} size={m.isBoss ? 110 : 64} animationClass={activeAnims[m.key] || ""} />
                {floatingTexts[m.key] && (
                  <div style={{ position: 'absolute', top: '-16px', color: floatingTexts[m.key].color, fontWeight: '900', fontSize: m.isBoss ? '18px' : '14px', textShadow: '2px 2px 0px #000', whiteSpace: 'nowrap', zIndex: 10 }}>
                    {floatingTexts[m.key].text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 🛒 LOWER CANVAS SHOP INTERFACE SYSTEM */}
      <div style={{ width: '100%', marginTop: '24px', backgroundColor: '#141417', border: '1px solid #222', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isChoosingRecruit ? (
          <div style={{ backgroundColor: '#0a0a0c', padding: '14px', borderRadius: '8px', border: '1px solid #a855f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <span style={{ color: '#a855f7', fontSize: '13px', fontWeight: 'bold' }}>ADOPT SQUAD COMPANION (75g):</span>
              <button onClick={() => setIsChoosingRecruit(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontFamily: 'monospace' }}>[CANCEL]</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
              {Object.keys(MONSTER_TEMPLATES).map((key) => {
                const spec = MONSTER_TEMPLATES[key];
                return (
                  <div key={key} style={{ background: '#0a0a0c', padding: '10px', borderRadius: '6px', textAlign: 'center', minWidth: '110px', border: '1px solid #222' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{spec.name}</div>
                    <div style={{ margin: '6px 0' }}><PixelSprite spriteId={spec.id} size={32} /></div>
                    <button onClick={() => finalizeRecruitment(key, 75)} style={{ padding: '4px 10px', backgroundColor: '#a855f7', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Adopt</button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ borderRight: '1px solid #222', paddingRight: '20px', flex: '1 1 240px' }}>
              <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold', textTransform: 'uppercase' }}>Trainer Guild</div>
              <button disabled={isFighting || gold < 40} onClick={() => buyTrainerExp(40)} style={{ marginTop: '8px', padding: '10px', backgroundColor: '#0a0a0c', border: '1px solid #a855f7', color: '#fff', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>📘 Academy Manual (+50 T-EXP) (40g)</button>
            </div>
            <div style={{ borderRight: '1px solid #222', paddingRight: '20px', flex: '1 1 200px' }}>
              <div style={{ fontSize: '11px', color: '#ca8a04', fontWeight: 'bold', textTransform: 'uppercase' }}>Acquire New Squad Members</div>
              <button disabled={isFighting || playerTeam.length >= maxTeamSlots || gold < 75} onClick={() => openRecruitSelection(75)} style={{ marginTop: '8px', padding: '10px', backgroundColor: '#0a0a0c', border: '1px solid #ca8a04', color: '#fff', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', width: '100%', opacity: playerTeam.length >= maxTeamSlots ? 0.4 : 1 }}>🍳 Call Mercenary Ally (75g)</button>
            </div>
            <div style={{ flex: '2 1 340px' }}>
              <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Hyper-Training Center (+50 EXP for 50g)</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {playerTeam.map((monster) => (
                  <button key={`train-${monster.key}`} disabled={isFighting || gold < 50} onClick={() => buyMonsterExp(monster.key, 50)} style={{ padding: '8px 12px', backgroundColor: '#0a0a0c', border: '1px solid #22c55e', color: '#fff', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', flex: '1 1 auto' }}>🎯 {monster.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🏆 POST-MATCH LOOT SUMMARY PANELS MODAL */}
      {showResultScreen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(5, 5, 6, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#151518', border: matchSummary.outcome === 'VICTORY' ? '2px solid #eab308' : '2px solid #ef4444', borderRadius: '16px', padding: '32px', width: '360px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '26px', color: matchSummary.outcome === 'VICTORY' ? '#eab308' : '#ef4444', letterSpacing: '1px' }}>
              {matchSummary.outcome === 'VICTORY' ? '🎉 VICTORY!' : '💀 SQUAD WIPED'}
            </h2>
            <p style={{ color: '#71717a', fontSize: '12px', margin: '0 0 20px 0' }}>Combat Results</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#0a0a0c', padding: '12px 16px', borderRadius: '8px', border: '1px solid #222' }}>
                <span style={{ color: '#a3a3a3' }}>Gold Spoils:</span>
                <strong style={{ color: '#eab308' }}>+{matchSummary.gold}g</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#0a0a0c', padding: '12px 16px', borderRadius: '8px', border: '1px solid #222' }}>
                <span style={{ color: '#a3a3a3' }}>Trainer Experience:</span>
                <strong style={{ color: '#60a5fa' }}>+{matchSummary.exp} EXP</strong>
              </div>
            </div>
            <button onClick={() => setShowResultScreen(false)} style={{ width: '100%', padding: '12px', backgroundColor: matchSummary.outcome === 'VICTORY' ? '#eab308' : '#ef4444', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              NEXT WAVE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;