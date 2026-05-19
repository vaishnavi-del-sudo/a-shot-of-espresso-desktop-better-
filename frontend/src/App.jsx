import { BarChart3, Coffee, DoorOpen, LogOut, Maximize2, Play, RotateCcw, Settings, SkipForward, SlidersHorizontal, Users, X } from 'lucide-react';
import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import api, { clearAuth, getStoredUser, saveAuth, saveUser } from './api.js';
import { companions, demoFriends, themes } from './data/espressoData.js';

const fallbackUser = {
  id: 1,
  email: 'vaishnavi@example.com',
  username: 'Vaishnavi',
  preferences: {
    companion: 'bunny',
    theme: 'cherry',
    focusDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
    bellEnabled: true
  }
};

function normalizeUser(user) {
  return {
    ...fallbackUser,
    ...user,
    preferences: {
      ...fallbackUser.preferences,
      ...(user?.preferences || {})
    }
  };
}

function cx(...items) {
  return items.filter(Boolean).join(' ');
}

function Companion({ type = 'bunny', name, small = false, overlay = false }) {
  return (
    <div className={cx('companion', `companion-${type}`, small && 'small', overlay && 'overlay-companion')}>
      {name && <div className="name-tag">{name}</div>}
      <span className="feature feature-left" />
      <span className="feature feature-right" />
      <div className="ear left" />
      <div className="ear right" />
      <div className="head">
        <span className="eye left" />
        <span className="eye right" />
        <span className="eye-patch left" />
        <span className="eye-patch right" />
        <span className="blush left" />
        <span className="blush right" />
        <span className="snout" />
        <span className="mouth" />
        <span className="whisker whisker-left top" />
        <span className="whisker whisker-left bottom" />
        <span className="whisker whisker-right top" />
        <span className="whisker whisker-right bottom" />
      </div>
      <div className="body">
        <span className="belly" />
        <span className="paw left" />
        <span className="paw right" />
        <span className="prop" />
      </div>
      <span className="tail" />
      <span className="motion m1" />
      <span className="motion m2" />
    </div>
  );
}

function FallingLeaves({ theme }) {
  const leafColor = themes[theme]?.leaf || themes.cherry.leaf;
  return (
    <div className="falling-leaves" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <span key={index} style={{ '--i': index, '--leaf': leafColor }} />
      ))}
    </div>
  );
}

function ScenicRoom({ theme, children }) {
  return (
    <main className={cx('scene', themes[theme]?.bg || 'cherry-bg')}>
      <div className="window-wall">
        <div className="curtain left" />
        <div className="curtain right" />
        <div className="window-grid">
          <span /><span /><span />
        </div>
        <div className="tree trunk-one" />
        <div className="tree trunk-two" />
        <div className="tree crown-one" />
        <div className="tree crown-two" />
        <div className="branch branch-one" />
        <div className="branch branch-two" />
        <div className="branch branch-three" />
        <div className="branch branch-four" />
        <div className="branch branch-five" />
        <div className="branch branch-six" />
        <div className="branchlet branchlet-one" />
        <div className="branchlet branchlet-two" />
        <div className="branchlet branchlet-three" />
        <div className="branchlet branchlet-four" />
        <div className="leaf-cluster cluster-one" />
        <div className="leaf-cluster cluster-two" />
        <div className="leaf-cluster cluster-three" />
      </div>
      <div className="reading-chair" />
      <div className="coffee-table"><span /></div>
      <FallingLeaves theme={theme} />
      {children}
    </main>
  );
}

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: 'Vaishnavi', email: 'vaishnavi@example.com', password: 'espresso123' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(endpoint, payload);
      const nextUser = normalizeUser(data.user);
      saveAuth(data.token, nextUser);
      onLogin(nextUser);
    } catch (err) {
      const nextUser = normalizeUser({
        username: form.username || fallbackUser.username,
        email: form.email || fallbackUser.email
      });
      saveAuth('offline-demo-token', nextUser);
      onLogin(nextUser);
    }
  }

  return (
    <ScenicRoom theme="cherry">
      <div className="auth-card">
        <p className="script">welcome back ~</p>
        <h1>A Shot of Espresso</h1>
        <p className="muted">A warm, always-there focus room for tiny peaceful study sessions.</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Name" />}
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
          <input value={form.password} type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
          {error && <p className="error">{error}</p>}
          <button className="pill primary" type="submit"><Coffee size={16} /> Continue with espresso</button>
        </form>
        <button className="link-button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Make a tiny new profile' : 'I already have a profile'}
        </button>
      </div>
      <div className="login-friend bunny-login"><Companion type="bunny" /></div>
      <div className="login-friend axolotl-login"><Companion type="axolotl" /></div>
    </ScenicRoom>
  );
}

