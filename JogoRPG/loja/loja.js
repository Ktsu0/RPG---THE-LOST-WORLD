import { mostrarBonusDoSet } from "./bonusSet.js";
import { colors } from "./../utilitarios.js";
import { getRaridadeCor } from "./../codigosUniversais.js";
import { armasDisponiveis } from "./itensLoja/armas.js";
import { loja } from "./itensLoja/itensLoja.js";
import { consumiveis } from "./itensLoja/consumiveis.js";

function exibirOuro(jogador) {
  console.log(
    `Você tem ${colors.yellow}${jogador.ouro}${colors.reset} de ouro`
  );
}

function comprarItem(item, jogador) {
  if (jogador.ouro >= item.preco) {
    jogador.ouro -= item.preco;
    jogador.inventario.push(item);
    console.log(
      `${colors.green}✅ Você comprou: ${item.nome}! O item foi para o seu inventário.${colors.reset}`
    );
    return true;
  } else {
    console.log(`${colors.red}Ouro insuficiente!${colors.reset}`);
    return false;
  }
}

async function menuArmaduras(jogador) {
  let voltarConjuntos = false;

  while (!voltarConjuntos) {
    const conjuntos = [
      ...new Set(
        loja.filter((i) => i.slot !== "consumable" && i.set).map((i) => i.set)
      ),
    ];

    exibirOuro(jogador);
    console.log(
      `\n${colors.bright}${colors.cyan}Conjuntos disponíveis:${colors.reset}`
    );
    conjuntos.forEach((set, i) => {
      const cor = getRaridadeCor(
        loja.find((item) => item.set === set).raridade
      );
      console.log(`[${i + 1}] ${cor}${set}${colors.reset}`);
    });
    console.log(`${colors.red}[0] Voltar${colors.reset}`);

    const setEscolhaRaw = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });
    const setEscolhaNum = parseInt(setEscolhaRaw);
    let setNome;

    if (
      !isNaN(setEscolhaNum) &&
      setEscolhaNum > 0 &&
      setEscolhaNum <= conjuntos.length
    ) {
      setNome = conjuntos[setEscolhaNum - 1];
    } else if (setEscolhaRaw === "0") {
      voltarConjuntos = true;
      continue;
    } else {
      setNome = setEscolhaRaw;
    }

    const pecas = loja.filter(
      (i) => i.set === setNome && i.slot !== "consumable"
    );
    if (pecas.length === 0) {
      console.log(`${colors.red}Conjunto inválido!${colors.reset}`);
      continue;
    }

    let voltarPecas = false;
    while (!voltarPecas) {
      console.log(
        `\n${colors.dim}⚠ Complete o conjunto ${colors.bright}${setNome}${
          colors.reset
        }${colors.dim} para ganhar bônus: ${mostrarBonusDoSet(setNome)}${
          colors.reset
        }`
      );
      exibirOuro(jogador);
      console.log(
        `\n${colors.bright}${colors.cyan}Peças disponíveis do conjunto ${setNome}:${colors.reset}`
      );

      pecas.forEach((p, i) => {
        const cor = getRaridadeCor(p.raridade);
        console.log(
          `[${i + 1}] ${p.slot.toUpperCase()}: ${cor}${p.nome}${
            colors.reset
          } (${colors.magenta}+${p.defesa} DEF, +${p.atkBonus} ATK${
            colors.reset
          }) - ${colors.yellow}${p.preco}${colors.reset} ouro`
        );
      });

      console.log(`${colors.red}[0] Voltar${colors.reset}`);
      const escolhaPecaRaw = await new Promise((resolve) => {
        process.stdin.once("data", (key) => {
          resolve(key.toString().trim());
        });
      });
      const escolhaPeca = parseInt(escolhaPecaRaw);

      if (escolhaPeca === 0) {
        voltarPecas = true;
        continue;
      }

      const itemEscolhido = pecas[escolhaPeca - 1];
      if (!itemEscolhido) {
        console.log(`${colors.red}Peça inválida!${colors.reset}`);
        continue;
      }

      comprarItem(itemEscolhido, jogador);
    }
  }
}

