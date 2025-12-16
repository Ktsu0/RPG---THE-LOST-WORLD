import { colors } from "./../../utilitarios.js";
import { ICONS } from "./../../icons.js";
import fs from "fs";
import path from "path";

const SAVE_DIR = path.join(process.cwd(), "saves");
const BACKUP_FILE = path.join(SAVE_DIR, "arena_backup.json");
const PONTOS_FILE = path.join(SAVE_DIR, "arena_pontos.json");

// Garante que o diretório de saves existe
if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
}

/**
 * Salva o inventário atual do jogador
 */
export function salvarInventario(jogador) {
  const backup = {
    inventario: [...jogador.inventario],
    equipamentos: { ...jogador.equipamentos },
    armaEquipada: jogador.armaEquipada ? { ...jogador.armaEquipada } : null,
    hp: jogador.hp,
    hpMax: jogador.hpMax,
    ataque: jogador.ataque,
    defesa: jogador.defesa,
  };

  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));
  console.log(`${ICONS.SUCESSO} ${colors.green}Inventário salvo com segurança!${colors.reset}`);
}

/**
 * Restaura o inventário original do jogador
 */
export function restaurarInventario(jogador) {
  if (!fs.existsSync(BACKUP_FILE)) {
    console.log(`${ICONS.ERRO} ${colors.red}Nenhum backup encontrado!${colors.reset}`);
    return false;
  }

  const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8"));
  
  jogador.inventario = backup.inventario;
  jogador.equipamentos = backup.equipamentos;
  jogador.armaEquipada = backup.armaEquipada;
  jogador.hp = backup.hp;
  jogador.hpMax = backup.hpMax;
  jogador.ataque = backup.ataque;
  jogador.defesa = backup.defesa;

  // Remove o arquivo de backup
  fs.unlinkSync(BACKUP_FILE);
  
  console.log(`${ICONS.SUCESSO} ${colors.green}Inventário restaurado!${colors.reset}`);
  return true;
}

/**
 * Limpa o inventário temporário da arena
 */
export function limparInventarioArena(jogador) {
  jogador.inventario = [];
  jogador.equipamentos = {
    head: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
  };
  jogador.armaEquipada = null;
}

/**
 * Carrega os pontos da arena salvos
 */
export function carregarPontosArena() {
  if (!fs.existsSync(PONTOS_FILE)) {
    return 0;
  }

  const data = JSON.parse(fs.readFileSync(PONTOS_FILE, "utf8"));
  return data.pontos || 0;
}

/**
 * Salva os pontos da arena
 */
export function salvarPontosArena(pontos) {
  fs.writeFileSync(PONTOS_FILE, JSON.stringify({ pontos }, null, 2));
}

/**
 * Adiciona pontos da arena
 */
export function adicionarPontosArena(pontosAtuais, pontosGanhos) {
  const novoTotal = pontosAtuais + pontosGanhos;
  salvarPontosArena(novoTotal);
  return novoTotal;
}
