import { ARMOR_SLOTS } from "./../jogo.js";
import { colors, rand } from "./../utilitarios.js"; // Importa as cores
import {
    gerenciarEquipamentos,
    aplicarBonusDeConjunto,
} from "./../itens/gerenciarEquipamentos.js";
import { getRaridadeCor } from "./../loja/itensLoja.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- Função auxiliar: formata itens para exibição ---
function formatarItens(array) {
    if (!array || array.length === 0)
        return `${colors.gray}Nenhum${colors.reset}`;
    const contagem = array.reduce((acc, item) => {
        const nome = item.nome || item; // caso seja string ou objeto
        acc[nome] = (acc[nome] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(contagem)
        .map(([nome, qtd]) => `${qtd}x ${nome}`)
        .join(", ");
}

// --- Função auxiliar: verifica se todos os slots têm set completo ---
function temSetCompleto(equipamentos) {
    const itens = Object.values(equipamentos).filter((it) => it && it.set);
    return (
        itens.length === ARMOR_SLOTS.length &&
        itens.every((it) => it.set === itens[0].set)
    );
}

// --- Exibir status ---
export function status(jogador) {
    console.log(`\n${colors.bright}--- STATUS ---${colors.reset}`);
    console.log(`${colors.cyan}Nome: ${colors.reset}${jogador.nome}`);
    console.log(
        `${colors.cyan}Nível:${colors.reset} ${jogador.nivel} | ${colors.green}XP:${
      colors.reset
    } ${jogador.xp}/${xpParaProximoNivel(jogador)}`
    );
    console.log(
        `${colors.green}HP:${colors.reset} ${jogador.hp}/${jogador.hpMax}`
    );
    console.log(
        `${colors.red}Atk atual:${colors.reset} ${calcularAtaque(jogador)}`
    );
    console.log(`${colors.yellow}Ouro:${colors.reset} ${jogador.ouro}`);
    console.log(
        `${colors.magenta}Consumíveis:${colors.reset} ${formatarItens(
      jogador.itens
    )}`
    );
    console.log(
        `${colors.magenta}Inventário:${colors.reset} ${formatarItens(
      jogador.inventario
    )}`
    );

    console.log(`\n${colors.bright}Equipamentos:${colors.reset}`);
    for (const s of ARMOR_SLOTS) {
        const it = jogador.equipamentos[s];
        const cor = it ? getRaridadeCor(it.raridade) : colors.gray; // Pega a cor pela raridade
        console.log(
                ` - ${s.toUpperCase()}: ${
        it
          ? `${cor}${it.nome}${colors.reset} (Def:${it.defesa} ATK+:${
              it.atkBonus
            } Set:${it.set || "Nenhum"})`
          : `${colors.gray}Nenhum${colors.reset}`
      }`
    );
  }
  console.log(
    `${colors.blue}Defesa total:${colors.reset} ${calcularDefesaTotal(jogador)}`
  );
  console.log(
    `${colors.red}Arma equipada:${colors.reset} ${
      jogador.armaEquipada
        ? `${getRaridadeCor(jogador.armaEquipada.raridade)}${
            jogador.armaEquipada.nome
          }${colors.reset}`
        : `${colors.gray}Nenhuma${colors.reset}`
    }`
  );

  const opcao = prompt(
    `\n${colors.bright}[M] Gerenciar Equipamentos/Armas${colors.reset} ou ${colors.white}Enter para sair:${colors.reset} `
  );
  if (opcao.toLowerCase() === "m") {
    gerenciarEquipamentos(jogador);
  }
  console.log(`${colors.dim}---------------${colors.reset}\n`);
}

// --- As outras funções (equiparItem, calcularAtaque, etc.) continuam as mesmas ---

// --- Equipar item ---
export function equiparItem(jogador, item) {
  if (!ARMOR_SLOTS.includes(item.slot)) {
    console.log("Slot desconhecido para esse item.");
    return;
  }

  if (jogador.restricoes && jogador.restricoes.semArmadura) {
    console.log(
      `${colors.red}❌ Sua raça não pode equipar armaduras!${colors.reset}`
    );
    return;
  }

  jogador.equipamentos[item.slot] = item;
  aplicarBonusDeConjunto(jogador);
  console.log(
    `${colors.green}✅ ${item.nome} equipado no slot ${item.slot}.${colors.reset}`
  );
}

// --- Calcular ataque ---
export function calcularAtaque(jogador) {
  let atk = jogador.ataque || 0;

  // bônus por nível
  atk += Math.floor(jogador.nivel * 2);

  // bônus de equipamentos
  const equipamentos = Object.values(jogador.equipamentos).filter((it) => it);
  const atkBonus = equipamentos.reduce(
    (acc, it) => acc + (it.atkBonus || 0),
    0
  );
  atk += atkBonus;

  // AQUI você soma o bônus de ataque do set
  atk += jogador.bonusAtk || 0;

  // bônus do amuleto
  if (jogador.amuletoEquipado)
    atk += Math.floor((jogador.ataqueOriginal || jogador.ataque) * 0.02);

  // bônus da arma equipada
  if (jogador.armaEquipada && jogador.armaEquipada.atk)
    atk += jogador.armaEquipada.atk;

  return atk;
}

// --- Calcular defesa ---
export function calcularDefesaTotal(jogador) {
  let def = jogador.defesa || 0;

  const itens = Object.values(jogador.equipamentos).filter((it) => it);
  for (const it of itens) {
    def += it.defesa || 0;
  }

  // AQUI você soma o bônus de defesa do set, se existir
  def += jogador.bonusDef || 0;

  return def;
}

// --- Cálculo de dano ---
export function danoDoJogador(jogador) {
  return Math.max(1, Math.floor(calcularAtaque(jogador)) + rand(0, 4));
}

// --- Progressão de nível ---
export function xpParaProximoNivel(jogador) {
  return Math.floor(50 * Math.pow(jogador.nivel, 1.4));
}

export function checarLevelUp(jogador) {
  while (jogador.xp >= xpParaProximoNivel(jogador)) {
    jogador.xp -= xpParaProximoNivel(jogador);
    jogador.nivel += 1;
    jogador.hpMax += 15;
    jogador.ataque += 2;
    jogador.defesa += 1;
    jogador.hp = jogador.hpMax;
    console.log(
      `\n🎉 ${colors.bright}Parabéns!${colors.reset} Você subiu para o nível ${jogador.nivel}! HP restaurado para ${jogador.hpMax}.\n`
    );
  }
}

// --- Aplica Fúria do Bárbaro ---
export function aplicarFuria(jogador, dano) {
  // Verifica se o jogador é Bárbaro e está com <= 40% de HP
  if (jogador.classe === "Bárbaro" && jogador.hp <= jogador.hpMax * 0.4) {
    console.log(
      `${colors.bright}${colors.red}🔥 Fúria do Bárbaro ativada!${colors.reset} Dano aumentado em 50%!`
    );
    return Math.floor(dano * 1.5);
  }
  // Caso contrário, retorna o dano normal
  return dano;
}