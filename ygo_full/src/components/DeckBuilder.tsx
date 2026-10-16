/**
 * DeckBuilder - Visual Deck Construction Screen
 * Full official deck editor with library search, category filters,
 * 40-card main deck limit, 3-copy rule, and Extra Deck organization.
 */

import React, { useState } from 'react';
import { CardDefinition } from '../types/duel';
import { CARD_DATABASE, EXTRA_DECK_DATABASE, MAIN_DECK_DATABASE } from '../data/cardDatabase';
import { Search, Layers, ArrowLeft, Trash2, CheckCircle2, Sparkles, Plus, X, Eye, GripVertical } from 'lucide-react';
import { sound } from '../utils/audio';

const DECK_STORAGE_KEY = 'duelArenaDeckConfigV1';

export interface DeckConfig {
  main: string[];  // card names
  extra: string[]; // card names
}

export const loadStoredDeck = (): DeckConfig => {
  try {
    const raw = localStorage.getItem(DECK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.main) && Array.isArray(parsed.extra)) {
        return parsed;
      }
    }
  } catch (_) {}
  // Default balanced starting deck
  return {
    main: [
      'Blue-Eyes White Dragon', 'Blue-Eyes White Dragon', 'Blue-Eyes White Dragon',
      'Dark Magician', 'Dark Magician', 'Dark Magician Girl',
      'Ash Blossom & Joyous Spring', 'Ash Blossom & Joyous Spring',
      'Effect Veiler', 'Kuriboh', 'Honest',
      'Cyber Dragon', 'Apprentice Illusion Magician',
      'Necro Gardna', 'The White Stone of Ancients', 'Destiny HERO - Malicious',
      'Prank-Kids Rocksies', 'Prank-Kids Dropsies',
      'Breaker the Magical Warrior', 'Exiled Force', 'Gagaga Magician', 'Marshmallon', 'D.D. Warrior Lady',
      'Raigeki', 'Dark Hole', 'Monster Reborn', 'Pot of Greed', 'Mystical Space Typhoon', 'Polymerization',
      'Dragon Ravine', 'Mountain', 'Yami', 'Prank-Kids Place',
      'Mirror Force', 'Magic Cylinder', 'Bottomless Trap Hole', 'Torrential Tribute', 'Solemn Judgment'
    ],
    extra: [
      'Stardust Dragon', 'Black Rose Dragon', 'Number 39: Utopia', 'Decode Talker',
      'Elemental HERO Flame Wingman', 'Blue-Eyes Ultimate Dragon', 'Prank-Kids Rocket Ride'
    ]
  };
};

export const saveStoredDeck = (config: DeckConfig) => {
  try {
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(config));
  } catch (_) {}
};

interface DeckBuilderProps {
  onBackToMenu: () => void;
  onDeckUpdated: (config: DeckConfig) => void;
}

type FilterType = 'ALL' | 'MONSTER' | 'FUSION' | 'SYNCHRO' | 'XYZ' | 'LINK' | 'SPELL' | 'TRAP';

