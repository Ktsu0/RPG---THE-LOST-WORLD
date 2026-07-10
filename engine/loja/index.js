const PERCENTUAL_VENDA = 0.3;

export function comprarItem(jogador, item) {
  if (jogador.ouro < item.preco) return false;
  jogador.ouro -= item.preco;
  jogador.inventario.push(item);
  return true;
}

export function itensVendiveis(inventario) {
  return inventario.filter((item) => item.slot !== "consumable");
}

export function venderItens(jogador, indicesSelecionados) {
  const indicesOrdenados = [...indicesSelecionados].sort((a, b) => b - a);
  let totalRecebido = 0;
  for (const indice of indicesOrdenados) {
    const item = jogador.inventario[indice];
    totalRecebido += Math.floor(item.preco * PERCENTUAL_VENDA);
    jogador.inventario.splice(indice, 1);
  }
  jogador.ouro += totalRecebido;
  return { totalRecebido };
}
