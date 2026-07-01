import React, { useState, useEffect } from 'react';
import { PixelSprite } from './PixelSprite';
import { SOUNDS } from './sound';
import { ENVIRONMENTS } from './environments'; // adjust path as needed

const MONSTER_TEMPLATES = {
  slime: { id: 'slime', name: 'Slime-bough', type: 'Tank', maxHp: 60, attack: 8, speed: 2, passive: { name: "Sticky Armor", desc: "Reduces attacker speed by 2 when hit. Cooldown: 2 turns.", cooldown: 2 } },
  fox: { id: 'fox', name: 'Ember-fox', type: 'Glass Cannon', maxHp: 30, attack: 18, speed: 8, passive: { name: "Blazing Dash", desc: "Gain +6 Speed for 2 turns. Cooldown: 4 turns.", duration: 2, cooldown: 4 } },
  pup: { id: 'pup', name: 'Spark-pup', type: 'Disruptor', maxHp: 45, attack: 12, speed: 5, passive: { name: "Overcharge", desc: "Empowers next attack by +8 DMG. Cooldown: 3 turns.", duration: 1, cooldown: 3 } },
  draco: { id: 'draco', name: 'Pyre-Draco', type: 'Brawler', maxHp: 55, attack: 14, speed: 4, passive: { name: "Fury Stance", desc: "Gain +4 ATK for 2 turns when dropped below 50% HP. Once per battle.", cooldown: 99 } },
  golem: { id: 'golem', name: 'Clay-Golem', type: 'Wall', maxHp: 80, attack: 6, speed: 1, passive: { name: "Fortify", desc: "Blocks 50% incoming damage for 2 turns. Cooldown: 5 turns.", duration: 2, cooldown: 5 } },
  ghost: { id: 'ghost', name: 'Void-Ghost', type: 'Stalker', maxHp: 40, attack: 15, speed: 7, passive: { name: "Phase Shift", desc: "Guaranteed to dodge the next attack. Cooldown: 4 turns.", duration: 1, cooldown: 4 } },
  leaflet: { id: 'leaflet', name: 'Leaflet-Sprout', type: 'Healer/Regen', maxHp: 50, attack: 10, speed: 3, passive: { name: "Root Heal", desc: "Heals self for 12 HP. Cooldown: 3 turns.", cooldown: 3 } },
  aero: { id: 'aero', name: 'Aero-Gale', type: 'Speeder', maxHp: 35, attack: 13, speed: 9, passive: { name: "Tailwind", desc: "Grants all allies +3 Speed for 2 turns. Cooldown: 5 turns.", duration: 2, cooldown: 5 } },
  finne: { id: 'finne', name: 'Finne-Chomper', type: 'Striker', maxHp: 48, attack: 16, speed: 6, passive: { name: "Blood Hunt", desc: "Deals +6 DMG if target is below half HP. Permanent Passive.", cooldown: 0 } },
  gargoyle: { id: 'gargoyle', name: 'Stone-Gargoyle', type: 'Colossus', maxHp: 70, attack: 10, speed: 3, passive: { name: "Slate Aegis", desc: "Gains a 15 HP shield at start of battle.", cooldown: 99 } },
  wraith: { id: 'wraith', name: 'Crypt-Wraith', type: 'Infiltrator', maxHp: 38, attack: 17, speed: 6, passive: { name: "Terror Shroud", desc: "Reduces target attack by 4 on hit for 1 turn. Cooldown: 3 turns.", duration: 1, cooldown: 3 } },
  shadowfang: { id: 'shadowfang', name: 'Shadow-Fang', type: 'Assassin', maxHp: 42, attack: 15, speed: 8, passive: { name: "Umbral Rend", desc: "Deals bonus damage equal to 15% of target's current HP. Cooldown: 3 turns.", cooldown: 3 } },
  plaguerat: { id: 'plaguerat', name: 'Plague-Rat', type: 'Debuffer', maxHp: 36, attack: 11, speed: 6, passive: { name: "Toxic Sepsis", desc: "Inflicts poison dealing 5 damage per turn for 3 turns. Cooldown: 4 turns.", duration: 3, cooldown: 4 } }
};

