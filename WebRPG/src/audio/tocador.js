const CHAVE_VOLUME_EFEITOS = "webrpg_volume_efeitos";
const VOLUME_PADRAO = 0.6;

export function obterVolumeEfeitos() {
  const salvo = localStorage.getItem(CHAVE_VOLUME_EFEITOS);
  return salvo === null ? VOLUME_PADRAO : Number(salvo);
}

export function definirVolumeEfeitos(valor) {
  localStorage.setItem(CHAVE_VOLUME_EFEITOS, String(valor));
}

export function tocarEfeito(nome) {
  const audio = new Audio(`/assets/audio/efeitos/${nome}.mp3`);
  audio.volume = obterVolumeEfeitos();
  audio.play()?.catch?.(() => {});
}
