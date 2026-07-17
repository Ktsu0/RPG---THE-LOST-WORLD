class_name Combate
extends RefCounted

## Porte de engine/combate/index.js — fachada pública do módulo de combate.

static func criar_estado_batalha(jogador: Dictionary, inimigo: Dictionary) -> Dictionary:
	if not jogador.has("status") or jogador["status"] == null:
		jogador["status"] = []
	var novo_inimigo: Dictionary = inimigo.duplicate()
	if inimigo.has("status") and inimigo["status"] != null:
		novo_inimigo["status"] = (inimigo["status"] as Array).duplicate()
	else:
		novo_inimigo["status"] = []
	return {"jogador": jogador, "inimigo": novo_inimigo, "rodada": 0}

static func executar_acao_jogador(estado: Dictionary, acao: String) -> Dictionary:
	return Turno.executar_rodada(estado, acao)