const BOSS_TEMPLATES = {
  kraken: { id: 'kraken', name: 'Nebula-Kraken', type: 'Cosmic Titan', maxHp: 120, attack: 10, speed: 4, passive: { name: "Event Horizon", desc: "Slows player squad speed by 4 and gains +5 ATK for 3 rounds.", duration: 3, cooldown: 99 } },
  behemoth: { id: 'behemoth', name: 'Rust-Behemoth', type: 'Mecha Titan', maxHp: 150, attack: 7, speed: 2, passive: { name: "Overdrive Meltdown", desc: "Permanently gains +1 ATK and +1 SPD on turn. Breaks shield at 30% HP.", duration: 0, cooldown: 0 } },
  specter: { id: 'specter', name: 'Chrono-Specter', type: 'Phantasm Titan', maxHp: 100, attack: 12, speed: 6, passive: { name: "Time Rewind", desc: "Heals 25 HP and clears debuffs every 4 turns.", cooldown: 4 } }
};

function App() {
  const [bgmOn, setBgmOn] = useState(false);
  const toggleBGM = () => {
    if (bgmOn) { SOUNDS.stopBGM(); setBgmOn(false); } 
    else { SOUNDS.startBGM(); setBgmOn(true); }
  };

  const [hasChosenStarter, setHasChosenStarter] = useState(false);
  const [playerTeam, setPlayerTeam] = useState([]);
  const [enemyTeam, setEnemyTeam] = useState([]);
  const [isFighting, setIsFighting] = useState(false);
  const [winner, setWinner] = useState(null);
  const [activeAnims, setActiveAnims] = useState({});

  const [gold, setGold] = useState(100);
  const [trainerLvl, setTrainerLvl] = useState(1);
  const [trainerExp, setTrainerExp] = useState(0);
  const [wave, setWave] = useState(1);
  const [currentEnvKey, setCurrentEnvKey] = useState('CLEAR');

  const [floatingTexts, setFloatingTexts] = useState({});
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [matchSummary, setMatchSummary] = useState({ outcome: '', gold: 0, exp: 0 });

  const [isChoosingRecruit, setIsChoosingRecruit] = useState(false);
  const [showAlmanac, setShowAlmanac] = useState(false);
  const [selectedDraftIds, setSelectedDraftIds] = useState([]);

  const maxTeamSlots = Math.min(4, 2 + Math.floor((trainerLvl - 1) / 2));

  const generateEnemyWave = (targetWave) => {
    if (targetWave % 10 === 0) {
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
        skillActiveDur: 0,
        speedMod: 0
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
          key: `e-${i}-${randKey}`,
          speedMod: 0
        });
      }
      setEnemyTeam(newEnemyTeam);
    }
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
      setFloatingTexts(prev => { const copy = { ...prev }; delete copy[monsterKey]; return copy; });
    }, 900);
  };

  const buyTrainerExp = (cost) => {
    if (gold < cost) return;
    setGold(g => g - cost);
    SOUNDS.coin();
    setTrainerExp(prevExp => {
      let totalExp = prevExp + 50;
      let currentLvl = trainerLvl;
      let expNeeded = Math.floor(100 * Math.pow(currentLvl, 1.2));
      while (totalExp >= expNeeded) {
        totalExp -= expNeeded;
        currentLvl++;
        setTrainerLvl(currentLvl);
        triggerFloatingText('global-trainer', 'LEVEL UP!', '#eab308');
        SOUNDS.success();
        expNeeded = Math.floor(100 * Math.pow(currentLvl, 1.2));
      }
      return totalExp;
    });
  };

  const buyMonsterExp = (monsterKey, cost) => {
    if (gold < cost) return;
    setGold(g => g - cost);
    SOUNDS.coin();
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
        SOUNDS.success();
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
    SOUNDS.coin();
    const template = MONSTER_TEMPLATES[monsterId];
    const newMonster = { ...template, hp: template.maxHp, level: trainerLvl, exp: 0, key: `p-${Date.now()}-${monsterId}`, speedMod: 0 };
    setPlayerTeam([...playerTeam, newMonster]);
    setIsChoosingRecruit(false);
  };

  const startAutoBattle = async () => {
    setIsFighting(true);
    let pTeam = playerTeam.map(m => {
      let initialShield = 0;
      if (m.id === 'gargoyle') initialShield = 15;
      return { ...m, hp: m.maxHp, shield: initialShield, skillCd: 0, skillActiveDur: 0, speedMod: 0, attackMod: 0, poisonTurns: 0 };
    });
    let eTeam = [...enemyTeam].map(m => {
      let initialShield = 0;
      if (m.id === 'gargoyle') initialShield = 15;
      return { ...m, shield: initialShield, skillCd: 0, skillActiveDur: 0, speedMod: 0, attackMod: 0, poisonTurns: 0 };
    });
    setPlayerTeam(pTeam);

    while (pTeam.some(m => m.hp > 0) && eTeam.some(m => m.hp > 0)) {
      let order = [
        ...pTeam.filter(m => m.hp > 0).map(m => {
          let currentSpeed = m.speed + (m.speedMod || 0);
          if (m.id === 'fox' && m.skillActiveDur > 0) currentSpeed += 6;
          const aeroActive = pTeam.some(a => a.id === 'aero' && a.skillActiveDur > 0);
          if (aeroActive) currentSpeed += 3;
          const krakenDebuff = eTeam.some(b => b.id === 'kraken' && b.skillActiveDur > 0);
          if (krakenDebuff) currentSpeed = Math.max(1, currentSpeed - 4);
          return { ...m, currentSpeed, team: 'player' };
        }),
        ...eTeam.filter(m => m.hp > 0).map(m => {
          let currentSpeed = m.speed + (m.speedMod || 0);
          if (m.id === 'fox' && m.skillActiveDur > 0) currentSpeed += 6;
          const aeroActive = eTeam.some(a => a.id === 'aero' && a.skillActiveDur > 0);
          if (aeroActive) currentSpeed += 3;
          return { ...m, currentSpeed, team: 'enemy' };
        })
      ].sort((a, b) => b.currentSpeed - a.currentSpeed);

      for (let attacker of order) {
        if (pTeam.filter(m => m.hp > 0).length === 0 || eTeam.filter(m => m.hp > 0).length === 0) break;
        let activeAttacker = attacker.team === 'player' ? pTeam.find(m => m.key === attacker.key && m.hp > 0) : eTeam.find(m => m.key === attacker.key && m.hp > 0);
        if (!activeAttacker) continue;

        let opposingTeamList = attacker.team === 'player' ? eTeam : pTeam;
        let target = opposingTeamList.find(m => m.hp > 0);
        if (!target) break;

        if (activeAttacker.poisonTurns > 0) {
          activeAttacker.hp = Math.max(0, activeAttacker.hp - 5);
          activeAttacker.poisonTurns--;
          triggerFloatingText(activeAttacker.key, '-5 🤢 POISON', '#22c55e');
          triggerAnimation(activeAttacker.key, 'anim-shake');
          if (activeAttacker.hp <= 0) {
            triggerFloatingText(activeAttacker.key, '💀 FAINTED', '#71717a');
            setPlayerTeam([...pTeam]);
            setEnemyTeam([...eTeam]);
            continue;
          }
        }

        if (activeAttacker.skillActiveDur > 0) {
          activeAttacker.skillActiveDur--;
          if (activeAttacker.skillActiveDur === 0 && activeAttacker.id === 'wraith') {
            if (target) target.attackMod = (target.attackMod || 0) + 4;
          }
        }
        if (activeAttacker.skillCd > 0) activeAttacker.skillCd--;

        if (activeAttacker.skillCd === 0 && activeAttacker.passive) {
          const spec = activeAttacker.passive;
          if (activeAttacker.id === 'kraken') {
            activeAttacker.skillActiveDur = spec.duration;
            activeAttacker.skillCd = spec.cooldown;
            triggerFloatingText(activeAttacker.key, '🌌 EVENT HORIZON', '#a855f7');
          } else if (activeAttacker.id === 'specter') {
            activeAttacker.hp = Math.min(activeAttacker.maxHp, activeAttacker.hp + 25);
            activeAttacker.skillCd = spec.cooldown;
            triggerFloatingText(activeAttacker.key, '+25 TIME REWIND', '#3b82f6');
          } else if (['fox', 'golem', 'ghost', 'aero', 'pup', 'wraith', 'plaguerat', 'shadowfang'].includes(activeAttacker.id)) {
            activeAttacker.skillActiveDur = spec.duration;
            activeAttacker.skillCd = spec.cooldown;
            triggerFloatingText(activeAttacker.key, `⚡ ${spec.name}`, '#eab308');
          } else if (activeAttacker.id === 'leaflet' && activeAttacker.hp < activeAttacker.maxHp) {
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

        // --- HAZARD MECHANIC 1: DENSE FOG (33% Chance to Miss Entirely) ---
        if (currentEnvKey === 'FOG' && Math.random() < 0.33) {
          triggerFloatingText(activeAttacker.key, '🌫️ MISSED (FOG)', '#9ca3af');
          await new Promise(r => setTimeout(r, 400));
        } else {
          triggerAnimation(activeAttacker.key, attacker.team === 'player' ? 'anim-dash-right' : 'anim-dash-left');
          await new Promise(r => setTimeout(r, 150));

          let totalAttackerAtk = activeAttacker.attack + (activeAttacker.attackMod || 0);
          let baseDamage = totalAttackerAtk + Math.floor(activeAttacker.level * 1.5);

          if (activeAttacker.id === 'kraken' && activeAttacker.skillActiveDur > 0) baseDamage += 5;
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

          if (activeAttacker.id === 'shadowfang' && activeAttacker.skillActiveDur > 0) {
            const bonus = Math.floor(target.hp * 0.15);
            baseDamage += bonus;
            triggerFloatingText(activeAttacker.key, `🗡️ UMBRAL REND (+${bonus})`, '#3b82f6');
          }
          if (activeAttacker.id === 'wraith' && activeAttacker.skillActiveDur > 0) {
            target.attackMod = (target.attackMod || 0) - 4;
            triggerFloatingText(target.key, '🍃 WEAKENED (-4 ATK)', '#a855f7');
          }
          if (activeAttacker.id === 'plaguerat' && activeAttacker.skillActiveDur > 0) {
            target.poisonTurns = 3;
            triggerFloatingText(target.key, '🤢 SEPSIS INFLICTED', '#22c55e');
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
            if ((target.shield || 0) > 0) {
              if (baseDamage <= target.shield) {
                target.shield -= baseDamage;
                triggerFloatingText(target.key, `🛡️ BLOCK (-${baseDamage} Shield)`, '#3b82f6');
                baseDamage = 0;
              } else {
                baseDamage -= target.shield;
                triggerFloatingText(target.key, `💥 SHIELD BROKE (-${target.shield} Shield)`, '#3b82f6');
                target.shield = 0;
              }
            }
            if (baseDamage > 0) {
              target.hp = Math.max(0, target.hp - baseDamage);
              triggerFloatingText(target.key, `-${baseDamage}`, '#ef4444');
              SOUNDS.hit();
              if (target.id === 'slime' && target.skillCd === 0 && activeAttacker.hp > 0) {
                activeAttacker.speed = Math.max(1, activeAttacker.speed - 2);
                target.skillCd = target.passive.cooldown;
                triggerFloatingText(activeAttacker.key, '🦠 SLIMED! (-2 SPD)', '#22c55e');
              }
              triggerAnimation(target.key, 'anim-shake');
            }
          }

          if (target.hp <= 0 && !isDodged) {
            triggerFloatingText(target.key, '💀 FAINTED', '#71717a');
            SOUNDS.hurt();
          }
        }

        // --- HAZARD MECHANIC 2: ACID REIN (Corrosive Ticking Damage At End Of Actions) ---
        if (currentEnvKey === 'RAIN' && activeAttacker.hp > 0) {
          activeAttacker.hp = Math.max(0, activeAttacker.hp - 3);
          triggerFloatingText(activeAttacker.key, '-3 🌧️ ACID', '#a3e635');
          triggerAnimation(activeAttacker.key, 'anim-shake');
          if (activeAttacker.hp <= 0) {
            triggerFloatingText(activeAttacker.key, '💀 FAINTED', '#71717a');
            SOUNDS.hurt();
          }
        }

        setPlayerTeam([...pTeam]);
        setEnemyTeam([...eTeam]);
        await new Promise(r => setTimeout(r, 600));
      }
    }

    const playerWon = pTeam.some(m => m.hp > 0);
    const isBossWave = wave % 10 === 0;

    if (playerWon) {
      SOUNDS.success();
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
      SOUNDS.hurt();
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
    setWinner(null);
    setShowResultScreen(false);
    
    const keys = Object.keys(ENVIRONMENTS);
    // 75% chance to trigger a random hazard, 25% chance to stay Clear
    const nextEnv = Math.random() > 0.25 
      ? keys[Math.floor(Math.random() * keys.length)] 
      : 'CLEAR';
      
    setCurrentEnvKey(nextEnv);
    setWave(w => w + 1);
  };

  const handleRetryWave = () => {
    setPlayerTeam(prev => prev.map(m => ({ ...m, hp: m.maxHp })));
    generateEnemyWave(wave);
    setWinner(null);
    setShowResultScreen(false);
  };

  const toggleDraftMonster = (id) => {
    if (selectedDraftIds.includes(id)) {
      setSelectedDraftIds(prev => prev.filter(x => x !== id));
    } else if (selectedDraftIds.length < 3) {
      setSelectedDraftIds(prev => [...prev, id]);
      SOUNDS.hit();
    }
  };

  const handleConfirmCustomTeam = () => {
    if (selectedDraftIds.length !== 3) return;
    const chosen = selectedDraftIds.map((id, index) => ({
      ...MONSTER_TEMPLATES[id],
      hp: MONSTER_TEMPLATES[id].maxHp,
      level: 1,
      exp: 0,
      key: `p-${index}-${id}`,
      speedMod: 0
    }));
    setPlayerTeam(chosen);
    setHasChosenStarter(true);
    SOUNDS.success();
  };

  const moveSquadMember = (index, direction) => {
    if (isFighting) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= playerTeam.length) return;
    const updated = [...playerTeam];
    const temporary = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temporary;
    setPlayerTeam(updated);
    SOUNDS.hit();
  };

  const isDraftComplete = selectedDraftIds.length === 3;
  const activeEnv = ENVIRONMENTS[currentEnvKey] || ENVIRONMENTS.CLEAR;
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f11', color: '#f5f5f7', padding: '24px', fontFamily: 'sans-serif' }}>
      {/* GLOBAL HUD HEADER */}
      <header style={{ position: 'relative', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div id="global-trainer">
          <h1 style={{ margin: 0, color: '#eab308', fontSize: '26px', letterSpacing: '0.5px' }}>⚔️ PIXEL-MONSTERS ARENA</h1>
          <div style={{ display: 'flex', gap: '20px', marginTop: '6px', color: '#a3a3a3', fontSize: '13px' }}>
            <span>Wave: <strong style={{ color: '#fff' }}>{wave}</strong></span>
            <span>👑 Trainer Lvl {trainerLvl} Progress: <strong>{trainerExp} / {Math.floor(100 * Math.pow(trainerLvl, 1.2))} EXP</strong> (Max Slots: {maxTeamSlots})</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setShowAlmanac(!showAlmanac)} style={{ backgroundColor: showAlmanac ? '#ca8a04' : '#1e1b4b', border: '1px solid #4338ca', color: '#fff', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            {showAlmanac ? '🏟️ Back to Arena' : '📖 View Almanac'}
          </button>
          <button onClick={toggleBGM} style={{ backgroundColor: bgmOn ? '#16a34a' : '#27272a', border: bgmOn ? '1px solid #22c55e' : '1px solid #4b5563', color: '#fff', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {bgmOn ? '🎵 BGM: ON' : '🔇 BGM: OFF'}
          </button>
          <div style={{ backgroundColor: '#1a1a1f', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ca8a04', color: '#eab308', fontWeight: 'bold', fontSize: '16px' }}>
            🪙 {gold}g
          </div>
        </div>
        {floatingTexts['global-trainer'] && (
          <div style={{ position: 'absolute', right: '150px', top: '10px', color: floatingTexts['global-trainer'].color, fontWeight: '900', fontSize: '20px', zIndex: 50 }}>
            {floatingTexts['global-trainer'].text}
          </div>
        )}
      </header>

      {/* CONDITIONAL VIEW MAPPING */}
      {showAlmanac ? (
        /* ALMANAC CATALOGUE COMPONENT BLOCK */
        <div style={{ backgroundColor: '#151518', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h2 style={{ color: '#eab308', margin: 0, fontSize: '22px' }}>📖 BESTIARY</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {Object.keys(MONSTER_TEMPLATES).map(key => {
              const item = MONSTER_TEMPLATES[key];
              return (
                <div key={`almanac-${key}`} style={{ backgroundColor: '#0a0a0c', border: '1px solid #222', borderRadius: '8px', padding: '14px', width: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: '4px', borderRadius: '6px', border: '1px solid #222' }}>
                        <PixelSprite spriteId={item.id} size={40} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{item.name}</div>
                        <div style={{ color: '#737373', fontSize: '11px' }}>{item.type}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#a3a3a3', display: 'flex', gap: '12px', marginBottom: '10px', backgroundColor: '#111', padding: '4px 8px', borderRadius: '4px' }}>
                      <span style={{ color: '#10b981' }}>❤️ {item.maxHp}</span> 
                      <span style={{ color: '#ef4444' }}>⚔️ {item.attack}</span> 
                      <span style={{ color: '#3b82f6' }}>⚡ {item.speed}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#c084fc', borderTop: '1px solid #222', paddingTop: '8px', lineHeight: '1.4' }}>
                    <strong>🌟 {item.passive.name}:</strong> {item.passive.desc}
                  </div>
                </div>
              );
            })}
          </div>

          <h3 style={{ color: '#f87171', fontSize: '16px', borderBottom: '1px solid #451a1a', paddingBottom: '6px', marginBottom: '16px' }}>👑 TITAN BOSSES (WAVE 10+)</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.keys(BOSS_TEMPLATES).map(key => {
              const boss = BOSS_TEMPLATES[key];
              return (
                <div key={`almanac-boss-${key}`} style={{ backgroundColor: '#1c1010', border: '1px solid #451a1a', borderRadius: '8px', padding: '14px', width: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a1414', padding: '4px', borderRadius: '6px', border: '1px solid #451a1a', transform: 'scale(1.05)' }}>
                        <PixelSprite spriteId={boss.id} size={40} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ef4444' }}>{boss.name}</div>
                        <div style={{ color: '#f87171', fontSize: '11px' }}>{boss.type}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#fca5a5', display: 'flex', gap: '12px', marginBottom: '10px', backgroundColor: '#2a1414', padding: '4px 8px', borderRadius: '4px' }}>
                      <span style={{ color: '#10b981' }}>❤️ {boss.maxHp}</span> 
                      <span style={{ color: '#ef4444' }}>⚔️ {boss.attack}</span> 
                      <span style={{ color: '#3b82f6' }}>⚡ {boss.speed}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#f472b6', borderTop: '1px solid #451a1a', paddingTop: '8px', lineHeight: '1.4' }}>
                    <strong>🌟 {boss.passive.name}:</strong> {boss.passive.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !hasChosenStarter ? (
        /* SQUAD SELECTION FLOOR */
        <div style={{ minHeight: '60vh', color: '#fff', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: '#eab308', fontSize: '28px', marginBottom: '4px' }}>BUILD YOUR STARTER SQUAD</h1>
          <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '24px' }}>Select exactly <span style={{ color: '#eab308', fontWeight: 'bold' }}>3 monsters</span> to form your unique vanguard line ({selectedDraftIds.length}/3 selected)</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '940px', marginBottom: '30px' }}>
            {Object.keys(MONSTER_TEMPLATES).map((key) => {
              const meta = MONSTER_TEMPLATES[key];
              const isSelected = selectedDraftIds.includes(key);
              return (
                <div key={key} onClick={() => toggleDraftMonster(key)} style={{ border: isSelected ? '2px solid #eab308' : '2px solid #333', backgroundColor: isSelected ? '#26200a' : '#1a1a1a', borderRadius: '10px', padding: '16px', width: '170px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
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
      ) : (
        /* STANDARD ARENA GAMEGRID DISPLAY */
        <>
          <div 
            className="arena-battleground-panel" 
            style={{ 
              background: activeEnv.style.background,
              borderColor: activeEnv.style.borderColor,
              transition: 'background 0.8s ease, border-color 0.8s ease',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid',
              marginTop: '12px'
            }}
          >
            {/* Dynamic Environment Banner Alert */}
            {currentEnvKey !== 'CLEAR' && (
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderLeft: `4px solid ${activeEnv.style.borderColor}`,
                padding: '10px 15px',
                borderRadius: '6px',
                marginBottom: '20px',
                color: '#fff',
                fontSize: '13px'
              }}>
                ⚠️ <strong>ENVIRONMENT ALERT: {activeEnv.name}</strong> — {activeEnv.description}
              </div>
            )}

            {/* Inner flex container to render layout columns side-by-side */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              {/* LEFT COLUMN: PLAYER ROSTER SQUAD */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'rgba(21, 21, 24, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid #222' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#a3a3a3', letterSpacing: '0.5px' }}>MY TEAM</h3>
                {playerTeam.map((m, idx) => (
                  <div key={m.key} style={{ display: 'flex', backgroundColor: '#0a0a0c', padding: '12px', borderRadius: '8px', border: '1px solid #222', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '12px' }}>
                      <button disabled={isFighting || idx === 0} onClick={() => moveSquadMember(idx, -1)} style={{ background: '#222', border: 'none', color: idx === 0 ? '#444' : '#fff', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}>▲</button>
                      <button disabled={isFighting || idx === playerTeam.length - 1} onClick={() => moveSquadMember(idx, 1)} style={{ background: '#222', border: 'none', color: idx === playerTeam.length - 1 ? '#444' : '#fff', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}>▼</button>
                    </div>
                    <div style={{ flex: 1, marginRight: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#60a5fa' }}>{m.name} <span style={{ color: '#ca8a04', fontSize: '11px' }}>Lvl {m.level}</span></div>
                      <div style={{ color: '#777', fontSize: '11px', marginTop: '2px' }}>ATK: {m.attack} | HP: {m.hp}/{m.maxHp} | EXP: {m.exp}/{Math.floor(100 * Math.pow(m.level, 1.2))}</div>
                      <div style={{ color: '#c084fc', fontSize: '11px', marginTop: '4px', fontStyle: 'italic', maxWidth: '280px', lineHeight: '1.3' }}>
                        🌟 {MONSTER_TEMPLATES[m.id]?.passive?.desc || "Standard Vanguard"}
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#222', height: '6px', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${(m.hp / m.maxHp) * 100}%`, backgroundColor: '#22c55e', height: '100%', transition: 'width 0.3s' }} />
                      </div>
                    </div>
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
                  <div style={{ border: '2px dashed #333', padding: '16px', borderRadius: '8px', textAlign: 'center', color: '#525252', fontSize: '12px' }}>Empty Slot Available</div>
                )}
              </div>

              {/* MIDDLE COLUMN: BATTLE CONTROLS & ARENA SCREEN */}
              <div style={{ flex: 0.7, display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                {winner ? (
                  <div style={{ textAlign: 'center', backgroundColor: '#151518', padding: '24px', borderRadius: '12px', border: '1px solid #222', width: '100%', boxSizing: 'border-box' }}>
                    <h2 style={{ color: winner === 'Player' ? '#10b981' : '#ef4444', margin: '0 0 8px 0', fontSize: '24px' }}>
                      {winner === 'Player' ? '🎉 VICTORY!' : '💀 DEFEAT'}
                    </h2>
                    <p style={{ color: '#a3a3a3', fontSize: '14px', margin: '0 0 16px 0' }}>
                      {winner === 'Player' ? `Gained +${matchSummary.gold}g and +${matchSummary.exp} Trainer EXP!` : `Gained +${matchSummary.gold}g pity gold.`}
                    </p>
                    {matchSummary.outcome === 'VICTORY' ? (
                      <button onClick={handleAdvanceWave} style={{ padding: '12px 32px', backgroundColor: '#eab308', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                        ADVANCE TO WAVE {wave + 1}
                      </button>
                    ) : (
                      <button onClick={handleRetryWave} style={{ padding: '12px 32px', backgroundColor: '#ef4444', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                        RETRY WAVE {wave}
                      </button>
                    )}
                  </div>
                ) : (
                  <button disabled={isFighting || playerTeam.length === 0} onClick={startAutoBattle} style={{ padding: '16px 40px', backgroundColor: isFighting ? '#27272a' : '#ca8a04', color: isFighting ? '#71717a' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isFighting ? 'not-allowed' : 'pointer', width: '100%', letterSpacing: '0.5px' }}>
                    {isFighting ? '⚔️ AUTO-BATTLE IN PROGRESS...' : `START WAVE ${wave} ARENA`}
                  </button>
                )}
              </div>

              {/* RIGHT COLUMN: ENEMY WAVE HUD */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'rgba(24, 18, 18, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid #3a1c1c' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#f43f5e', letterSpacing: '0.5px' }}>OPPOSING VANGUARD (WAVE {wave})</h3>
                {enemyTeam.map((m) => (
                  <div key={m.key} style={{ display: 'flex', backgroundColor: '#0c0808', padding: '12px', borderRadius: '8px', border: '1px solid #2a1414', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', marginRight: '12px' }}>
                      <PixelSprite spriteId={m.id} size={64} animationClass={activeAnims[m.key] || ""} />
                      {floatingTexts[m.key] && (
                        <div style={{ position: 'absolute', top: '-16px', color: floatingTexts[m.key].color, fontWeight: '900', fontSize: '14px', textShadow: '2px 2px 0px #000', whiteSpace: 'nowrap', zIndex: 10 }}>
                          {floatingTexts[m.key].text}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#f87171' }}>{m.name} <span style={{ color: '#a3a3a3', fontSize: '11px' }}>Lvl {m.level}</span></div>
                      <div style={{ color: '#991b1b', fontSize: '11px', marginTop: '2px' }}>ATK: {m.attack} | HP: {m.hp}/{m.maxHp}</div>
                      <div style={{ width: '100%', backgroundColor: '#222', height: '6px', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${(m.hp / m.maxHp) * 100}%`, backgroundColor: '#ef4444', height: '100%', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* METAGAME POWER SHOP MATRIX FLOOR */}
          <section style={{ marginTop: '32px', backgroundColor: '#151518', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#eab308', letterSpacing: '0.5px' }}>🛒 ARENA METAGAME UPGRADE BAZAAR</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: '#0a0a0c', border: '1px solid #222', padding: '16px', borderRadius: '8px', width: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>👑 Elite Trainer Academy</div>
                  <div style={{ color: '#737373', fontSize: '11px', marginTop: '4px' }}>Purchase +50 Trainer EXP to expand max battle slots.</div>
                </div>
                <button disabled={gold < 60 || isFighting} onClick={() => buyTrainerExp(60)} style={{ marginTop: '12px', padding: '8px', backgroundColor: gold >= 60 ? '#ca8a04' : '#222', color: gold >= 60 ? '#fff' : '#444', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: gold >= 60 ? 'pointer' : 'not-allowed', fontSize: '12px' }}>
                  Buy EXP (60g)
                </button>
              </div>

              <div style={{ backgroundColor: '#0a0a0c', border: '1px solid #222', padding: '16px', borderRadius: '8px', width: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>🤝 Recruit New Vanguard</div>
                  <div style={{ color: '#737373', fontSize: '11px', marginTop: '4px' }}>Draft another squad monster to deploy into vacant slots.</div>
                </div>
                <button disabled={gold < 120 || playerTeam.length >= maxTeamSlots || isFighting} onClick={() => openRecruitSelection(120)} style={{ marginTop: '12px', padding: '8px', backgroundColor: (gold >= 120 && playerTeam.length < maxTeamSlots) ? '#16a34a' : '#222', color: (gold >= 120 && playerTeam.length < maxTeamSlots) ? '#fff' : '#444', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: (gold >= 120 && playerTeam.length < maxTeamSlots) ? 'pointer' : 'not-allowed', fontSize: '12px' }}>
                  {playerTeam.length >= maxTeamSlots ? 'Slots Maxed' : 'Recruit (120g)'}
                </button>
              </div>

              {playerTeam.map((m) => (
                <div key={`shop-${m.key}`} style={{ backgroundColor: '#0a0a0c', border: '1px solid #222', padding: '16px', borderRadius: '8px', width: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#60a5fa' }}>⚡ Train {m.name.split(' ').pop()}</div>
                    <div style={{ color: '#737373', fontSize: '11px', marginTop: '4px' }}>Gives +50 EXP. Leveling grants +2 ATK and +5 Max HP permanent boosts.</div>
                  </div>
                  <button disabled={gold < 40 || isFighting} onClick={() => buyMonsterExp(m.key, 40)} style={{ marginTop: '12px', padding: '8px', backgroundColor: gold >= 40 ? '#27272a' : '#222', color: gold >= 40 ? '#fff' : '#444', border: '1px solid #444', borderRadius: '4px', fontWeight: 'bold', cursor: gold >= 40 ? 'pointer' : 'not-allowed', fontSize: '12px' }}>
                    Train (40g)
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* RECRUITMENT SELECTION MODAL LAYER */}
      {isChoosingRecruit && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#151518', border: '2px solid #ca8a04', borderRadius: '12px', padding: '24px', maxWidth: '700px', width: '90%' }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#eab308' }}>RECRUIT SQUAD MEMBER</h3>
            <p style={{ color: '#a3a3a3', fontSize: '12px', margin: '0 0 20px 0' }}>Select a vanguard monster archetype to buy and add to your line.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
              {Object.keys(MONSTER_TEMPLATES).map((key) => {
                const meta = MONSTER_TEMPLATES[key];
                return (
                  <div key={`recruit-${key}`} onClick={() => finalizeRecruitment(key, 120)} style={{ backgroundColor: '#0a0a0c', border: '1px solid #333', borderRadius: '8px', padding: '12px', width: '140px', textAlign: 'center', cursor: 'pointer' }}>
                    <PixelSprite spriteId={meta.id} size={32} />
                    <div style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '6px' }}>{meta.name}</div>
                    <div style={{ fontSize: '10px', color: '#a3a3a3', marginTop: '4px' }}>❤️{meta.maxHp} ⚔️{meta.attack} ⚡{meta.speed}</div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setIsChoosingRecruit(false)} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#27272a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;