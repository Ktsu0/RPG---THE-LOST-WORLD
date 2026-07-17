class_name Experiencia
extends RefCounted

## Porte de engine/personagem/experiencia.js.

const LEVELING_CONFIG := {
	"baseXp": 50,
	"exponent": 1.4,
	"statsGain": {"hp": 15, "atk": 2, "def": 1},
}

static func xp_para_proximo_nivel(jogador: Dictionary) -> int:
	return floori(LEVELING_CONFIG["baseXp"] * pow(jogador["nivel"], LEVELING_CONFIG["exponent"]))

static func checar_level_up(jogador: Dictionary) -> Array[Dictionary]:
	var eventos: Array[Dictionary] = []
	while jogador["xp"] >= xp_para_proximo_nivel(jogador):
		jogador["xp"] -= xp_para_proximo_nivel(jogador)
		jogador["nivel"] += 1
		jogador["hpMax"] += LEVELING_CONFIG["statsGain"]["hp"]
		jogador["ataque"] += LEVELING_CONFIG["statsGain"]["atk"]
		jogador["defesa"] += LEVELING_CONFIG["statsGain"]["def"]
		jogador["hp"] = jogador["hpMax"]
		eventos.append({"tipo": "level_up", "nivel": jogador["nivel"], "hpMax": jogador["hpMax"]})
	return eventos
