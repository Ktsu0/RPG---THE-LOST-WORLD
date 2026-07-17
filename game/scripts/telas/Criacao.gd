extends Control

## Placeholder da Fase 0 — o wizard de criação de personagem de verdade
## (raça → classe → nome, preview animado) é construído na Fase 3.

@onready var botao_voltar: Button = %BotaoVoltar

func _ready() -> void:
	botao_voltar.pressed.connect(_ao_pressionar_voltar)

func _ao_pressionar_voltar() -> void:
	get_tree().change_scene_to_file("res://scenes/titulo/Titulo.tscn")
