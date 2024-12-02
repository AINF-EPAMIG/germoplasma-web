<?php
header("Access-Control-Allow-Origin: https://epamig.tech");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

session_start();
require 'database.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado."]);
    exit;
}

$numero_acesso = $data->numero_acesso ?? '';
$designacao_material = $data->designacao_material ?? '';
$local_coleta = $data->local_coleta ?? '';
$proprietario = $data->proprietario ?? '';
$municipio_estado = $data->municipio_estado ?? '';
$idade_lavoura = $data->idade_lavoura ?? '';
$data_coleta = $data->data_coleta ?? '';
$coletor = $data->coletor ?? '';

if (!$numero_acesso || !$designacao_material || !$local_coleta || !$proprietario || !$municipio_estado || !$idade_lavoura || !$data_coleta || !$coletor) {
    echo json_encode(["success" => false, "message" => "Todos os campos são obrigatórios."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO germoplasma_cafe (numero_acesso, designacao_material, local_coleta, proprietario, municipio_estado, idade_lavoura, data_coleta, coletor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssss", $numero_acesso, $designacao_material, $local_coleta, $proprietario, $municipio_estado, $idade_lavoura, $data_coleta, $coletor);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Item adicionado com sucesso."]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao adicionar item."]);
}
?>