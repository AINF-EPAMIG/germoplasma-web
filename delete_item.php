<?php
header("Access-Control-Allow-Origin: https://epamig.tech");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

session_start();
require 'database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    echo json_encode(["success" => false, "message" => "ID do item não fornecido."]);
    exit;
}

$id = $data->id;

$stmt = $conn->prepare("DELETE FROM germoplasma_cafe WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Item removido com sucesso."]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao remover item."]);
}
?>
