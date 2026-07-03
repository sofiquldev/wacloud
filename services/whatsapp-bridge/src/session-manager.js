import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export class SessionManager {
    #sessions = new Map();

    constructor({ log, laravelUrl, bridgeSecret }) {
        this.log = log;
        this.laravelUrl = laravelUrl;
        this.bridgeSecret = bridgeSecret;
        this.authDir = path.resolve(process.env.AUTH_DIR || '/tmp/wacloud-sessions');
        fs.mkdirSync(this.authDir, { recursive: true });
    }

    size() {
        return this.#sessions.size;
    }

    status(sessionId) {
        const s = this.#sessions.get(sessionId);
        if (!s) {
            return { status: 'disconnected', qr: null, phone: null };
        }
        return {
            status: s.status,
            qr: s.qr || null,
            phone: s.phone || null,
            display_name: s.displayName || null,
        };
    }

    async start(sessionId) {
        if (this.#sessions.has(sessionId)) {
            return this.status(sessionId);
        }

        const state = {
            status: 'pending_qr',
            qr: null,
            phone: null,
            displayName: null,
            sock: null,
        };
        this.#sessions.set(sessionId, state);

        const sessionPath = path.join(this.authDir, sessionId);
        fs.mkdirSync(sessionPath, { recursive: true });

        const { state: authState, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: authState,
            printQRInTerminal: false,
            syncFullHistory: false,
            markOnlineOnConnect: false,
        });

        state.sock = sock;

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                state.status = 'pending_qr';
                state.qr = await QRCode.toDataURL(qr);
                await this.#notifyLaravel(sessionId, {
                    status: 'pending_qr',
                    qr: state.qr,
                });
            }

            if (connection === 'open') {
                const user = sock.user;
                state.status = 'connected';
                state.qr = null;
                state.phone = user?.id?.split(':')[0] || null;
                state.displayName = user?.name || null;
                await this.#notifyLaravel(sessionId, {
                    status: 'connected',
                    phone: state.phone,
                    display_name: state.displayName,
                });
            }

            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                const restricted = code === DisconnectReason.loggedOut;
                state.status = restricted ? 'restricted' : 'disconnected';
                await this.#notifyLaravel(sessionId, {
                    status: state.status,
                    phone: state.phone,
                });
                if (restricted) {
                    this.#sessions.delete(sessionId);
                }
            }
        });

        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (!msg.message || msg.key.fromMe) continue;
                const from = msg.key.remoteJid;
                const body =
                    msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    '';
                await this.#postInbound(sessionId, {
                    session_id: sessionId,
                    from,
                    body,
                    message_id: msg.key.id,
                    push_name: msg.pushName,
                    timestamp: Number(msg.messageTimestamp) || Math.floor(Date.now() / 1000),
                });
            }
        });

        return this.status(sessionId);
    }

    async sendText(sessionId, to, body) {
        const state = this.#sessions.get(sessionId);
        if (!state?.sock || state.status !== 'connected') {
            throw new Error('Session not connected');
        }
        const jid = to.includes('@') ? to : `${to.replace(/\D/g, '')}@s.whatsapp.net`;
        const result = await state.sock.sendMessage(jid, { text: body });
        return {
            provider_message_id: result?.key?.id,
            status: 'sent',
        };
    }

    async stop(sessionId) {
        const state = this.#sessions.get(sessionId);
        if (state?.sock) {
            try {
                await state.sock.logout();
            } catch {
                state.sock.end?.();
            }
        }
        this.#sessions.delete(sessionId);
    }

    async #notifyLaravel(sessionId, payload) {
        try {
            await fetch(`${this.laravelUrl}/api/internal/bridge/session-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Bridge-Secret': this.bridgeSecret,
                },
                body: JSON.stringify({ session_id: sessionId, ...payload }),
            });
        } catch (e) {
            this.log.error({ err: e }, 'session-update failed');
        }
    }

    async #postInbound(sessionId, payload) {
        try {
            await fetch(`${this.laravelUrl}/api/internal/bridge/inbound-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Bridge-Secret': this.bridgeSecret,
                },
                body: JSON.stringify(payload),
            });
        } catch (e) {
            this.log.error({ err: e }, 'inbound-message failed');
        }
    }
}
