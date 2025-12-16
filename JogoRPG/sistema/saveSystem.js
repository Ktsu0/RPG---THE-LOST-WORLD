import fs from 'fs';
import path from 'path';
import { colors } from '../utilitarios.js';

const SAVE_DIR = './saves';
const SAVE_FILE = 'save_automatico.json';
const SAVE_PATH = path.join(SAVE_DIR, SAVE_FILE);

// Garante que a pasta saves existe
if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR);
}

export function salvarJogo(jogador) {
  try {
    const dados = JSON.stringify(jogador, null, 2);
    fs.writeFileSync(SAVE_PATH, dados, 'utf8');
    // Save silencioso para não poluir o console a cada turno
    // Se quiser debug, descomente:
    // console.log(`${colors.green}💾 Jogo salvo automaticamente.${colors.reset}`);
    return true;
  } catch (erro) {
    console.error(`${colors.red}❌ Erro ao salvar jogo: ${erro.message}${colors.reset}`);
    return false;
  }
}

export function carregarJogo() {
  try {
    if (!fs.existsSync(SAVE_PATH)) return null;
    
    const dados = fs.readFileSync(SAVE_PATH, 'utf8');
    const jogador = JSON.parse(dados);
    console.log(`${colors.green}✅ Save carregado com sucesso!${colors.reset}`);
    return jogador;
  } catch (erro) {
    console.error(`${colors.red}❌ Erro ao carregar save: ${erro.message}${colors.reset}`);
    return null;
  }
}

export function verificarSaveExistente() {
  return fs.existsSync(SAVE_PATH);
}
