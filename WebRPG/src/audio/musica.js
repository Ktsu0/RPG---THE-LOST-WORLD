const CHAVE_VOLUME_MUSICA = "webrpg_volume_musica";
const VOLUME_PADRAO = 0.4;

let faixaAtual = null;

export function obterVolumeMusica() {
  const salvo = localStorage.getItem(CHAVE_VOLUME_MUSICA);
  return salvo === null ? VOLUME_PADRAO : Number(salvo);
}

export function definirVolumeMusica(valor) {
  localStorage.setItem(CHAVE_VOLUME_MUSICA, String(valor));
  if (faixaAtual) faixaAtual.volume = valor;
}

export function tocarMusica(nome) {
  if (faixaAtual) faixaAtual.pause();
  faixaAtual = new Audio(`/assets/audio/musica/${nome}.mp3`);
  faixaAtual.loop = true;
  faixaAtual.volume = obterVolumeMusica();
  faixaAtual.play().catch(() => {});
}

export function pararMusica() {
  if (faixaAtual) {
    faixaAtual.pause();
    faixaAtual = null;
  }
}
