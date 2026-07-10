import { describe, it, expect } from "vitest";
import { listarClasses, obterClasse } from "./classes.js";

describe("listarClasses", () => {
  it("retorna as 6 classes disponíveis, na ordem do console", () => {
    const classes = listarClasses();
    expect(classes).toHaveLength(6);
    expect(classes.map((c) => c.nome)).toEqual([
      "Arqueiro", "Paladino", "Assassino", "Bárbaro", "Necromante", "Xamã",
    ]);
  });
});

describe("obterClasse", () => {
  it("retorna o bônus do Arqueiro (esquiva + drop de ouro)", () => {
    const classe = obterClasse("Arqueiro");
    expect(classe.bonus).toEqual({
      habilidade: "esquiva", atk: 0, def: 0, dropOuro: 10, dropItem: 0,
      critChance: 0, esquiva: 10, bloqueioChance: 0,
    });
  });

  it("retorna o bônus de ataque do Bárbaro", () => {
    const classe = obterClasse("Bárbaro");
    expect(classe.bonus.atk).toBe(8);
    expect(classe.bonus.habilidade).toBe("furia");
  });

  it("retorna o bônus de esquiva do Xamã", () => {
    const classe = obterClasse("Xamã");
    expect(classe.bonus.esquiva).toBe(15);
    expect(classe.bonus.habilidade).toBe("cura");
  });

  it("lança erro para uma classe que não existe", () => {
    expect(() => obterClasse("Ferreiro")).toThrow('Classe "Ferreiro" não existe.');
  });
});
