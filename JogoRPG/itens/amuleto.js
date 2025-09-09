import promptSync from "prompt-sync";
import { colors } from "./../utilitarios.js";
import { getRaridadeCor } from "./loja/itensLoja.js";
const prompt = promptSync();

// --- Menu de seleção para Amuleto ou Talismã ---
export function menuAmuletoTalisma(jogador) {
  console.log(`\n${colors.bright}🔮 Menu de Itens Místicos 🔮${colors.reset}`);
  console.log(`[1] Amuleto Supremo`);
  console.log(`[2] Talismã da Torre`);
  console.log(`[0] Voltar`);

  const opcao = prompt("Escolha: ");
  if (opcao === "1") {
    menuAmuletoSupremo(jogador);
  } else if (opcao === "2") {
    menuTalismaSupremo(jogador);
  } else if (opcao === "0") {
    console.log("Voltando...");
  } else {
    console.log("Opção inválida.");
  }
}

// --- Menu Amuleto Supremo (antigo menuAmuleto) ---
export function menuAmuletoSupremo(jogador) {
  console.log(`\n${colors.bright}🔮 Menu do Amuleto 🔮${colors.reset}`);
  console.log("Para criar o Amuleto Supremo você precisa dos seguintes itens:");

  const itensNecessarios = [
    { nome: "Pena do Corvo Sombrio", raridade: "comum", qtd: 0, max: 5 },
    { nome: "Pergaminho Arcano", raridade: "comum", qtd: 0, max: 5 },
    { nome: "Flor da Aurora", raridade: "comum", qtd: 0, max: 5 },
    { nome: "Essência da Noite", raridade: "raro", qtd: 0, max: 2 },
    { nome: "Relíquia Brilhante", raridade: "raro", qtd: 0, max: 2 },
    { nome: "Página Amaldiçoada", raridade: "raro", qtd: 0, max: 2 },
    { nome: "Máscara Sombria", raridade: "raro", qtd: 0, max: 2 },
    { nome: "Gema da Escuridão", raridade: "lendario", qtd: 0, max: 1 },
    { nome: "Escama de Dragão Azul", raridade: "lendario", qtd: 0, max: 1 },
    { nome: "Coração de Magma", raridade: "lendario", qtd: 0, max: 1 },
  ];

  // Contar quantos o jogador tem
  for (let item of itensNecessarios) {
    item.qtd = jogador.inventario.filter((i) => i === item.nome).length;
  }

  itensNecessarios.forEach((item) => {
    const cor = getRaridadeCor(item.raridade);
    const corConcluido = item.qtd >= item.max ? colors.green : colors.red;
    console.log(
      `${cor}${item.nome}${colors.reset} (${item.raridade}) [${corConcluido}${item.qtd}${colors.reset}/${corConcluido}${item.max}${colors.reset}]`
    );
  });

  console.log(
    `\n${colors.magenta}Bônus do Amuleto Supremo: +5% ATK e +10% VIDA${colors.reset}`
  );

  const opcao = prompt(
    `${colors.green}[1] CRAFTAR${colors.reset} | ${colors.gray}[2] SAIR${colors.reset}: `
  );
  if (opcao === "1") {
    const possuiTodos = itensNecessarios.every((item) => item.qtd >= item.max);
    if (possuiTodos) {
      console.log(
        `${colors.green}Você criou o Amuleto Supremo!${colors.reset}`
      );
      gerenciarAmuleto(jogador);
      // Remove os itens usados
      for (let item of itensNecessarios) {
        for (let i = 0; i < item.max; i++) {
          const index = jogador.inventario.indexOf(item.nome);
          if (index !== -1) jogador.inventario.splice(index, 1);
        }
      }
      jogador.inventario.push("Amuleto Supremo");
      jogador.amuletoEquipado = false; // ainda não equipado
    } else {
      console.log(
        `${colors.red}❌ Você não possui todos os itens necessários!${colors.reset}`
      );
    }
  }
}

// --- Menu Talismã da Torre ---
export function menuTalismaSupremo(jogador) {
  console.log(
    `\n${colors.bright}🗼 Menu do Talismã da Torre 🗼${colors.reset}`
  );
  console.log(
    "Para criar o Talismã da Torre você precisa dos seguintes itens:"
  );

  const itensNecessarios = [
    { nome: "Fragmento Antigo", raridade: "lendario", qtd: 0, max: 10 },
  ];
  const ouroNecessario = 2000;

  // Contar quantos o jogador tem
  for (let item of itensNecessarios) {
    item.qtd = jogador.inventario.filter((i) => i === item.nome).length;
  }

  itensNecessarios.forEach((item) => {
    const cor = getRaridadeCor(item.raridade);
    const corConcluido = item.qtd >= item.max ? colors.green : colors.red;
    console.log(
      `${cor}${item.nome}${colors.reset} (${item.raridade}) [${corConcluido}${item.qtd}${colors.reset}/${corConcluido}${item.max}${colors.reset}]`
    );
  });
  const corOuro = jogador.ouro >= ouroNecessario ? colors.green : colors.red;
  console.log(
    `Ouro necessário: [${corOuro}${jogador.ouro}/${ouroNecessario}${colors.reset}]`
  );

  const opcao = prompt(
    `${colors.green}[1] CRAFTAR${colors.reset} | ${colors.gray}[2] SAIR${colors.reset}: `
  );
  if (opcao === "1") {
    const possuiTodosItens = itensNecessarios.every(
      (item) => item.qtd >= item.max
    );
    const possuiOuro = jogador.ouro >= ouroNecessario;

    if (possuiTodosItens && possuiOuro) {
      console.log(
        `${colors.green}✅ Você criou o Talismã da Torre!${colors.reset}`
      );

      // Remove os itens usados
      for (let item of itensNecessarios) {
        for (let i = 0; i < item.max; i++) {
          const index = jogador.inventario.indexOf(item.nome);
          if (index !== -1) jogador.inventario.splice(index, 1);
        }
      }
      jogador.ouro -= ouroNecessario;
      jogador.inventario.push("Talismã da Torre");
    } else {
      console.log(
        `${colors.red}❌ Você não possui os itens e/ou o ouro necessários!${colors.reset}`
      );
    }
  }
}

// --- Gerenciar Amuleto (função original) ---
export function gerenciarAmuleto(jogador) {
  if (!jogador.inventario.includes("Amuleto Supremo")) {
    console.log(
      `${colors.red}❌ Você ainda não possui o Amuleto Supremo.${colors.reset}`
    );
    return;
  }

  if (!jogador.amuletoEquipado) {
    console.log(
      `${colors.green}✅ Você equipou o Amuleto Supremo! (+5% ATK e +10% VIDA)${colors.reset}`
    );
    jogador.ataqueOriginal = jogador.ataque;
    jogador.hpMaxOriginal = jogador.hpMax;
    jogador.ataque = Math.floor(jogador.ataqueOriginal * 1.05);
    jogador.hpMax = Math.floor(jogador.hpMaxOriginal * 1.1);
    jogador.hp = jogador.hpMax;
    jogador.amuletoEquipado = true;
  } else {
    console.log("Você removeu o Amuleto Supremo.");
    jogador.ataque = jogador.ataqueOriginal;
    jogador.hpMax = jogador.hpMaxOriginal;
    if (jogador.hp > jogador.hpMax) jogador.hp = jogador.hpMax;
    jogador.amuletoEquipado = false;
  }
}
