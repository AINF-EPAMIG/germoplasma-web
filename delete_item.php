<?php
header("Content-Type: application/json");
session_start();
require 'database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->ids) || !is_array($data->ids)) {
    echo json_encode(["success" => false, "message" => "IDs dos itens não fornecidos ou inválidos."]);
    exit;
}

$ids = implode(",", array_map("intval", $data->ids)); // Sanitiza os IDs
$query = "DELETE FROM germoplasma_cafe WHERE id IN ($ids)";

if ($conn->query($query)) {
    echo json_encode(["success" => true, "message" => "Itens removidos com sucesso."]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao remover itens."]);
}
?>
