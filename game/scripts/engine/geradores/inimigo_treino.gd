class_name InimigoTreino
extends RefCounted

## Porte de engine/geradores/inimigoTreino.js.

static func criar_inimigo_treino() -> Dictionary:
	return {
		"nome": "Orc", "atk": 9, "defesa": 3, "hp": 40, "hpMax": 40,
		"xp": 18, "ouro": 15, "habilidade": "envenenamento", "status": [],
	}
