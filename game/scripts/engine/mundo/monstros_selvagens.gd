class_name MonstrosSelvagens
extends RefCounted

## Porte de engine/mundo/monstrosSelvagens.js.
## Cada espécie usa o mesmo sprite já mapeado no bestiário do jogo — id aqui é
## só a chave de vínculo, não um asset.

const LISTA: Array[Dictionary] = [
	{"id": "goblin", "nome": "Goblin Selvagem", "hp": 18, "atk": 6, "defesa": 2, "xp": 8, "ouro": 6},
	{"id": "orc", "nome": "Orc Selvagem", "hp": 28, "atk": 9, "defesa": 4, "xp": 14, "ouro": 10},
	{"id": "esqueleto", "nome": "Esqueleto Solto", "hp": 22, "atk": 7, "defesa": 3, "xp": 10, "ouro": 8},
	{"id": "lobo", "nome": "Lobo Selvagem", "hp": 20, "atk": 8, "defesa": 2, "xp": 11, "ouro": 7},
	{"id": "cogumelo", "nome": "Cogumelo Venenoso", "hp": 24, "atk": 5, "defesa": 6, "xp": 9, "ouro": 5},
	{"id": "elemental-fogo", "nome": "Elemental de Fogo Selvagem", "hp": 26, "atk": 10, "defesa": 3, "xp": 15, "ouro": 9},
	{"id": "golem-pedra", "nome": "Golem de Pedra Selvagem", "hp": 35, "atk": 6, "defesa": 10, "xp": 16, "ouro": 11},
	{"id": "olho-voador", "nome": "Olho Voador Selvagem", "hp": 16, "atk": 8, "defesa": 1, "xp": 12, "ouro": 8},
]

static func listar_especies_selvagens() -> Array[Dictionary]:
	return LISTA

static func obter_especie_selvagem(id: String) -> Variant:
	for especie in LISTA:
		if especie["id"] == id:
			return especie
	push_error('Espécie selvagem "%s" não existe.' % id)
	return null

static func criar_inimigo_selvagem(id: String, nivel_jogador: int = 1) -> Variant:
	var especie = obter_especie_selvagem(id)
	if especie == null:
		return null
	var escala: float = 1 + maxi(0, nivel_jogador - 1) * 0.12 + Aleatorio.rand(0, 10) / 100.0

	return {
		"nome": especie["nome"],
		"hp": roundi(especie["hp"] * escala),
		"hpMax": roundi(especie["hp"] * escala),
		"atk": roundi(especie["atk"] * escala),
		"defesa": roundi(especie["defesa"] * escala),
		"xp": roundi(especie["xp"] * escala),
		"ouro": roundi(especie["ouro"] * escala),
		"habilidade": null,
		"status": [],
	}