async function menuArmas(jogador) {
  let voltarArmas = false;
  while (!voltarArmas) {
    exibirOuro(jogador);
    console.log(
      `\n⚔ ${colors.bright}${colors.cyan}Armas disponíveis:${colors.reset}`
    );

    armasDisponiveis.forEach((arma, i) => {
      const cor = getRaridadeCor(arma.raridade);
      console.log(
        `[${i + 1}] ${cor}${arma.nome}${colors.reset} (${colors.magenta}+${
          arma.atk
        } ATK${colors.reset}) ${colors.cyan}${
          arma.efeito ? `(Efeito: ${arma.efeito.tipo})` : ""
        }${colors.reset} - ${colors.yellow}${arma.preco}${colors.reset} ouro`
      );
    });

    console.log(`${colors.red}[0] Voltar${colors.reset}`);
    const escolhaArmaRaw = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });
    const escolhaArma = parseInt(escolhaArmaRaw);

    if (escolhaArma === 0) {
      voltarArmas = true;
      continue;
    }

    const arma = armasDisponiveis[escolhaArma - 1];
    if (!arma) {
      console.log(`${colors.red}Escolha inválida!${colors.reset}`);
      continue;
    }

    comprarItem(arma, jogador);
  }
}

async function menuPocoes(jogador) {
  let voltarPocoes = false;
  const pocaoDeCura = consumiveis.find((item) => item.nome === "Poção de Cura");

  if (!pocaoDeCura) {
    console.log(`${colors.red}❌ Poção de Cura não encontrada!${colors.reset}`);
    return;
  }

  while (!voltarPocoes) {
    exibirOuro(jogador);

    const numPocoes = jogador.inventario.filter(
      (item) => item.nome === pocaoDeCura.nome
    ).length;

    console.log(
      `\n🧪 ${colors.bright}${colors.cyan}Poções de Cura${colors.reset}`
    );
    console.log(
      `Cada poção restaura entre ${colors.green}20% - 30%${colors.reset} da sua vida máxima.`
    );
    console.log(
      `Preço: ${colors.yellow}${pocaoDeCura.preco}${colors.reset} ouro | Você possui: ${colors.green}${numPocoes}${colors.reset}`
    );
    console.log(`[1] Comprar Poção`);
    console.log(`${colors.red}[0] Voltar${colors.reset}`);

    const escolhaPocao = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });

    if (escolhaPocao === "0") {
      voltarPocoes = true;
    } else if (escolhaPocao === "1") {
      comprarItem(pocaoDeCura, jogador);
    } else {
      console.log(`${colors.red}Escolha inválida!${colors.reset}`);
    }
  }
}

// --- Loop principal da loja ---
export async function abrirLoja(jogador) {
  let sairLoja = false;
  while (!sairLoja) {
    console.log(
      `\n🏪 ${colors.bright}${colors.cyan}Bem-vindo à Loja!${colors.reset}`
    );
    exibirOuro(jogador);
    console.log(`[1] ${colors.cyan}Armaduras${colors.reset}`);
    console.log(`[2] ${colors.cyan}Armas${colors.reset}`);
    console.log(`[3] ${colors.cyan}Poções de Cura${colors.reset}`);
    console.log(`🚪 ${colors.red}[0] Sair${colors.reset}`);

    const escolha = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });

    if (escolha === "1") await menuArmaduras(jogador);
    else if (escolha === "2") await menuArmas(jogador);
    else if (escolha === "3") await menuPocoes(jogador);
    else if (escolha === "0") {
      sairLoja = true;
      console.log(`${colors.cyan}Saindo da loja.${colors.reset}`);
    } else {
      console.log(`${colors.red}Escolha inválida!${colors.reset}`);
    }
  }
}
