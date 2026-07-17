class_name TorreBosses
extends RefCounted

## Porte de engine/torre/bosses.js.
## Os 10 bosses aqui já são confirmados idênticos aos da lista mestra de
## conteúdo (seção 5.2) — mesma fonte que os bosses da Torre/Castelo.

const NIVEL_CAP_TORRE := 5

static var LISTA: Array[Dictionary] = [
	{"nome": "Guardião de Pedra", "hpBase": 210, "atkBase": 22, "defBase": 14, "xpBase": 70, "ouroBase": 50, "habilidades": {"blockChance": 25}},
	{"nome": "Sentinela de Ferro", "hpBase": 240, "atkBase": 25, "defBase": 18, "xpBase": 90, "ouroBase": 60, "habilidades": {"defBoostEveryTurns": {"every": 2, "amount": 6}}},
	{"nome": "Mago Sombrio", "hpBase": 270, "atkBase": 27, "defBase": 16, "xpBase": 110, "ouroBase": 70, "habilidades": {"invisivelChance": 30}},
	{"nome": "Lobo Alfa", "hpBase": 290, "atkBase": 29, "defBase": 18, "xpBase": 130, "ouroBase": 80, "habilidades": {"critChanceBonus": 30}},
	{"nome": "Cavaleiro Sombrio", "hpBase": 320, "atkBase": 32, "defBase": 21, "xpBase": 150, "ouroBase": 90, "habilidades": {"blockChance": 20, "critChanceBonus": 15}},
	{"nome": "Hidra das Sombras", "hpBase": 340, "atkBase": 35, "defBase": 22, "xpBase": 170, "ouroBase": 100, "habilidades": {"petrificarChance": 15, "petrificarTurns": 2}},
	{"nome": "Golem Titânico", "hpBase": 370, "atkBase": 37, "defBase": 26, "xpBase": 190, "ouroBase": 110, "habilidades": {"defIncreasePerTurn": 3, "breakEquipChance": 8}},
	{"nome": "Senhor dos Mortos", "hpBase": 390, "atkBase": 39, "defBase": 26, "xpBase": 210, "ouroBase": 120, "habilidades": {"summonSkeletonsEveryTurns": 1, "summonedSkeletonHp": 15, "summonedSkeletonDmgBase": 5}},
	{"nome": "Dragão Negro", "hpBase": 440, "atkBase": 45, "defBase": 31, "xpBase": 240, "ouroBase": 140, "habilidades": {"highDef": true, "dragonBreathChance": 20}},
	{"nome": "Lorde do Caos", "hpBase": 490, "atkBase": 52, "defBase": 36, "xpBase": 320, "ouroBase": 220, "habilidades": {"canSummonMiniBoss": true, "summonMiniBossChance": 12, "onDeathResurrect": true}},
]

static func criar_boss_torre(indice: int, jogador: Dictionary) -> Dictionary:
	var base: Dictionary = LISTA[indice]
	var nivel_calculo: int = mini(jogador["nivel"], NIVEL_CAP_TORRE)

	var hp: int = base["hpBase"] + floori(nivel_calculo * 7) + Aleatorio.rand(-10, 10)
	var atk: int = base["atkBase"] + floori(nivel_calculo * 2.2) + Aleatorio.rand(0, 4)
	var defesa: int = base["defBase"] + floori(nivel_calculo * 1.5) + Aleatorio.rand(0, 2)

	return {
		"nome": base["nome"],
		"hp": hp, "hpMax": hp,
		"atk": atk, "defesa": defesa,
		"xp": base["xpBase"], "ouro": base["ouroBase"],
		"habilidades": base["habilidades"],
		"estado": {"turnoContador": 0, "invisivel": false, "petrificadoTurns": 0, "esqueletosInvocados": [], "jaRessuscitou": false},
	}
