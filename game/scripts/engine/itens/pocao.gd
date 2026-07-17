class_name Pocao
extends RefCounted

## Porte de engine/itens/pocao.js.
##
## A loja guarda a poção como objeto em jogador.inventario (fiel ao console);
## as missões premiam com a string "Poção de Cura" em jogador.itens. Esta API
## é a única porta de entrada para contar/consumir poções e enxerga as duas
## contabilidades — de propósito, mesma decisão do JS original.

const NOME_POCAO := "Poção de Cura"

static func contar_pocoes(jogador: Dictionary) -> int:
	var no_inventario := 0
	for item in jogador.get("inventario", []):
		if typeof(item) == TYPE_DICTIONARY and item.get("nome") == NOME_POCAO:
			no_inventario += 1
	var em_itens := 0
	for item in jogador.get("itens", []):
		if item == NOME_POCAO:
			em_itens += 1
	return no_inventario + em_itens

static func consumir_pocao(jogador: Dictionary) -> bool:
	var itens: Array = jogador.get("itens", [])
	var indice_em_itens: int = itens.find(NOME_POCAO)
	if indice_em_itens != -1:
		itens.remove_at(indice_em_itens)
		return true

	var inventario: Array = jogador.get("inventario", [])
	var indice_no_inventario := -1
	for i in inventario.size():
		var item = inventario[i]
		if typeof(item) == TYPE_DICTIONARY and item.get("nome") == NOME_POCAO:
			indice_no_inventario = i
			break
	if indice_no_inventario != -1:
		inventario.remove_at(indice_no_inventario)
		return true

	return false

static func usar_pocao_de_cura(jogador: Dictionary) -> Dictionary:
	if not consumir_pocao(jogador):
		return {"usou": false, "cura": 0}
	var cura_min: int = floori(jogador["hpMax"] * 0.2)
	var cura_max: int = floori(jogador["hpMax"] * 0.3)
	var cura: int = Aleatorio.rand(cura_min, cura_max)
	jogador["hp"] = mini(jogador["hpMax"], jogador["hp"] + cura)
	return {"usou": true, "cura": cura}
