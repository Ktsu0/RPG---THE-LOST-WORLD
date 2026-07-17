class_name Racas
extends RefCounted

## Porte de engine/personagem/racas.js.
##
## Erros ("throw new Error" no JS) viram push_error + retorno null — padrão
## usado em todo o porte para funções de busca/validação. Testado com
## assert_push_error() do GUT.

const LISTA: Array[Dictionary] = [
	{"nome": "Anão", "descricao": "+15 DEF, -3 ATK", "bonus": {"hp": 0, "atk": -3, "def": 15, "critChance": 0}, "restricoes": {}},
	{"nome": "Elfo", "descricao": "+20 HP, -2 ATK", "bonus": {"hp": 20, "atk": -2, "def": 0, "critChance": 0}, "restricoes": {}},
	{"nome": "Humano", "descricao": "Balanceado", "bonus": {"hp": 0, "atk": 0, "def": 0, "critChance": 0}, "restricoes": {}},
	{"nome": "Morto-vivo", "descricao": "+5 ATK, -10 HP", "bonus": {"hp": -10, "atk": 5, "def": 0, "critChance": 0}, "restricoes": {}},
	{"nome": "Orc", "descricao": "+8 ATK, -5 DEF", "bonus": {"hp": 0, "atk": 8, "def": -5, "critChance": 0}, "restricoes": {}},
	{"nome": "Bestial", "descricao": "+10% Crítico, -7 HP", "bonus": {"hp": -7, "atk": 0, "def": 0, "critChance": 10}, "restricoes": {}},
	{"nome": "Dragonoide", "descricao": "+15 HP, +5 ATK, não pode usar armaduras", "bonus": {"hp": 15, "atk": 5, "def": 0, "critChance": 0}, "restricoes": {"semArmadura": true}},
]

static func listar_racas() -> Array[Dictionary]:
	return LISTA

static func obter_raca(nome: String) -> Variant:
	for raca in LISTA:
		if raca["nome"] == nome:
			return raca
	push_error('Raça "%s" não existe.' % nome)
	return null
