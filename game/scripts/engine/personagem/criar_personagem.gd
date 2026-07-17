class_name CriarPersonagem
extends RefCounted

## Porte de engine/personagem/criarPersonagem.js.

static func validar_nome(nome: Variant) -> bool:
	return typeof(nome) == TYPE_STRING and nome.strip_edges().length() > 0

static func calcular_atributos_iniciais(raca_nome: String, classe_nome: String) -> Variant:
	var raca = Racas.obter_raca(raca_nome)
	var classe = Classes.obter_classe(classe_nome)
	if raca == null or classe == null:
		return null
	var bonus_raca: Dictionary = raca["bonus"]
	var bonus_classe: Dictionary = classe["bonus"]
	return {
		"hp": 100 + bonus_raca["hp"],
		"hpMax": 100 + bonus_raca["hp"],
		"ataque": 5 + bonus_raca["atk"] + bonus_classe["atk"],
		"defesa": 5 + bonus_raca["def"] + bonus_classe["def"],
	}

static func criar_personagem(dados: Dictionary) -> Variant:
	var nome = dados.get("nome")
	if not validar_nome(nome):
		push_error("Nome do personagem não pode ser vazio.")
		return null

	var raca_nome: String = dados["racaNome"]
	var classe_nome: String = dados["classeNome"]

	var raca = Racas.obter_raca(raca_nome)
	if raca == null:
		return null
	var classe = Classes.obter_classe(classe_nome)
	if classe == null:
		return null

	var atributos: Dictionary = calcular_atributos_iniciais(raca_nome, classe_nome)

	return {
		"nome": nome.strip_edges(),
		"raca": raca["nome"],
		"classe": classe["nome"],
		"habilidadeClasse": classe["bonus"]["habilidade"],
		"bonusClasse": classe["bonus"],
		"hp": atributos["hp"],
		"hpMax": atributos["hpMax"],
		"nivel": 1,
		"xp": 0,
		"ouro": 50,
		"ataque": atributos["ataque"],
		"defesa": atributos["defesa"],
		"bonusRaca": raca["bonus"],
		"restricoes": raca["restricoes"],
		"equipamentos": {"head": null, "chest": null, "hands": null, "legs": null, "feet": null},
		"itens": [],
		"inventario": [],
		"armas": [],
		"armaEquipada": null,
		"amuletoEquipado": false,
		"amuletoCraftado": false,
		"status": [],
		"ativarHistoria": true,
	}
