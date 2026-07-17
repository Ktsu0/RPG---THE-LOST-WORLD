class_name InimigoDaSala
extends RefCounted

## Porte de engine/masmorra/inimigoDaSala.js.

const STATS_BASE_POR_TIPO := {
	"monstro": {"hp": 22, "atk": 7},
	"miniboss": {"hp": 45, "atk": 12},
	"boss": {"hp": 80, "atk": 18},
}

static func criar_inimigo_da_sala(celula: Dictionary, jogador: Dictionary) -> Variant:
	var base = STATS_BASE_POR_TIPO.get(celula["roomType"])
	if base == null:
		push_error('Tipo de sala "%s" não tem um encontro.' % celula["roomType"])
		return null

	var dificuldade: int = MasmorraGerador.determinar_dificuldade(jogador["nivel"])
	var poder: float = celula["content"].get("poder", 1.0)

	return {
		"nome": celula["content"]["nome"],
		"hp": roundi(base["hp"] * dificuldade * poder),
		"hpMax": roundi(base["hp"] * dificuldade * poder),
		"atk": roundi(base["atk"] * dificuldade * poder),
		"defesa": roundi(3 * dificuldade),
		"xp": roundi(15 * dificuldade * poder),
		"ouro": roundi(10 * dificuldade * poder),
		"habilidade": null,
		"status": [],
	}
