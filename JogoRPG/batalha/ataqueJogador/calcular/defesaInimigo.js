// Localização: calcularDefesaFinal.js

export function calcularDefesaFinal(inimigo) {
  let defesaBase = Number(inimigo.def) || 0;
  let totalBuffDefesa = 0;

  inimigo.status.forEach((s) => {
    if (s.tipo === "defesa_extra") {
      const valorBuff = s.valor || 0;
      totalBuffDefesa += valorBuff;
    }
  });

  return Math.floor(defesaBase * (1 + totalBuffDefesa));
}
