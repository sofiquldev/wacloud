import express from 'express';
import pino from 'pino';
import { SessionManager } from './session-manager.js';

const log = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = Number(process.env.PORT || 3001);
const BRIDGE_SECRET = process.env.BRIDGE_SECRET || 'change-me-bridge-secret';
const LARAVEL_URL = (process.env.LARAVEL_INTERNAL_URL || 'http://nginx').replace(/\/$/, '');

const sessions = new SessionManager({ log, laravelUrl: LARAVEL_URL, bridgeSecret: BRIDGE_SECRET });

function auth(req, res, next) {
    const secret = req.header('X-Bridge-Secret');
    if (!secret || secret !== BRIDGE_SECRET) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}

app.get('/health', (_req, res) => {
    res.json({ ok: true, sessions: sessions.size() });
});

app.post('/sessions/:sessionId/start', auth, async (req, res) => {
    try {
        const status = await sessions.start(req.params.sessionId, req.body?.account_id);
        res.json(status);
    } catch (e) {
        log.error(e);
        res.status(500).json({ message: e.message });
    }
});

app.get('/sessions/:sessionId/status', auth, (req, res) => {
    res.json(sessions.status(req.params.sessionId));
});

app.post('/sessions/:sessionId/send', auth, async (req, res) => {
    try {
        const { to, body } = req.body || {};
        if (!to || !body) {
            return res.status(422).json({ message: 'to and body are required' });
        }
        const result = await sessions.sendText(req.params.sessionId, to, body);
        res.json(result);
    } catch (e) {
        log.error(e);
        res.status(500).json({ message: e.message });
    }
});

app.delete('/sessions/:sessionId', auth, async (req, res) => {
    await sessions.stop(req.params.sessionId);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    log.info(`WaCloud bridge listening on ${PORT}`);
});
