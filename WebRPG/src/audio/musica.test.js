import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { tocarMusica, pararMusica, definirVolumeMusica, obterVolumeMusica } from "./musica.js";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  pararMusica();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("obterVolumeMusica e definirVolumeMusica", () => {
  it("retorna 0.4 por padrão", () => {
    expect(obterVolumeMusica()).toBe(0.4);
  });

  it("persiste o volume definido", () => {
    definirVolumeMusica(0.1);
    expect(obterVolumeMusica()).toBe(0.1);
  });
});

describe("tocarMusica e pararMusica", () => {
  it("cria um Audio em loop com o caminho correto e chama play()", () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    const AudioMock = vi.fn(function (src) {
      this.src = src;
      this.loop = false;
      this.volume = 1;
      this.play = playMock;
      this.pause = pauseMock;
    });
    vi.stubGlobal("Audio", AudioMock);

    tocarMusica("cidade");

    expect(AudioMock).toHaveBeenCalledWith("/assets/audio/musica/cidade.mp3");
    expect(playMock).toHaveBeenCalledOnce();
  });

  it("pausa a música anterior ao trocar de faixa", () => {
    const pauseMock = vi.fn();
    vi.stubGlobal(
      "Audio",
      vi.fn(function () {
        this.play = () => Promise.resolve();
        this.pause = pauseMock;
      })
    );

    tocarMusica("cidade");
    tocarMusica("batalha");

    expect(pauseMock).toHaveBeenCalledOnce();
  });

  it("pararMusica pausa a faixa atual", () => {
    const pauseMock = vi.fn();
    vi.stubGlobal(
      "Audio",
      vi.fn(function () {
        this.play = () => Promise.resolve();
        this.pause = pauseMock;
      })
    );

    tocarMusica("cidade");
    pararMusica();

    expect(pauseMock).toHaveBeenCalledOnce();
  });
});
