class_name Raridade
extends RefCounted

## Porte de engine/itens/raridade.js.

static func obter_classe_raridade(raridade: Variant) -> String:
	match raridade:
		"comum": return "raridade--comum"
		"raro": return "raridade--raro"
		"lendario": return "raridade--lendario"
		_: return "raridade--padrao"
