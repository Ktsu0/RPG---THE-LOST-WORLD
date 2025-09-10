import { criarMiniBoss } from "./../inimigos/miniBoss.js";
import { checarLevelUp } from "./../personagem/status.js";
import { colors, rand } from "./../utilitarios.js";
import { criarInimigo } from "./../inimigos/monstros.js";
import { batalha } from "./../batalha/batalha.js";

import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

// === Missões ===
export const missoes = [
  {
    descricao: "Desafio da Arena Amaldiçoada",
    historia:
      "Um ritual arcano abriu um portal. Monstros surgem em ondas. Sobreviva e a recompensa será sua.",
    tipo: "lendario",
    nivelMinimo: 5,
    chanceSucesso: 100,
    // Recompensas escalam com o nível do jogador
    xp: (nivel) => 50 + nivel * 5,
    ouro: (nivel) => 100 + nivel * 10,
    item: { nome: "Fragmento Antigo", raridade: "lendario" },
    chanceMiniBoss: 1,
    chanceMissaoExtra: 15,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 50 },
    tipoBatalha: "ondas",
    recompensaOndas: {
      item: { nome: "Fragmento Antigo", chance: 5 },
    },
    recompensaFinal: {
      item: { nome: "Fragmento Antigo", chance: 20 },
    },
  },
  {
    descricao: "Escoltar um mercador até a cidade",
    historia:
      "O mercador teme bandidos na estrada. Sua escolta é discreta, mas precisa ser rápida e firme.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 85,
    // Recompensas escalam
    xp: (nivel) => 15 + nivel * 1,
    ouro: (nivel) => 10 + nivel * 1,
    chanceMiniBoss: 5, // Padronizado
    chanceMissaoExtra: 5, // Padronizado
    chanceMasmorra: 1, // Padronizado
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Encontrar um amuleto escondido na floresta",
    historia:
      "Dizem que animais guardam um amuleto perdido. A floresta é traiçoeira; ouça os sinais antes de avançar.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 65,
    xp: (nivel) => 25 + nivel * 2,
    ouro: (nivel) => 20 + nivel * 2,
    chanceMiniBoss: 5, // Padronizado
    chanceMissaoExtra: 5, // Padronizado
    chanceMasmorra: 1, // Padronizado
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Ajudar o ferreiro local com materiais",
    historia:
      "O ferreiro precisa de minério raro para forjar uma lâmina. Trabalho braçal e risco de acidentes.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 90,
    xp: (nivel) => 10 + nivel * 1,
    ouro: (nivel) => 8 + nivel * 1,
    chanceMiniBoss: 5, // Padronizado
    chanceMissaoExtra: 5, // Padronizado
    chanceMasmorra: 1, // Padronizado
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Resgatar um aldeão perdido na floresta sombria",
    historia:
      "Gritos abafados ecoam entre as árvores. Encontrar o aldeão antes da noite é imperativo.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 85,
    xp: (nivel) => 18 + nivel * 1.5,
    ouro: (nivel) => 12 + nivel * 1.5,
    item: { nome: "Pena do Corvo Sombrio", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Recuperar uma espada amaldiçoada em cavernas",
    historia:
      "A lâmina chama por sangue. Há sombras vivas nas profundezas — recupere a gema que a contém.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 60,
    xp: (nivel) => 40 + nivel * 4,
    ouro: (nivel) => 35 + nivel * 3,
    item: { nome: "Gema da Escuridão", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 15,
    chanceMasmorra: 2,
    falha: { tipo: "item", chancePerdaItemPercent: 2 },
  },
  {
    descricao: "Proteger uma caravana de monstros à noite",
    historia:
      "Sob a lua, criaturas atacam em bando. Proteja a caravana e mantenha a rota aberta.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 70,
    xp: (nivel) => 30 + nivel * 3,
    ouro: (nivel) => 25 + nivel * 2.5,
    item: { nome: "Essência da Noite", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Domar uma criatura mística",
    historia:
      "Domar o resistente espírito bestial exige coragem. Uma tentativa mal feita pode ferir gravemente.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 55,
    xp: (nivel) => 50 + nivel * 5,
    ouro: (nivel) => 40 + nivel * 4,
    item: { nome: "Escama de Dragão Azul", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "hp", percentual: 20 },
  },
  {
    descricao: "Roubar relíquias de um templo antigo",
    historia:
      "Guardas e armadilhas protegem tesouros sagrados. A audácia traz lucros, mas pode trazer caça.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 50,
    xp: (nivel) => 45 + nivel * 4,
    ouro: (nivel) => 38 + nivel * 3.5,
    item: { nome: "Relíquia Brilhante", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Salvar um sábio em ruínas místicas",
    historia:
      "Um sábio preso pode oferecer conhecimento raro em troca da sua bravura. Corra contra o tempo.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 65,
    xp: (nivel) => 28 + nivel * 2,
    ouro: (nivel) => 18 + nivel * 1.8,
    item: { nome: "Pergaminho Arcano", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Recuperar um livro proibido na biblioteca sombria",
    historia:
      "Entre estantes empoeiradas, o livro sussurra segredos que podem corromper ou capacitar.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 55,
    xp: (nivel) => 42 + nivel * 3.5,
    ouro: (nivel) => 32 + nivel * 3,
    item: { nome: "Página Amaldiçoada", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Explorar o vulcão em erupção",
    historia:
      "Calor e cinzas testam sua resistência. No coração do vulcão, o poder ardente espera ser tomado.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 45,
    xp: (nivel) => 55 + nivel * 5,
    ouro: (nivel) => 50 + nivel * 4.5,
    item: { nome: "Coração de Magma", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "item", chancePerdaItemPercent: 2 },
  },
  {
    descricao: "Eliminar uma seita secreta",
    historia:
      "Rituais obscuros se aproximam do auge. Interrompa-os antes que criaturas sejam invocadas.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 60,
    xp: (nivel) => 38 + nivel * 3,
    ouro: (nivel) => 28 + nivel * 2.8,
    item: { nome: "Máscara Sombria", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Ajudar a curandeira a coletar ervas raras",
    historia:
      "Ervas que florescem apenas ao amanhecer são preciosas. Proteja a curandeira durante a coleta.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 85,
    xp: (nivel) => 20 + nivel * 1.8,
    ouro: (nivel) => 15 + nivel * 1.5,
    item: { nome: "Flor da Aurora", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "hp", percentual: 10 },
  },
];

// === Missões com drops por raridade ===
export function fazerMissao(jogador) {
  // Filtra as missões para exibir apenas as que o jogador tem nível para fazer
  const missoesDisponiveis = missoes.filter(
    (missao) => jogador.nivel >= missao.nivelMinimo
  );

  // Se não houver missões disponíveis para o nível do jogador
  if (missoesDisponiveis.length === 0) {
    console.log(
      "\n⚠ Não há missões disponíveis para o seu nível no momento. Tente explorar!"
    );
    return;
  }
  // Escolhe uma missão aleatória da lista FILTRADA
  const missao = missoesDisponiveis[rand(0, missoesDisponiveis.length - 1)];
  // --- VERIFICAÇÃO DO TIPO DE BATALHA ---
  // Se a missão for do tipo "ondas", chame a nova função de batalha
  if (missao.tipoBatalha === "ondas") {
    batalhaOndas(jogador);
    return; // Retorne para evitar a lógica padrão de recompensa da missão
  }

  // A verificação de nível mínimo agora é redundante e pode ser removida
  // if (jogador.nivel < missao.nivelMinimo) { ... }

  console.log(`\n📜 Missão: ${missao.descricao}`);
  console.log(`📖 ${missao.historia}`);
  let recompensaTexto = `Chance de sucesso: ${
    missao.chanceSucesso
  }% | Recompensa: ${missao.xp(jogador.nivel)} XP e ${missao.ouro(
    jogador.nivel
  )} ouro`;
  if (missao.item) {
    if (typeof missao.item === "string") {
      recompensaTexto += ` + item (${missao.item})`;
    } else {
      recompensaTexto += ` + item ${missao.item.nome} [${missao.item.raridade}]`;
    }
  }
  console.log(recompensaTexto + ".");

  const confirmar = prompt("Deseja tentar a missão? (s/n) ");
  if (confirmar.toLowerCase() !== "s") {
    console.log("Missão cancelada.");
    return;
  }

  // 🔥 1% de chance de masmorra secreta
  if (rand(1, 100) <= missao.chanceMasmorra) {
    console.log(
      "⚠ Você encontrou uma MASMORRA SECRETA! Prepare-se para um desafio insano!"
    );
    // 1. Escolhe um template de masmorra aleatório
    const templateId = rand(0, DUNGEON_TEMPLATES.length - 1);

    // 2. Gera a masmorra
    const masmorraGerada = gerarMasmorra(templateId);
    console.log(`Você entrou em: ${masmorraGerada.template.nome}`);

    // 3. Inicia a sessão de exploração
    // Este objeto precisa ser armazenado em um estado global do jogador ou do jogo
    jogador.masmorraAtual = enterDungeon(masmorraGerada, jogador);

    // Agora você precisa entrar em um novo loop de jogo para a exploração da masmorra
    // A lógica do jogo principal precisará ser ajustada para permitir
    // comandos como "mover", "investigar" etc.

    return; // Sai da função fazerMissao()
  }

  // 🔥 10% de chance de miniboss (balanceado por tipo da missão)
  if (rand(1, 100) <= missao.chanceMiniBoss) {
    const miniboss = criarMiniBoss(missao.tipo, jogador.nivel);
    console.log(
      `⚠ Um MiniBoss apareceu: ${miniboss.nome} (HP: ${miniboss.hp}, ATK: ${miniboss.atk})`
    );
    // --- LÓGICA DA BATALHA DO MINIBOSS ---
    const venceuBatalha = batalha(miniboss, jogador);

    if (!venceuBatalha) {
      console.log(`❌ Você foi derrotado pelo mini-boss! A missão falhou.`);
      aplicarPenalidade(missao.falha.tipo, jogador);
      return; // Sai da função, pois o jogador falhou na missão
    }
  }

  // 🎲 Resultado da missão
  const resultado = rand(1, 100);
  if (resultado <= missao.chanceSucesso) {
    console.log("✅ Missão completada com sucesso!");
    console.log(
      `Você recebeu ${missao.xp(jogador.nivel)} XP e ${missao.ouro(
        jogador.nivel
      )} ouro`
    );
    jogador.xp += missao.xp(jogador.nivel);
    jogador.ouro += missao.ouro(jogador.nivel);

    // Entregar item (com chance por raridade)
    if (missao.item && typeof missao.item === "object") {
      const raridade = (missao.item.raridade || "comum").toLowerCase();
      let baseChance = 0;
      if (raridade === "comum") baseChance = 80;
      else if (raridade === "raro") baseChance = 50;
      else if (raridade === "lendario") baseChance = 30;

      const bonusClasse = jogador.classe === "Assassino" ? 10 : 0;
      const chanceFinal = Math.min(100, baseChance + bonusClasse);

      const rollDrop = rand(1, 100);
      if (rollDrop <= chanceFinal) {
        jogador.inventario.push(missao.item.nome);
        console.log(
          `🎁 Você obteve o item da missão: ${
            missao.item.nome
          } (${missao.item.raridade.toUpperCase()})`
        );
        // verifiqueiAmuletoSupremo();
      } else {
        console.log("Você não conseguiu pegar o item especial da missão.");
      }
    } else if (missao.item && typeof missao.item === "string") {
      jogador.inventario.push(missao.item);
      console.log(`Você obteve o item: ${missao.item}`);
      // verifiqueiAmuletoSupremo();
    }

    // Chance extra de encontrar Poção de Cura
    if (rand(1, 100) <= 30) {
      jogador.itens.push("Poção de Cura");
      console.log("Além disso, você encontrou uma Poção de Cura!");
    }

    // Chance de missão extra
    if (rand(1, 100) <= missao.chanceMissaoExtra) {
      console.log("🔥 Uma missão extra apareceu! Continue sua aventura...");
      fazerMissao(jogador);
    }

    checarLevelUp(jogador);
  } else {
    console.log("❌ Falhou na missão!"); // Captura e exibe a mensagem de penalidade
    const mensagemPenalidade = aplicarPenalidade(missao.falha.tipo, jogador);
    console.log(mensagemPenalidade);
  }
}

export function batalhaOndas(jogador) {
  console.log(
    `${colors.bright}Você entrou na Arena Amaldiçoada! Prepare-se para o desafio!${colors.reset}`
  );
  console.log(
    `${colors.red}⚠️ Aviso: Não é possível fugir deste desafio! A derrota significa uma grande perda.${colors.reset}`
  );

  for (let onda = 1; onda <= 10; onda++) {
    console.log(`\n--- Onda ${onda} de 10 ---`);
    const inimigo = criarInimigo(jogador);
    const venceuOnda = batalha(inimigo, jogador, false);

    if (venceuOnda) {
      if (rand(1, 100) <= 5) {
        console.log(
          `${colors.green}🎉 Você encontrou um ${colors.bright}Fragmento Antigo${colors.reset}${colors.green} durante a batalha!${colors.reset}`
        );
        jogador.inventario.push("Fragmento Antigo");
      }
    } else {
      console.log(
        `${colors.red}❌ Você foi derrotado na Onda ${onda}! A missão falhou.${colors.reset}`
      );
      jogador.hp = Math.floor(jogador.hpMax / 2);
      return false;
    }
  }

  console.log(
    `\n${colors.bright}${colors.red}O portal se fecha e um MiniBoss lendário surge!${colors.reset}`
  );
  const miniboss = criarMiniBoss(jogador);
  const venceuBoss = batalha(miniboss, jogador, false);

  if (venceuBoss) {
    console.log(
      `${colors.green}🎉 Vitória! O MiniBoss foi derrotado!${colors.reset}`
    );
    if (rand(1, 100) <= 20) {
      console.log(
        `${colors.green}🎁 A sua perseverança foi recompensada! Você obteve o ${colors.bright}Fragmento Antigo${colors.reset}${colors.green} do MiniBoss!${colors.reset}`
      );
      jogador.inventario.push("Fragmento Antigo");
    } else {
      console.log("O MiniBoss não deixou cair o Fragmento Antigo.");
    }

    // Recompensa final escalada com o nível
    const ouroFinal = 100 + jogador.nivel * 10;
    const xpFinal = 50 + jogador.nivel * 5;

    jogador.ouro += ouroFinal;
    jogador.xp += xpFinal;
    console.log(
      `${colors.yellow}Você ganhou ${ouroFinal} de ouro e ${xpFinal} XP como recompensa final!${colors.reset}`
    );

    checarLevelUp(jogador);
    return true;
  } else {
    console.log(
      `${colors.red}❌ Você foi derrotado pelo MiniBoss! A missão falhou.${colors.reset}`
    );
    jogador.hp = Math.floor(jogador.hpMax / 2);
    return false;
  }
}

function aplicarPenalidade(tipo, jogador) {
  if (tipo === "ouro") {
    const perda = Math.floor(jogador.ouro * (rand(15, 20) / 100));
    jogador.ouro = Math.max(0, jogador.ouro - perda);
    return `💰 Você perdeu ${perda} de ouro!`;
  }
  if (tipo === "hp") {
    const perda = Math.floor(jogador.hp * 0.2);
    jogador.hp = Math.max(1, jogador.hp - perda);
    return `❤️ Você perdeu ${perda} de HP!`;
  }
  if (tipo === "item" && jogador.setCompleto) {
    if (rand(1, 100) <= 2) {
      const itemPerdido = jogador.removerItemAleatorio(); // retorna nome do item removido
      return `🛡️ Você perdeu uma peça do seu set: ${itemPerdido}!`;
    } else {
      return `Por sorte, não perdeu nenhum item.`;
    }
  }
  return `Sem penalidades graves desta vez.`;
}
