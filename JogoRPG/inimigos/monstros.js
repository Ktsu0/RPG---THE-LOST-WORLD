import { rand } from "./../utilitarios.js";

// --- Funções de criação de inimigos ---
export function criarInimigo(jogador) {
  const templates = [
    {
      nome: "Goblin Ladrão",
      minNivel: 1,
      baseHp: 20,
      baseAtk: 5,
      escalaHp: 4.5,
      escalaAtk: 1,
      xp: 12,
      ouro: 10,
      habilidade: "roubar_e_fugir",
    },
    {
      nome: "Lobo das Sombras",
      minNivel: 1,
      baseHp: 28,
      baseAtk: 7,
      escalaHp: 5,
      escalaAtk: 1.2,
      xp: 18,
      ouro: 8,
      habilidade: "esquiva",
    },
    {
      nome: "Bandido Veterano",
      minNivel: 2,
      baseHp: 35,
      baseAtk: 8,
      escalaHp: 6,
      escalaAtk: 1.5,
      xp: 25,
      ouro: 15,
      habilidade: "ataque_duplo",
    },
    {
      nome: "Arauto do Pântano",
      minNivel: 2,
      baseHp: 32,
      baseAtk: 9,
      escalaHp: 6.2,
      escalaAtk: 1.6,
      xp: 22,
      ouro: 14,
      habilidade: "envenenamento",
    },
    {
      nome: "Espectro Errante",
      minNivel: 3,
      baseHp: 40,
      baseAtk: 10,
      escalaHp: 7.0,
      escalaAtk: 1.8,
      xp: 30,
      ouro: 16,
      habilidade: "invulneravel",
    },
    {
      nome: "Aranha Venenosa Gigante",
      minNivel: 3,
      baseHp: 45,
      baseAtk: 14,
      escalaHp: 7.5,
      escalaAtk: 2,
      xp: 35,
      ouro: 20,
      habilidade: "teia",
    },
    {
      nome: "Gárgula de Pedra",
      minNivel: 4,
      baseHp: 55,
      baseAtk: 12,
      escalaHp: 9.0,
      escalaAtk: 2.1,
      xp: 45,
      ouro: 25,
      habilidade: "petrificar",
    },
    {
      nome: "Elemental de Fogo",
      minNivel: 4,
      baseHp: 48,
      baseAtk: 16,
      escalaHp: 8.5,
      escalaAtk: 2.3,
      xp: 40,
      ouro: 22,
      habilidade: "dano_extra",
    },
    {
      nome: "Cavaleiro Amaldiçoado",
      minNivel: 5,
      baseHp: 65,
      baseAtk: 15,
      escalaHp: 10.0,
      escalaAtk: 2.5,
      xp: 50,
      ouro: 30,
      habilidade: "bloquear_e_contra_atacar",
    },
    {
      nome: "Súcubo",
      minNivel: 5,
      baseHp: 60,
      baseAtk: 17,
      escalaHp: 9.5,
      escalaAtk: 2.7,
      xp: 60,
      ouro: 35,
      habilidade: { regeneracao: 5 },
    },
  ];

  // Filtra os inimigos de acordo com o nível mínimo
  const inimigosDisponiveis = templates.filter(
    (e) => jogador.nivel >= e.minNivel
  );

  // Se não houver inimigos disponíveis para o nível, retorna nulo ou um inimigo padrão
  if (inimigosDisponiveis.length === 0) {
    console.log("Nenhum inimigo disponível para o seu nível.");
    return null;
  }

  // Seleciona um inimigo aleatório da lista filtrada
  const t = inimigosDisponiveis[rand(0, inimigosDisponiveis.length - 1)];

  const hp = Math.round(
    t.baseHp + Math.floor(jogador.nivel * t.escalaHp) + rand(-5, 5)
  );
  const atk = Math.round(
    t.baseAtk + Math.floor(jogador.nivel * t.escalaAtk) + rand(-1, 2)
  );

  return {
    nome: t.nome,
    hp,
    atk,
    hpMax: hp,
    xp: t.xp,
    ouro: t.ouro,
    habilidade: t.habilidade,
    status: [],
    turno: 0,
  };
}

export function habilidadeInimigo(inimigo, jogador) {
  if (inimigo.habilidade) {
    if (inimigo.nome === "Goblin Ladrão" && rand(1, 100) <= 10) {
      // 10% de chance
      const ouroRoubado = rand(20, 50);
      if (jogador.ouro >= ouroRoubado) {
        jogador.ouro -= ouroRoubado;
        console.log(
          `\n💰 O Goblin Ladrão roubou ${ouroRoubado} de ouro e fugiu!`
        );
        return "fuga";
      } else {
        console.log(
          "\n❌ O Goblin Ladrão tentou roubar seu ouro, mas você não tinha o suficiente para ele fugir!"
        );
      }
    } else if (inimigo.habilidade === "esquiva" && rand(1, 100) <= 15) {
      // 15% de chance
      console.log(
        `\n💨 O Lobo das Sombras se moveu rapidamente e se esquivou do seu ataque!`
      );
      return "esquiva";
    } else if (inimigo.habilidade === "ataque_duplo" && rand(1, 100) <= 15) {
      // 15% de chance
      console.log(`\n⚔️ O Bandido Veterano está preparando um ataque duplo!`);
      return "ataque_duplo";
    } else if (inimigo.habilidade === "envenenamento" && rand(1, 100) <= 20) {
      console.log(
        `\n🤢 O Arauto do Pântano te envenenou! Você perderá vida a cada turno.`
      );
      jogador.status.push({
        tipo: "envenenamento",
        duracao: rand(3, 5),
        dano: 5,
      });
    } else if (inimigo.habilidade === "invulneravel" && rand(1, 100) <= 15) {
      console.log(
        `\n👻 O Espectro Errante se tornou etéreo! Seus ataques físicos não o afetam.`
      );
      return "invulneravel";
    } else if (
      inimigo.habilidade === "petrificar" &&
      inimigo.hp < inimigo.hpMax * 0.3 &&
      rand(1, 100) <= 20
    ) {
      console.log(
        `\n🗿 A Gárgula de Pedra se petrificou, reduzindo o dano que recebe!`
      );
      return "petrificar";
    } else if (inimigo.habilidade === "teia" && rand(1, 100) <= 25) {
      console.log(
        `\n🕸️ Você foi pego em uma teia! Não pode agir no próximo turno.`
      );
      return "teia";
    } else if (
      inimigo.habilidade === "dano_extra" &&
      jogador.hp < jogador.hpMax * 0.5
    ) {
      console.log(
        `\n🔥 O Elemental de Fogo está mais forte com sua vida baixa!`
      );
      return "dano_extra";
    } else if (
      inimigo.habilidade === "bloquear_e_contra_atacar" &&
      rand(1, 100) <= 25
    ) {
      console.log(
        `\n🛡️ O Cavaleiro Amaldiçoado se preparou para bloquear e contra-atacar!`
      );
      return "bloquear_e_contra_atacar";
    } else if (inimigo.habilidade === "regeneracao") {
      // Regeneração é automática
      const hpRegen = Math.floor(inimigo.hpMax * 0.05);
      inimigo.hp = Math.min(inimigo.hp + hpRegen, inimigo.hpMax);
      console.log(`\n💚 O Demônio Menor regenerou ${hpRegen} HP!`);
    }
  }
  return null;
}
