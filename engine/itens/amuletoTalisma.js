export const REQUISITOS_AMULETO = [
  { nome: "Pena do Corvo Sombrio", quantidade: 5 },
  { nome: "Pergaminho Arcano", quantidade: 5 },
  { nome: "Essência da Noite", quantidade: 2 },
  { nome: "Relíquia Brilhante", quantidade: 2 },
  { nome: "Gema da Escuridão", quantidade: 1 },
];

export function podeCraftarAmuleto(inventario) {
  return REQUISITOS_AMULETO.every(
    (req) => inventario.filter((item) => item === req.nome).length >= req.quantidade
  );
}

export function craftarAmuleto(jogador) {
  for (const req of REQUISITOS_AMULETO) {
    let restante = req.quantidade;
    jogador.inventario = jogador.inventario.filter((item) => {
      if (item === req.nome && restante > 0) {
        restante--;
        return false;
      }
      return true;
    });
  }
  jogador.amuletoCraftado = true;
}

export function alternarAmuleto(jogador) {
  if (!jogador.amuletoEquipado) {
    jogador._ataqueAntesDoAmuleto = jogador.ataque;
    jogador._hpMaxAntesDoAmuleto = jogador.hpMax;
    jogador.ataque = Math.floor(jogador.ataque * 1.05);
    jogador.hpMax = Math.floor(jogador.hpMax * 1.1);
    jogador.hp = jogador.hpMax;
    jogador.amuletoEquipado = true;
  } else {
    jogador.ataque = jogador._ataqueAntesDoAmuleto;
    jogador.hpMax = jogador._hpMaxAntesDoAmuleto;
    jogador.hp = Math.min(jogador.hp, jogador.hpMax);
    jogador.amuletoEquipado = false;
  }
}

export const PRECO_TALISMA = { fragmentos: 10, ouro: 2000 };

export function podeCraftarTalisma(jogador) {
  const fragmentos = jogador.inventario.filter((item) => item === "Fragmento Antigo").length;
  return fragmentos >= PRECO_TALISMA.fragmentos && jogador.ouro >= PRECO_TALISMA.ouro;
}

export function craftarTalisma(jogador) {
  let restante = PRECO_TALISMA.fragmentos;
  jogador.inventario = jogador.inventario.filter((item) => {
    if (item === "Fragmento Antigo" && restante > 0) {
      restante--;
      return false;
    }
    return true;
  });
  jogador.ouro -= PRECO_TALISMA.ouro;
  jogador.inventario.push("Talismã da Torre");
}
