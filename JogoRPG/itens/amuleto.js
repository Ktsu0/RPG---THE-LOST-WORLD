// --- Menu Amuleto ---
export function menuAmuleto() {
  console.log("\n🔮 Menu do Amuleto 🔮");
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
    console.log(`${item.nome} (${item.raridade}) [${item.qtd}/${item.max}]`);
  });

  console.log("\nBônus do Amuleto Supremo: +5% ATK e +10% VIDA");

  const opcao = prompt("[1] CRAFTAR | [2] SAIR: ");
  if (opcao === "1") {
    const possuiTodos = itensNecessarios.every((item) => item.qtd >= item.max);
    if (possuiTodos) {
      console.log("✅ Você criou o Amuleto Supremo!");

      gerenciarAmuleto();
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
      console.log("❌ Você não possui todos os itens necessários!");
    }
  }
}

// --- Gerenciar Amuleto ---
export function gerenciarAmuleto() {
  if (!jogador.inventario.includes("Amuleto Supremo")) {
    console.log("❌ Você ainda não possui o Amuleto Supremo.");
    return;
  }

  if (!jogador.amuletoEquipado) {
    console.log("✅ Você equipou o Amuleto Supremo! (+5% ATK e +10% VIDA)");

    // Armazena valores originais para reversão
    jogador.ataqueOriginal = jogador.ataque;
    jogador.hpMaxOriginal = jogador.hpMax;

    jogador.ataque = Math.floor(jogador.ataqueOriginal * 1.05);
    jogador.hpMax = Math.floor(jogador.hpMaxOriginal * 1.1);
    jogador.hp = jogador.hpMax; // Cura completa ao equipar
    jogador.amuletoEquipado = true;
  } else {
    console.log("Você removeu o Amuleto Supremo.");
    jogador.ataque = jogador.ataqueOriginal;
    jogador.hpMax = jogador.hpMaxOriginal;
    if (jogador.hp > jogador.hpMax) jogador.hp = jogador.hpMax;
    jogador.amuletoEquipado = false;
  }
}
