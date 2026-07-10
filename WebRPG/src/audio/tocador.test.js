import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { tocarEfeito, definirVolumeEfeitos, obterVolumeEfeitos } from "./tocador.js";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("obterVolumeEfeitos e definirVolumeEfeitos", () => {
  it("retorna 0.6 por padrão", () => {
    expect(obterVolumeEfeitos()).toBe(0.6);
  });

  it("persiste o volume definido", () => {
    definirVolumeEfeitos(0.2);
    expect(obterVolumeEfeitos()).toBe(0.2);
  });
});

describe("tocarEfeito", () => {
  it("cria um Audio com o caminho e volume corretos, e chama play()", () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const AudioMock = vi.fn(function (src) {
      this.src = src;
      this.volume = 1;
      this.play = playMock;
    });
    vi.stubGlobal("Audio", AudioMock);
    definirVolumeEfeitos(0.5);

    tocarEfeito("golpe");

    expect(AudioMock).toHaveBeenCalledWith("/assets/audio/efeitos/golpe.mp3");
    expect(playMock).toHaveBeenCalledOnce();
  });

  it("não lança erro quando play() rejeita (arquivo de áudio ainda não existe)", () => {
    vi.stubGlobal(
      "Audio",
      vi.fn(function () {
        this.play = () => Promise.reject(new Error("404"));
      })
    );
    expect(() => tocarEfeito("critico")).not.toThrow();
  });
});
