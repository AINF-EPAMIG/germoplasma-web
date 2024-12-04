<?php
header("Access-Control-Allow-Origin: https://epamig.tech");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
session_start();
require 'database.php';

// Verifica se o usuário está autenticado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado."]);
    exit;
}

// Verifica se a requisição é do tipo DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "message" => "Método HTTP inválido. Apenas DELETE é permitido."]);
    exit;
}

// Lê e decodifica os dados enviados no corpo da requisição
$data = json_decode(file_get_contents("php://input"));

// Verifica se os IDs foram fornecidos e são válidos
if (!isset($data->ids) || !is_array($data->ids)) {
    echo json_encode(["success" => false, "message" => "IDs dos itens não fornecidos ou inválidos."]);
    exit;
}

// Sanitiza os IDs para prevenir injeção SQL
$ids = implode(",", array_map("intval", $data->ids));

// Prepara a consulta de exclusão
$query = "DELETE FROM germoplasma_cafe WHERE id IN ($ids)";

// Executa a consulta e retorna o resultado
if ($conn->query($query)) {
    echo json_encode(["success" => true, "message" => "Itens removidos com sucesso."]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao remover itens."]);
}
?>
