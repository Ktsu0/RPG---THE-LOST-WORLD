class_name Grade
extends RefCounted

## Porte de engine/mundo/grade.js.

static func criar_grade_de_tracado(tracado: Array, legenda: Dictionary) -> Array:
	var grade: Array = []
	for y in tracado.size():
		var linha_str: String = tracado[y]
		var linha: Array = []
		for x in linha_str.length():
			var simbolo: String = linha_str[x]
			var definicao = legenda.get(simbolo)
			if definicao == null:
				push_error('Símbolo "%s" não está na legenda (linha %d, coluna %d).' % [simbolo, y, x])
				return []
			var celula: Dictionary = (definicao as Dictionary).duplicate(true)
			celula["x"] = x
			celula["y"] = y
			linha.append(celula)
		grade.append(linha)
	return grade

static func celula_em(grade: Array, x: int, y: int) -> Variant:
	if y < 0 or y >= grade.size():
		return null
	var linha: Array = grade[y]
	if x < 0 or x >= linha.size():
		return null
	return linha[x]

static func _vizinhos_caminhaveis(grade: Array, celula: Dictionary) -> Array:
	var candidatos := [
		celula_em(grade, celula["x"], celula["y"] - 1),
		celula_em(grade, celula["x"], celula["y"] + 1),
		celula_em(grade, celula["x"] + 1, celula["y"]),
		celula_em(grade, celula["x"] - 1, celula["y"]),
	]
	return candidatos.filter(func(c): return c != null and c["tipo"] != "parede")

static func _chave(celula: Dictionary) -> String:
	return "%d,%d" % [celula["x"], celula["y"]]

static func caminho_ate(grade: Array, origem: Dictionary, destino: Dictionary) -> Variant:
	if origem["x"] == destino["x"] and origem["y"] == destino["y"]:
		return []

	var anterior: Dictionary = {_chave(origem): null}
	var fila: Array = [origem]

	while fila.size() > 0:
		var atual: Dictionary = fila.pop_front()
		for vizinho in _vizinhos_caminhaveis(grade, atual):
			var k: String = _chave(vizinho)
			if anterior.has(k):
				continue
			anterior[k] = atual

			if vizinho["x"] == destino["x"] and vizinho["y"] == destino["y"]:
				var caminho: Array = [vizinho]
				var passo = atual
				while passo != null and not (passo["x"] == origem["x"] and passo["y"] == origem["y"]):
					caminho.push_front(passo)
					passo = anterior[_chave(passo)]
				return caminho
			fila.append(vizinho)
	return null

static func alcancavel(grade: Array, origem: Dictionary, destino: Dictionary) -> bool:
	return caminho_ate(grade, origem, destino) != null
