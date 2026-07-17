class_name Recompensas
extends RefCounted

## Porte de engine/combate/recompensas.js.
## Drop de item ao vencer batalha é Fase 5 do GodotRPG (não existia em engine/) — não expandir aqui.

static func conceder_recompensa_vitoria(jogador: Dictionary, inimigo: Dictionary) -> Dictionary:
	var xp_ganho: int = inimigo.get("xp", 0) if inimigo.get("xp", 0) else floori(inimigo["hpMax"] / 5.0 + inimigo["atk"] * 2)
	var ouro_ganho: int = inimigo.get("ouro", 0) if inimigo.get("ouro", 0) else Aleatorio.rand(50, 100)
	jogador["xp"] += xp_ganho
	jogador["ouro"] += ouro_ganho
	return {"xpGanho": xp_ganho, "ouroGanho": ouro_ganho}