function TimerCard({ preferences, running, secondsLeft, onStart, onReset, onSkip }) {
  const total = Math.max(1, preferences.focusDuration * 60);
  const progress = 1 - secondsLeft / total;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  return (
    <section className="timer-card">
      <Companion type={preferences.companion} small />
      <button className="focus-chip">Focus</button>
      <div className="timer-ring" style={{ '--progress': `${progress * 360}deg`, '--accent': themes[preferences.theme].accent }}>
        <div><strong>{mm}:{ss}</strong><span>session 1</span></div>
      </div>
      <div className="timer-controls">
        <button className="round" onClick={onReset}><RotateCcw size={18} /></button>
        <button className="start-button" onClick={onStart}><Play size={18} fill="currentColor" /> {running ? 'Pause' : 'Start'}</button>
        <button className="round" onClick={onSkip}><SkipForward size={18} /></button>
      </div>
    </section>
  );
}

function SettingsModal({ user, onClose, onSave }) {
  const [prefs, setPrefs] = useState(user.preferences);
  async function save() {
    const nextUser = { ...user, preferences: prefs };
    try { await api.put('/preferences', prefs); } catch {}
    saveUser(nextUser);
    onSave(nextUser);
    onClose();
  }
  return (
    <div className="modal-backdrop">
      <section className="settings-modal modal-panel">
        <button className="close" onClick={onClose}><X size={18} /></button>
        <h2>Settings</h2>
        <label>Companion</label>
        <div className="choice-grid two">
          {Object.entries(companions).slice(0, 6).map(([key, item]) => (
            <button key={key} className={cx('choice-card', prefs.companion === key && 'selected')} onClick={() => setPrefs({ ...prefs, companion: key })}>
              <Companion type={key} small />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <label>Seasonal Theme</label>
        <div className="choice-grid themes">
          {Object.entries(themes).map(([key, item]) => (
            <button key={key} className={cx('theme-card', item.bg, prefs.theme === key && 'selected')} onClick={() => setPrefs({ ...prefs, theme: key })}>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        {[
          ['focusDuration', 'Focus duration', 5, 90],
          ['shortBreak', 'Short break', 1, 20],
          ['longBreak', 'Long break', 5, 45],
          ['sessionsUntilLongBreak', 'Sessions until long break', 2, 8]
        ].map(([key, label, min, max]) => (
          <div className="slider-row" key={key}>
            <span>{label}</span><strong>{prefs[key]}{key.includes('Duration') || key.includes('Break') ? ' min' : ''}</strong>
            <input type="range" min={min} max={max} value={prefs[key]} onChange={(e) => setPrefs({ ...prefs, [key]: Number(e.target.value) })} />
          </div>
        ))}
        <button className="toggle-row" onClick={() => setPrefs({ ...prefs, bellEnabled: !prefs.bellEnabled })}>
          <span><strong>Bell on completion</strong><small>A soft chime when a session ends</small></span>
          <i className={prefs.bellEnabled ? 'on' : ''} />
        </button>
        <div className="modal-actions"><button onClick={onClose}>Cancel</button><button className="pill primary" onClick={save}>Save</button></div>
      </section>
    </div>
  );
}

function ProductivityModal({ report, onClose }) {
  const max = Math.max(60, ...report.days.map((day) => day.minutes));
  return (
    <div className="modal-backdrop">
      <section className="productivity-modal modal-panel">
        <button className="close" onClick={onClose}><X size={18} /></button>
        <h2>Today's Garden</h2>
        <div className="stats-grid">
          <Stat label="Focus today" value={`${report.todayMinutes}m`} />
          <Stat label="Sessions today" value={report.sessionsToday} />
          <Stat label="Streak" value={`${report.streakDays}d`} />
          <Stat label="All-time focus" value={`${report.allTimeHours}h`} />
        </div>
        <div className="chart-card">
          <h3>Last 7 days · Focus minutes</h3>
          <div className="chart-grid">
            {report.days.map((day) => <span key={day.date} style={{ '--h': `${Math.max(3, (day.minutes / max) * 100)}%` }} data-label={day.label} />)}
          </div>
        </div>
        <p className="script center">every quiet hour counts ~</p>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="stat"><Coffee size={18} /><span>{label}</span><strong>{value}</strong></div>;
}

function RoomsModal({ user, onClose, onRoom }) {
  const [room, setRoom] = useState(() => {
    const raw = localStorage.getItem('espresso_active_room');
    return raw ? JSON.parse(raw) : null;
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const currentParticipant = { id: user.id, username: user.username, companion: user.preferences.companion };

  function saveLocalRoom(nextRoom) {
    const rooms = JSON.parse(localStorage.getItem('espresso_rooms') || '{}');
    rooms[nextRoom.code] = nextRoom;
    localStorage.setItem('espresso_rooms', JSON.stringify(rooms));
    localStorage.setItem('espresso_active_room', JSON.stringify(nextRoom));
  }

  function createLocalRoom() {
    const roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    return {
      id: `local-${roomCode}`,
      code: roomCode,
      name: `${user.username}'s focus room`,
      hostId: user.id,
      participants: [currentParticipant, ...demoFriends],
      createdAt: new Date().toISOString()
    };
  }

  function applyRoom(nextRoom) {
    setRoom(nextRoom);
    saveLocalRoom(nextRoom);
    onRoom(nextRoom);
  }

  async function hostRoom() {
    setError('');
    try {
      const { data } = await api.post('/rooms', { name: `${user.username}'s focus room` });
      applyRoom(data.room);
    } catch {
      applyRoom(createLocalRoom());
    }
  }

  async function joinRoom() {
    setError('');
    const roomCode = code.trim().toUpperCase();
    if (!roomCode) {
      setError('Enter a room code first.');
      return;
    }
    try {
      const { data } = await api.post('/rooms/join', { code: roomCode });
      applyRoom(data.room);
    } catch {
      const rooms = JSON.parse(localStorage.getItem('espresso_rooms') || '{}');
      const localRoom = rooms[roomCode];
      if (!localRoom) {
        setError('Room code not found on this device.');
        return;
      }
      const alreadyJoined = localRoom.participants.some((person) => person.id === user.id);
      const nextRoom = {
        ...localRoom,
        participants: alreadyJoined ? localRoom.participants : [...localRoom.participants, currentParticipant]
      };
      applyRoom(nextRoom);
    }
  }

  function leaveRoom() {
    localStorage.removeItem('espresso_active_room');
    setRoom(null);
    onRoom({ participants: [currentParticipant] });
  }

  const participants = room?.participants || [currentParticipant, ...demoFriends];
  return (
    <div className="modal-backdrop">
      <section className="rooms-modal modal-panel">
        <button className="close" onClick={onClose}><X size={18} /></button>
        <h2>Study Room</h2>
        <div className="room-actions">
          <button className="pill primary" onClick={hostRoom}><Users size={17} /> Host room</button>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Room code" />
          <button className="pill" onClick={joinRoom}>Join</button>
        </div>
        {room && <p className="invite">Invite link: <strong>espresso://room/{room.code}</strong></p>}
        {error && <p className="error">{error}</p>}
        <div className="participants">
          {participants.map((person) => <div key={person.id}><Companion type={person.companion} small /><span>{person.username}</span></div>)}
        </div>
        <div className="room-footer">
          <p className="muted">People who join by link become friends for future sessions.</p>
          {room && <button className="link-button" onClick={leaveRoom}>Leave room</button>}
        </div>
      </section>
    </div>
  );
}

function loadOverlayPositions() {
  try {
    return JSON.parse(localStorage.getItem('espresso_overlay_positions') || '{}');
  } catch {
    return {};
  }
}

function saveOverlayPositions(positions) {
  localStorage.setItem('espresso_overlay_positions', JSON.stringify(positions));
}

function DraggableOverlayCompanion({ id, type, name, index = 0 }) {
  const savedPositions = loadOverlayPositions();
  const defaultPosition = {
    x: 42 + index * 180,
    y: Math.max(24, window.innerHeight - 210 - (index % 2) * 72)
  };
  const [position, setPosition] = useState(savedPositions[id] || defaultPosition);
  const dragRef = useRef(null);

  function clamp(nextX, nextY) {
    return {
      x: Math.min(Math.max(0, nextX), Math.max(0, window.innerWidth - 180)),
      y: Math.min(Math.max(0, nextY), Math.max(0, window.innerHeight - 190))
    };
  }

  function persist(nextPosition) {
    const nextPositions = { ...loadOverlayPositions(), [id]: nextPosition };
    saveOverlayPositions(nextPositions);
  }

  function startDrag(event) {
    event.preventDefault();
    window.espresso?.setOverlayInteractive?.(true);
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragRef.current) return;
    const nextPosition = clamp(event.clientX - dragRef.current.offsetX, event.clientY - dragRef.current.offsetY);
    setPosition(nextPosition);
  }

  function endDrag(event) {
    if (!dragRef.current) return;
    const nextPosition = clamp(event.clientX - dragRef.current.offsetX, event.clientY - dragRef.current.offsetY);
    setPosition(nextPosition);
    persist(nextPosition);
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const hovered = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.draggable-companion');
    window.espresso?.setOverlayInteractive?.(Boolean(hovered));
  }

  return (
    <div
      className="draggable-companion"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerEnter={() => window.espresso?.setOverlayInteractive?.(true)}
      onMouseEnter={() => window.espresso?.setOverlayInteractive?.(true)}
      onPointerLeave={() => {
        if (!dragRef.current) window.espresso?.setOverlayInteractive?.(false);
      }}
      onMouseLeave={() => {
        if (!dragRef.current) window.espresso?.setOverlayInteractive?.(false);
      }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Companion type={type} name={name} overlay />
    </div>
  );
}

function OverlayRoute() {
  const [state, setState] = useState({ companion: 'bunny', name: 'Vaishnavi', friends: [] });
  useEffect(() => {
    document.documentElement.classList.add('overlay-document');
    window.espresso?.setOverlayInteractive?.(false);
    window.espresso?.getOverlayState().then(setState);
    const unsubscribe = window.espresso?.onOverlayState?.(setState);
    function syncInteractivity(event) {
      const overCompanion = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.draggable-companion');
      window.espresso?.setOverlayInteractive?.(Boolean(overCompanion));
    }
    function disableInteractivity() {
      window.espresso?.setOverlayInteractive?.(false);
    }
    window.addEventListener('mousemove', syncInteractivity);
    window.addEventListener('mouseleave', disableInteractivity);
    return () => {
      document.documentElement.classList.remove('overlay-document');
      window.removeEventListener('mousemove', syncInteractivity);
      window.removeEventListener('mouseleave', disableInteractivity);
      window.espresso?.setOverlayInteractive?.(false);
      unsubscribe?.();
    };
  }, []);
  const friends = state.friends?.length ? state.friends : [];
  return (
    <div className="overlay-stage">
      <DraggableOverlayCompanion id="self" type={state.companion} name={state.name} index={0} />
      {friends.map((friend, index) => (
        <DraggableOverlayCompanion
          id={`friend-${friend.id}`}
          type={friend.companion}
          name={friend.username}
          index={index + 1}
          key={`${friend.id}-${index}`}
        />
      ))}
    </div>
  );
}

function App() {
  const isOverlay = window.location.hash === '#/overlay';
  document.documentElement.classList.toggle('overlay-document', isOverlay);
  const [user, setUser] = useState(normalizeUser(getStoredUser() || fallbackUser));
  const [authed, setAuthed] = useState(Boolean(localStorage.getItem('espresso_token')) || Boolean(getStoredUser()));
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState((user.preferences?.focusDuration || 25) * 60);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [productivityOpen, setProductivityOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [report, setReport] = useState({ todayMinutes: 0, sessionsToday: 0, streakDays: 0, allTimeHours: 0, days: [] });
  const activeSession = useRef(null);

  useEffect(() => {
    const prefs = user.preferences;
    setSecondsLeft(prefs.focusDuration * 60);
    window.espresso?.updateOverlay({ companion: prefs.companion, theme: prefs.theme, name: user.username });
  }, [user]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setSecondsLeft((next) => Math.max(0, next - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (secondsLeft !== 0 || !running) return;
    setRunning(false);
    completeSession();
    if (user.preferences.bellEnabled) ringBell();
  }, [secondsLeft, running]);

  const theme = user.preferences?.theme || 'cherry';

  async function startPause() {
    if (!running && !activeSession.current) {
      try {
        const { data } = await api.post('/sessions', { durationMinutes: user.preferences.focusDuration });
        activeSession.current = data.session.id;
      } catch {}
    }
    setRunning(!running);
  }

  async function completeSession() {
    if (!activeSession.current) return;
    try { await api.put(`/sessions/${activeSession.current}/complete`); } catch {}
    activeSession.current = null;
    loadReport();
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(user.preferences.focusDuration * 60);
    activeSession.current = null;
  }

  function skipTimer() {
    setSecondsLeft(0);
  }

  function ringBell() {
    const audio = new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, audio.currentTime);
    gain.gain.setValueAtTime(0.001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1.1);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 1.15);
  }

  async function loadReport() {
    try {
      const { data } = await api.get('/productivity');
      setReport(data);
    } catch {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => ({ label, minutes: 0, sessions: 0, date: label }));
      setReport({ todayMinutes: 0, sessionsToday: 0, streakDays: 0, allTimeHours: 0, days });
    }
    setProductivityOpen(true);
  }

  function logout() {
    clearAuth();
    setAuthed(false);
  }

  function roomChanged(room) {
    window.espresso?.updateOverlay({ friends: room.participants.filter((person) => person.id !== user.id) });
  }

  if (isOverlay) return <OverlayRoute />;
  if (!authed) return <Login onLogin={(nextUser) => { setUser(normalizeUser(nextUser)); setAuthed(true); }} />;

  return (
    <ScenicRoom theme={theme}>
      <header className="top-left"><p className="script">hi, {user.username} ~</p><span>let's plant some focus today</span></header>
      <nav className="top-nav">
        <span className="avatar">{user.username.slice(0, 1).toUpperCase()}</span><strong>{user.username}</strong>
        <button title="Productivity" onClick={loadReport}><BarChart3 size={18} /></button>
        <button title="Settings" onClick={() => setSettingsOpen(true)}><Settings size={18} /></button>
        <button title="Study rooms" onClick={() => setRoomsOpen(true)}><Users size={18} /></button>
        <button title="Toggle overlay" onClick={() => window.espresso?.toggleOverlay(true)}><Maximize2 size={18} /></button>
        <button title="Logout" onClick={logout}><LogOut size={18} /></button>
      </nav>
      <TimerCard preferences={user.preferences} running={running} secondsLeft={secondsLeft} onStart={startPause} onReset={resetTimer} onSkip={skipTimer} />
      <button className="floating-settings" onClick={() => setSettingsOpen(true)}><SlidersHorizontal size={18} /></button>
      {settingsOpen && <SettingsModal user={user} onClose={() => setSettingsOpen(false)} onSave={setUser} />}
      {productivityOpen && <ProductivityModal report={report} onClose={() => setProductivityOpen(false)} />}
      {roomsOpen && <RoomsModal user={user} onClose={() => setRoomsOpen(false)} onRoom={roomChanged} />}
    </ScenicRoom>
  );
}

export default App;
