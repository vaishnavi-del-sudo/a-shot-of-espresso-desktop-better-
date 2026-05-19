const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'espresso-dev-secret';

app.use(cors());
app.use(express.json());

let nextUserId = 2;
let nextSessionId = 1;
let nextRoomId = 1;

const users = [
  {
    id: 1,
    email: 'abc@example.com',
    username: 'abc',
    passwordHash: bcrypt.hashSync('espresso123', 10),
    friends: [2, 3],
    preferences: {
      companion: 'bunny',
      theme: 'cherry',
      focusDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      sessionsUntilLongBreak: 4,
      bellEnabled: true
    }
  }
];

const sessions = [];
const rooms = [];

const friends = [
  { id: 2, username: 'Mira', companion: 'axolotl' },
  { id: 3, username: 'Anya', companion: 'fox' },
  { id: 4, username: 'Noor', companion: 'frog' }
];

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    preferences: user.preferences,
    friends: user.friends || []
  };
}

function tokenFor(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
}

function requireAuth(req, res, next) {
  const raw = req.headers.authorization || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((item) => item.id === payload.userId);
    if (!user) return res.status(401).json({ error: 'Unknown user' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/signup', (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ error: 'Email, password and username are required' });
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Account already exists' });
  }
  const user = {
    id: nextUserId++,
    email,
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    friends: [],
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
  users.push(user);
  res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: tokenFor(user), user: publicUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.put('/api/preferences', requireAuth, (req, res) => {
  req.user.preferences = { ...req.user.preferences, ...req.body };
  res.json({ preferences: req.user.preferences });
});

app.post('/api/sessions', requireAuth, (req, res) => {
  const session = {
    id: nextSessionId++,
    userId: req.user.id,
    roomId: req.body.roomId || null,
    durationMinutes: Number(req.body.durationMinutes || req.user.preferences.focusDuration),
    completed: false,
    startedAt: new Date().toISOString(),
    endedAt: null
  };
  sessions.push(session);
  res.status(201).json({ session });
});

app.put('/api/sessions/:id/complete', requireAuth, (req, res) => {
  const session = sessions.find((item) => item.id === Number(req.params.id) && item.userId === req.user.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  session.completed = true;
  session.endedAt = new Date().toISOString();
  res.json({ session });
});

app.get('/api/productivity', requireAuth, (req, res) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const completed = sessions.filter((session) => session.userId === req.user.id && session.completed && session.startedAt.startsWith(dateKey));
    return {
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: dateKey,
      minutes: completed.reduce((sum, session) => sum + session.durationMinutes, 0),
      sessions: completed.length
    };
  });
  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);
  res.json({
    todayMinutes: days[6].minutes,
    sessionsToday: days[6].sessions,
    streakDays: totalMinutes > 0 ? 1 : 0,
    allTimeHours: Math.round(sessions.filter((session) => session.userId === req.user.id && session.completed).reduce((sum, session) => sum + session.durationMinutes, 0) / 60),
    days
  });
});

app.post('/api/rooms', requireAuth, (req, res) => {
  const room = {
    id: nextRoomId++,
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    name: req.body.name || `${req.user.username}'s study room`,
    hostId: req.user.id,
    participants: [
      { id: req.user.id, username: req.user.username, companion: req.user.preferences.companion },
      ...friends.slice(0, 2)
    ],
    createdAt: new Date().toISOString()
  };
  rooms.push(room);
  res.status(201).json({ room, inviteLink: `espresso://room/${room.code}` });
});

app.post('/api/rooms/join', requireAuth, (req, res) => {
  const room = rooms.find((item) => item.code === String(req.body.code || '').toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!room.participants.some((participant) => participant.id === req.user.id)) {
    room.participants.push({ id: req.user.id, username: req.user.username, companion: req.user.preferences.companion });
    room.participants.forEach((participant) => {
      if (participant.id !== req.user.id && !req.user.friends.includes(participant.id)) req.user.friends.push(participant.id);
    });
  }
  res.json({ room });
});

app.get('/api/rooms/:id', requireAuth, (req, res) => {
  const room = rooms.find((item) => item.id === Number(req.params.id));
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

app.get('/api/friends', requireAuth, (req, res) => {
  res.json({ friends });
});

app.get('/health', (req, res) => res.json({ ok: true, app: 'A Shot of Espresso' }));

app.listen(PORT, () => console.log(`A Shot of Espresso API running on http://localhost:${PORT}`));
