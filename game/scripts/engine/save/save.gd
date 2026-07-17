class_name Save
extends RefCounted

## Porte de engine/save/index.js.
## Leitura/escrita real em user://save.json (via FileAccess) é código novo,
## não portado — fica pra Fase 3. Aqui só a forma/versão pura do save.

const VERSAO_SAVE := 1

static func criar_save(jogador: Dictionary) -> Dictionary:
	return {"versao": VERSAO_SAVE, "jogador": jogador}

static func serializar_save(jogador: Dictionary) -> String:
	return JSON.stringify(criar_save(jogador))

static func desserializar_save(texto: String) -> Dictionary:
	# JSON.new().parse() em vez do JSON.parse_string() estático: o estático
	# empurra um push_error de engine para JSON malformado (visível no console,
	# some com GUT tratando warning como erro); a instância devolve só um
	# Error code, deixando o tratamento silencioso equivalente ao try/catch do JS.
	var json := JSON.new()
	if json.parse(texto) != OK:
		return {"valido": false, "jogador": null, "erro": "Save corrompido (JSON inválido)."}
	var dados = json.data

	if typeof(dados) != TYPE_DICTIONARY or not dados.get("jogador") or typeof(dados["jogador"]) != TYPE_DICTIONARY:
		return {"valido": false, "jogador": null, "erro": "Formato de save inválido."}

	# O parser JSON do Godot sempre devolve números como float (99 vira 99.0),
	# diferente do JSON.parse do JS — int() aqui evita "recebido 99.0" na mensagem.
	if int(dados.get("versao", -1)) != VERSAO_SAVE:
		return {
			"valido": false, "jogador": null,
			"erro": "Versão de save incompatível (esperado %d, recebido %d)." % [VERSAO_SAVE, int(dados.get("versao", -1))],
		}

	return {"valido": true, "jogador": dados["jogador"], "erro": null}
