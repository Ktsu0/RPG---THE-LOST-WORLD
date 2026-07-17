class_name MasmorraSessao
extends RefCounted

## Porte de engine/masmorra/index.js.

const DELTAS := {
	"norte": {"dx": 0, "dy": -1},
	"sul": {"dx": 0, "dy": 1},
	"leste": {"dx": 1, "dy": 0},
	"oeste": {"dx": -1, "dy": 0},
}

static func criar_sessao_masmorra(jogador: Dictionary, template_id: String, options: Dictionary = {}) -> Dictionary:
	var dungeon: Dictionary = MasmorraGerador.gerar_masmorra(jogador, template_id, options)
	return {"dungeon": dungeon, "posicao": dungeon["entrance"].duplicate(), "jogador": jogador}

static func mover(sessao: Dictionary, direcao: String) -> Dictionary:
	var delta: Dictionary = DELTAS[direcao]
	var novo_x: int = sessao["posicao"]["x"] + delta["dx"]
	var novo_y: int = sessao["posicao"]["y"] + delta["dy"]

	var dungeon: Dictionary = sessao["dungeon"]
	if novo_x < 0 or novo_y < 0 or novo_x >= dungeon["size"] or novo_y >= dungeon["size"]:
		var celula_atual: Dictionary = dungeon["grid"][sessao["posicao"]["y"]][sessao["posicao"]["x"]]
		return {"sessao": sessao, "celula": celula_atual, "saiuDosLimites": true}

	var celula: Dictionary = dungeon["grid"][novo_y][novo_x]
	celula["visited"] = true
	var nova_sessao: Dictionary = sessao.duplicate()
	nova_sessao["posicao"] = {"x": novo_x, "y": novo_y}
	return {"sessao": nova_sessao, "celula": celula, "saiuDosLimites": false}

static func limpar_sala(sessao: Dictionary) -> void:
	var celula: Dictionary = sessao["dungeon"]["grid"][sessao["posicao"]["y"]][sessao["posicao"]["x"]]
	celula["roomType"] = "vazio"
	celula["content"] = null

static func tentar_sair_masmorra(sessao: Dictionary) -> Dictionary:
	var entrance: Dictionary = sessao["dungeon"]["entrance"]
	var na_entrada: bool = sessao["posicao"]["x"] == entrance["x"] and sessao["posicao"]["y"] == entrance["y"]
	if na_entrada:
		return {"saiu": true, "penalidade": null}

	if Aleatorio.rand(1, 100) <= 40:
		return {"saiu": true, "penalidade": "pocao"}
	if Aleatorio.rand(1, 100) <= 15:
		return {"saiu": true, "penalidade": "armadura"}
	if Aleatorio.rand(1, 100) <= 10:
		return {"saiu": true, "penalidade": "arma"}
	if Aleatorio.rand(1, 100) <= 30:
		return {"saiu": true, "penalidade": "ouro"}
	return {"saiu": true, "penalidade": null}
