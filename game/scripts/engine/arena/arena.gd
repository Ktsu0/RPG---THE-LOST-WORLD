class_name Arena
extends RefCounted

## Porte de engine/arena/index.js.

const NIVEL_MINIMO_ARENA := 5

static func pode_acessar_arena(jogador: Dictionary) -> bool:
	return jogador["nivel"] >= NIVEL_MINIMO_ARENA

static func calcular_dificuldade_onda(onda: int) -> int:
	return mini(10, floori(1 + onda / 3.0))

static func calcular_quantidade_inimigos(onda: int) -> int:
	if onda <= 3:
		return 1
	if onda <= 7:
		return 2
	if onda <= 12:
		return 3
	return mini(5, floori(onda / 4.0))

static func is_onda_mini_boss(onda: int) -> bool:
	return onda % 5 == 0

static func calcular_pontos(onda: int, is_mini_boss: bool) -> int:
	var base: int = 50 if is_mini_boss else 10
	return roundi(base * (1 + onda * 0.1))

static func calcular_chance_fragmento(onda: int, is_mini_boss: bool) -> float:
	if is_mini_boss:
		return minf(70, 20 + onda * 1.5)
	return minf(25, 5 + onda * 0.3)

static func criar_estado_arena() -> Dictionary:
	return {"onda": 1, "pontos": 0, "fragmentosConfirmados": 0, "fragmentosNaoConfirmados": 0, "bonusTemporarios": {"hpBonus": 0, "atkBonus": 0}}

static func confirmar_checkpoint(estado_arena: Dictionary) -> Dictionary:
	var novo_estado: Dictionary = estado_arena.duplicate()
	novo_estado["fragmentosConfirmados"] = estado_arena["fragmentosConfirmados"] + estado_arena["fragmentosNaoConfirmados"]
	novo_estado["fragmentosNaoConfirmados"] = 0
	return novo_estado

static func aplicar_bencao_vitalidade(jogador: Dictionary, estado_arena: Dictionary) -> void:
	var bonus: int = floori(jogador["hpMax"] * 0.15)
	jogador["hpMax"] += bonus
	estado_arena["bonusTemporarios"]["hpBonus"] += bonus

static func aplicar_bencao_poder(jogador: Dictionary, estado_arena: Dictionary) -> void:
	var bonus: int = floori(jogador["ataque"] * 0.1)
	jogador["ataque"] += bonus
	estado_arena["bonusTemporarios"]["atkBonus"] += bonus

static func remover_bonus_arena(jogador: Dictionary, estado_arena: Dictionary) -> void:
	jogador["hpMax"] -= estado_arena["bonusTemporarios"]["hpBonus"]
	jogador["ataque"] -= estado_arena["bonusTemporarios"]["atkBonus"]
	estado_arena["bonusTemporarios"]["hpBonus"] = 0
	estado_arena["bonusTemporarios"]["atkBonus"] = 0