export const DeckBuilder: React.FC<DeckBuilderProps> = ({ onBackToMenu, onDeckUpdated }) => {
  const [deck, setDeck] = useState<DeckConfig>(loadStoredDeck);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [status, setStatus] = useState('Click a card to inspect it, or drag it into Main Deck / Extra Deck.');
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);
  const [draggedCardName, setDraggedCardName] = useState<string | null>(null);

  const allCards = CARD_DATABASE;

  const handleAddCard = (def: CardDefinition) => {
    const isExtra = ['Fusion', 'Synchro', 'Xyz', 'Link'].includes(def.subtype as string);
    const targetList = isExtra ? deck.extra : deck.main;
    const sameCopies = targetList.filter(name => name === def.name).length;

    if (sameCopies >= 3) {
      sound.playPhase();
      setStatus(`Maximum 3 copies of "${def.name}" allowed.`);
      return;
    }

    if (!isExtra && deck.main.length >= 40) {
      sound.playPhase();
      setStatus('Main Deck is full! (Maximum 40 cards).');
      return;
    }

    sound.playDraw();
    const updated = {
      ...deck,
      [isExtra ? 'extra' : 'main']: [...targetList, def.name]
    };
    setDeck(updated);
    saveStoredDeck(updated);
    onDeckUpdated(updated);
    setStatus(`Added "${def.name}" to ${isExtra ? 'Extra Deck' : 'Main Deck'}.`);
  };

  const handleDropCard = (event: React.DragEvent<HTMLDivElement>, forceExtra?: boolean) => {
    event.preventDefault();
    const name = event.dataTransfer.getData('text/card-name') || draggedCardName;
    if (!name) return;
    const def = allCards.find(card => card.name === name);
    if (!def) return;
    const isExtraType = ['Fusion', 'Synchro', 'Xyz', 'Link'].includes(def.subtype as string);
    const shouldBeExtra = forceExtra ?? isExtraType;
    if (shouldBeExtra !== isExtraType) {
      setStatus(isExtraType ? 'Extra Deck monsters must be placed in the Extra Deck.' : 'This card belongs in the Main Deck.');
      return;
    }
    handleAddCard(def);
    setDraggedCardName(null);
  };

  const handleRemoveCard = (name: string, isExtra: boolean, index: number) => {
    sound.playPhase();
    const targetList = isExtra ? [...deck.extra] : [...deck.main];
    targetList.splice(index, 1);
    const updated = {
      ...deck,
      [isExtra ? 'extra' : 'main']: targetList
    };
    setDeck(updated);
    saveStoredDeck(updated);
    onDeckUpdated(updated);
    setStatus(`Removed "${name}" from ${isExtra ? 'Extra Deck' : 'Main Deck'}.`);
  };

  const handleResetDeck = () => {
    sound.playDestroy();
    const cleared = { main: [], extra: [] };
    setDeck(cleared);
    saveStoredDeck(cleared);
    onDeckUpdated(cleared);
    setStatus('Deck cleared. Add cards from the card library.');
  };

  // Filtered Cards
  const filteredDefs = allCards.filter(c => {
    const matchesSearch = !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.text.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === 'ALL') return true;
    if (filter === 'MONSTER') return c.type === 'MONSTER' && !['Fusion', 'Synchro', 'Xyz', 'Link'].includes(c.subtype as string);
    if (filter === 'SPELL') return c.type === 'SPELL';
    if (filter === 'TRAP') return c.type === 'TRAP';
    return c.subtype.toUpperCase() === filter;
  });

  const mainPercent = Math.min(100, (deck.main.length / 40) * 100);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col p-4 md:p-6 bg-[#040913] select-none text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2b516b]/60 flex-shrink-0">
        <div>
          <span className="text-[10px] font-['Orbitron'] font-bold text-amber-300 tracking-widest uppercase">
            DUEL ARENA · DECK CONSTRUCTION
          </span>
          <h1 className="font-['Cinzel'] font-black text-2xl md:text-3xl text-white">
            DECK <span className="text-amber-300">EDITOR</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 hidden sm:inline">Changes save automatically</span>
          <button
            onClick={() => {
              sound.playPhase();
              onBackToMenu();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10273d] hover:bg-[#163554] border border-[#3b7294] text-xs font-bold text-stone-200 hover:text-white transition-all active:scale-95 shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Card Library (Top/Left) + Deck Lists (Right/Bottom) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 min-h-0 overflow-hidden">
        {/* Card Library Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#081524]/90 border border-[#2b5370]/60 rounded-2xl p-4 min-h-0 overflow-hidden shadow-lg">
          {/* Library Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-['Cinzel'] font-bold text-sm text-stone-200">CARD LIBRARY</h3>
              <p className="text-[11px] text-stone-400">Click to view full details · Drag a card into the correct deck.</p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search card by name or text..."
                className="w-full bg-[#050e18] border border-[#2e5775] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-400 shadow-inner"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none flex-shrink-0">
            {(['ALL', 'MONSTER', 'SPELL', 'TRAP', 'FUSION', 'SYNCHRO', 'XYZ', 'LINK'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[10px] font-['Orbitron'] font-bold whitespace-nowrap transition-all ${
                  filter === f
                    ? 'bg-amber-400 text-stone-950 shadow-md scale-105'
                    : 'bg-[#0f2438] text-stone-300 hover:text-white border border-[#274f6e]/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1 min-h-0 scrollbar-thin scrollbar-thumb-sky-700/50">
            {filteredDefs.map(def => (
              <div
                key={def.id}
                onClick={() => setSelectedCard(def)}
                draggable={true}
                onDragStart={event => { event.dataTransfer.setData('text/card-name', def.name); event.dataTransfer.effectAllowed = 'copy'; setDraggedCardName(def.name); }}
                className="group relative cursor-pointer bg-[#0c1c2e] hover:bg-[#142e47] border border-[#254b69] hover:border-amber-400 rounded-xl p-2 flex flex-col justify-between transition-all hover:scale-105 shadow-md"
              >
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-black/40 mb-1.5">
                  <img src={def.art} alt={def.name} onError={event => { const img = event.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = `https://images.ygoprodeck.com/images/cards_cropped/${def.id}.jpg`; } else { img.style.opacity = '0'; } }} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div>
                  <h5 className="font-['Cinzel'] font-bold text-[11px] text-stone-100 truncate" title={def.name}>
                    {def.name}
                  </h5>
                  <span className="text-[9px] font-['Orbitron'] text-sky-400 font-semibold block truncate">
                    {def.subtype || def.type}
                  </span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-amber-400 text-stone-950 rounded-full p-1 shadow-md transition-opacity">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deck Lists Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0 overflow-hidden">
          {/* Main Deck (Top half) */}
          <div onDragOver={event => event.preventDefault()} onDrop={event => handleDropCard(event, false)} className={`flex-1 flex flex-col bg-[#081524]/90 border ${draggedCardName && !['Fusion','Synchro','Xyz','Link'].includes(allCards.find(c => c.name === draggedCardName)?.subtype as string) ? 'border-amber-400' : 'border-[#2b5370]/60'} rounded-2xl p-4 min-h-0 overflow-hidden shadow-lg transition-colors`}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <h3 className="font-['Cinzel'] font-bold text-sm text-stone-200">MAIN DECK</h3>
                <span className="text-[10px] text-stone-400">Min 20 · Max 40 cards · Max 3 copies</span>
              </div>
              <span className="font-['Orbitron'] font-black text-sm text-amber-300">
                {deck.main.length} / 40
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-[#06101c] rounded-full overflow-hidden mb-3 border border-[#23455e]">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-300"
                style={{ width: `${mainPercent}%` }}
              />
            </div>

            {/* Main Deck List */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 p-1 min-h-0 scrollbar-thin scrollbar-thumb-sky-700/50">
              {deck.main.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-stone-500">
                  Main Deck is empty. Add cards from the library.
                </div>
              ) : (
                deck.main.map((name, idx) => {
                  const def = allCards.find(c => c.name === name);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-1.5 bg-[#0e2136] border border-[#234b6e] rounded-lg"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <img src={def?.art} alt={name} onError={event => { const img = event.currentTarget; if (!img.dataset.fallback && def) { img.dataset.fallback = '1'; img.src = `https://images.ygoprodeck.com/images/cards_cropped/${def.id}.jpg`; } }} className="w-6 h-8 object-contain rounded flex-shrink-0" />
                        <span className="text-[10px] font-bold text-stone-200 truncate" title={name}>
                          {name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveCard(name, false, idx)}
                        className="text-stone-400 hover:text-rose-400 p-1 transition-colors"
                        title="Remove from deck"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Extra Deck (Bottom half) */}
          <div onDragOver={event => event.preventDefault()} onDrop={event => handleDropCard(event, true)} className={`h-56 flex flex-col bg-[#081524]/90 border ${draggedCardName && ['Fusion','Synchro','Xyz','Link'].includes(allCards.find(c => c.name === draggedCardName)?.subtype as string) ? 'border-purple-400' : 'border-[#2b5370]/60'} rounded-2xl p-4 overflow-hidden shadow-lg flex-shrink-0 transition-colors`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-['Cinzel'] font-bold text-sm text-stone-200">EXTRA DECK</h3>
                <span className="text-[10px] text-stone-400">Fusion, Synchro, Xyz & Link monsters</span>
              </div>
              <span className="font-['Orbitron'] font-black text-sm text-purple-300">
                {deck.extra.length} cards
              </span>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 p-1 min-h-0 scrollbar-thin scrollbar-thumb-purple-700/50">
              {deck.extra.length === 0 ? (
                <div className="col-span-full py-6 text-center text-xs text-stone-500">
                  Extra Deck is empty. Add Fusion/Synchro/Xyz/Link monsters.
                </div>
              ) : (
                deck.extra.map((name, idx) => {
                  const def = allCards.find(c => c.name === name);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-1.5 bg-[#14122c] border border-purple-800/60 rounded-lg"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <img src={def?.art} alt={name} onError={event => { const img = event.currentTarget; if (!img.dataset.fallback && def) { img.dataset.fallback = '1'; img.src = `https://images.ygoprodeck.com/images/cards_cropped/${def.id}.jpg`; } }} className="w-6 h-8 object-contain rounded flex-shrink-0" />
                        <span className="text-[10px] font-bold text-purple-200 truncate" title={name}>
                          {name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveCard(name, true, idx)}
                        className="text-stone-400 hover:text-rose-400 p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedCard(null)}>
          <div role="dialog" aria-modal="true" aria-label={`${selectedCard.name} card details`} onClick={event => event.stopPropagation()} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-5 rounded-2xl border border-sky-500/50 bg-[#071321] p-5 shadow-2xl">
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-sky-900 bg-black/40 p-2 min-h-[280px] flex items-center justify-center">
                <img src={selectedCard.art} alt={selectedCard.name} onError={event => { const img = event.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = `https://images.ygoprodeck.com/images/cards_cropped/${selectedCard.id}.jpg`; } }} className="max-h-[360px] w-full object-contain" />
              </div>
              <button onClick={() => { handleAddCard(selectedCard); }} className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 hover:bg-amber-300"><Plus className="h-4 w-4" /> Add to {['Fusion','Synchro','Xyz','Link'].includes(selectedCard.subtype as string) ? 'Extra Deck' : 'Main Deck'}</button>
              <p className="text-center text-[11px] text-slate-400"><GripVertical className="inline h-3 w-3" /> Or close this window and drag the card into a deck panel.</p>
            </div>
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3 border-b border-sky-900 pb-3">
                <div><p className="text-[10px] font-bold tracking-[.2em] text-sky-400">CARD DETAILS</p><h2 className="mt-1 font-['Cinzel'] text-xl font-bold text-amber-200">{selectedCard.name}</h2><p className="mt-1 text-xs text-sky-300">{selectedCard.type} · {selectedCard.subtype}</p></div>
                <button aria-label="Close card details" onClick={() => setSelectedCard(null)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-3"><span className="text-xs text-rose-300">ATK</span><div className="text-lg font-bold">{selectedCard.atk ?? '—'}</div></div>
                <div className="rounded-lg border border-sky-900/60 bg-sky-950/30 p-3"><span className="text-xs text-sky-300">DEF</span><div className="text-lg font-bold">{selectedCard.def ?? '—'}</div></div>
                <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3"><span className="text-xs text-slate-400">ATTRIBUTE</span><div className="font-semibold">{selectedCard.attribute ?? '—'}</div></div>
                <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3"><span className="text-xs text-slate-400">LEVEL / RANK</span><div className="font-semibold">{selectedCard.level ?? selectedCard.linkRating ?? '—'}</div></div>
              </div>
              <div className="mt-4"><h3 className="text-xs font-bold tracking-wider text-amber-300">CARD TYPE</h3><p className="mt-1 text-sm text-slate-200">{selectedCard.race ? `${selectedCard.race} / ` : ''}{selectedCard.subtype}{selectedCard.materialText ? ` · Materials: ${selectedCard.materialText}` : ''}</p></div>
              <div className="mt-4"><h3 className="text-xs font-bold tracking-wider text-amber-300">EFFECT / DESCRIPTION</h3><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-200">{selectedCard.text || 'No effect text available.'}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Status & Reset Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[#2b516b]/60 flex-shrink-0 mt-3">
        <p className="text-xs text-amber-300 font-medium truncate max-w-lg">
          {status}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDeck}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600/60 text-xs font-bold text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Deck</span>
          </button>
          <button
            onClick={() => {
              sound.playSpecialSummon();
              onBackToMenu();
            }}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-['Orbitron'] font-black text-xs shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 fill-current" />
            <span>Save Deck & Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
