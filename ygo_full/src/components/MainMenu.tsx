import React, { useState } from 'react';
import {
  Swords, Users, Flame, Globe, Layers, BookOpen, User, Trophy,
  ArrowRight, Settings, Power, Home, Sparkles, PlayCircle, X
} from 'lucide-react';
import { sound } from '../utils/audio';

interface MainMenuProps {
  onOpenSoloMode: () => void;
  onOpenOnlinePvp: () => void;
  onOpenLocal2P: () => void;
  onOpenSurvival: () => void;
  onContinueDuel: () => void;
  onOpenDeckEditor: () => void;
  onOpenProfile: () => void;
  onOpenWiki: () => void;
  onOpenLeaderboard: () => void;
  onOpenDeployGuide: () => void;
  canContinue: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onOpenSoloMode, onOpenOnlinePvp, onOpenLocal2P, onOpenSurvival,
  onContinueDuel, onOpenDeckEditor, onOpenProfile, onOpenWiki,
  onOpenLeaderboard, onOpenDeployGuide, canContinue,
}) => {
  const [exitMsg, setExitMsg] = useState(false);
  const go = (callback: () => void) => { sound.playSpecialSummon(); callback(); };
  const menuItems = [
    { title: 'PLAY', subtitle: 'Đấu với AI / Đấu trực tuyến', icon: Swords, action: () => go(onOpenSoloMode), primary: true },
    { title: 'DECK BUILD', subtitle: 'Xây dựng bộ bài của bạn', icon: Layers, action: () => go(onOpenDeckEditor) },
    { title: 'SETTINGS', subtitle: 'Tùy chỉnh trò chơi', icon: Settings, action: () => go(onOpenDeployGuide) },
    { title: 'EXIT', subtitle: 'Thoát game', icon: Power, action: () => { sound.playPhase(); setExitMsg(true); } },
  ];
  return (
    <main className="ygo-home relative w-screen min-h-screen overflow-hidden select-none text-white">
      <div className="ygo-home-bg" aria-hidden="true" />
      <div className="ygo-home-shade" aria-hidden="true" />
      <header className="ygo-topbar">
        <div className="ygo-topline" />
        <nav aria-label="Main navigation">
          <button className="ygo-nav active" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}><Home /> <span>Home</span></button>
          <button className="ygo-nav" onClick={() => go(onOpenSoloMode)}><Swords /> <span>Play</span></button>
          <button className="ygo-nav" onClick={() => go(onOpenDeckEditor)}><Layers /> <span>Deck</span></button>
          <button className="ygo-nav" onClick={() => go(onOpenDeployGuide)}><Settings /> <span>Settings</span></button>
        </nav>
      </header>

      <section className="ygo-home-content">
        <div className="ygo-brand" aria-label="Yu-Gi-Oh Master Duel Arena 3D">
          <div className="ygo-brand-emblem">YU-GI-OH!</div>
          <div className="ygo-brand-title">MASTER DUEL ARENA 3D</div>
          <div className="ygo-brand-chevron" />
        </div>
        <div className="ygo-tagline">IT’S TIME TO DUEL</div>
        <p className="ygo-subtitle">Build your deck · Challenge your limits · Become the King of Games</p>

        <div className="ygo-main-actions">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.title} onClick={item.action} className={`ygo-menu-button ${item.primary ? 'primary' : ''}`}>
              <span className="ygo-menu-icon"><Icon /></span>
              <span className="ygo-menu-copy"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
              <ArrowRight className="ygo-arrow" />
            </button>;
          })}
          {canContinue && <button onClick={() => go(onContinueDuel)} className="ygo-menu-button"><span className="ygo-menu-icon"><PlayCircle /></span><span className="ygo-menu-copy"><strong>CONTINUE DUEL</strong><small>Tiếp tục trận đấu</small></span><ArrowRight className="ygo-arrow" /></button>}
        </div>

        <div className="ygo-quick-links">
          <button onClick={() => go(onOpenOnlinePvp)}><Globe /><span>Online PvP</span></button>
          <button onClick={() => go(onOpenLocal2P)}><Users /><span>2 Players</span></button>
          <button onClick={() => go(onOpenSurvival)}><Flame /><span>Survival</span></button>
          <button onClick={() => go(onOpenWiki)}><BookOpen /><span>Card Wiki</span></button>
          <button onClick={() => go(onOpenProfile)}><User /><span>Profile</span></button>
          <button onClick={() => go(onOpenLeaderboard)}><Trophy /><span>Ranking</span></button>
        </div>
      </section>

      <footer className="ygo-home-footer"><span>IT’S NOT JUST A GAME</span><span>IT’S A DUEL OF SOULS</span></footer>
      {exitMsg && <div className="ygo-exit-backdrop" role="dialog" aria-modal="true">
        <div className="ygo-exit-card"><button className="ygo-exit-close" onClick={() => setExitMsg(false)} aria-label="Close"><X /></button><Sparkles /><h2>DUELIST, DON’T LEAVE YET!</h2><p>Đây là trò chơi web. Bạn có thể đóng tab hoặc quay lại bất cứ lúc nào.</p><button onClick={() => setExitMsg(false)}>BACK TO ARENA</button></div>
      </div>}
    </main>
  );
};
