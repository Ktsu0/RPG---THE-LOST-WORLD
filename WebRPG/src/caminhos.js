// Prefixa o base do Vite (ex. "/RPG---THE-LOST-WORLD/" no GitHub Pages, "/" no dev)
// em caminhos de asset montados dinamicamente em JS — CSS é reescrito pelo próprio
// Vite no build, mas template strings em JS não são.
export function caminhoAsset(caminhoRelativo) {
  return `${import.meta.env.BASE_URL}${caminhoRelativo}`;
}
