class_name Loja
extends RefCounted

## Porte de engine/loja/index.js.

const PERCENTUAL_VENDA := 0.3

static func comprar_item(jogador: Dictionary, item: Dictionary) -> bool:
	if jogador["ouro"] < item["preco"]:
		return false
	jogador["ouro"] -= item["preco"]
	jogador["inventario"].append(item)
	return true

static func itens_vendiveis(inventario: Array) -> Array:
	return inventario.filter(func(item): return item["slot"] != "consumable")

static func vender_itens(jogador: Dictionary, indices_selecionados: Array) -> Dictionary:
	var indices_ordenados: Array = indices_selecionados.duplicate()
	indices_ordenados.sort()
	indices_ordenados.reverse()
	var total_recebido := 0
	for indice in indices_ordenados:
		var item: Dictionary = jogador["inventario"][indice]
		total_recebido += floori(item["preco"] * PERCENTUAL_VENDA)
		jogador["inventario"].remove_at(indice)
	jogador["ouro"] += total_recebido
	return {"totalRecebido": total_recebido}
