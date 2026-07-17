extends GutTest

## Espelha engine/itens/pocao.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_contar_pocoes_soma_as_duas_contabilidades() -> void:
	var jogador := {
		"inventario": [{"nome": "Poção de Cura", "slot": "consumable"}, {"nome": "Espada Longa", "slot": "weapon"}],
		"itens": ["Poção de Cura", "Pena do Corvo Sombrio"],
	}
	assert_eq(Pocao.contar_pocoes(jogador), 2)

func test_contar_pocoes_retorna_0_quando_nao_ha_nenhuma() -> void:
	assert_eq(Pocao.contar_pocoes({"inventario": [], "itens": []}), 0)

func test_consumir_pocao_remove_primeiro_da_lista_itens() -> void:
	var jogador := {
		"inventario": [{"nome": "Poção de Cura", "slot": "consumable"}],
		"itens": ["Poção de Cura", "Pena do Corvo Sombrio"],
	}
	assert_true(Pocao.consumir_pocao(jogador))
	assert_eq(jogador["itens"], ["Pena do Corvo Sombrio"])
	assert_eq(jogador["inventario"].size(), 1)

func test_consumir_pocao_remove_do_inventario_quando_itens_nao_tem_pocao() -> void:
	var jogador := {
		"inventario": [{"nome": "Poção de Cura", "slot": "consumable"}],
		"itens": [],
	}
	assert_true(Pocao.consumir_pocao(jogador))
	assert_eq(jogador["inventario"], [])

func test_consumir_pocao_retorna_false_sem_mutar_nada() -> void:
	var jogador := {"inventario": [], "itens": []}
	assert_false(Pocao.consumir_pocao(jogador))

func test_usar_pocao_de_cura_entre_20_e_30_por_cento_capado_no_hpmax() -> void:
	Aleatorio.fonte = func() -> float: return 0.0 # rand(min,max) = min
	var jogador := {"hp": 50, "hpMax": 100, "inventario": [], "itens": ["Poção de Cura"]}
	assert_eq(Pocao.usar_pocao_de_cura(jogador), {"usou": true, "cura": 20}) # floor(100*0.20)
	assert_eq(jogador["hp"], 70)
	assert_eq(jogador["itens"], [])

func test_usar_pocao_de_cura_nao_deixa_o_hp_passar_do_hpmax() -> void:
	Aleatorio.fonte = func() -> float: return 0.999 # rand(min,max) = max
	var jogador := {"hp": 95, "hpMax": 100, "inventario": [], "itens": ["Poção de Cura"]}
	var resultado := Pocao.usar_pocao_de_cura(jogador)
	assert_true(resultado["usou"])
	assert_eq(jogador["hp"], 100)

func test_usar_pocao_de_cura_sem_pocoes() -> void:
	var jogador := {"hp": 50, "hpMax": 100, "inventario": [], "itens": []}
	assert_eq(Pocao.usar_pocao_de_cura(jogador), {"usou": false, "cura": 0})
	assert_eq(jogador["hp"], 50)
