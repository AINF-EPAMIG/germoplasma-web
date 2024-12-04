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

// Verifica se os itens foram fornecidos e são válidos
if (!isset($data->items) || !is_array($data->items)) {
    echo json_encode(["success" => false, "message" => "Itens não fornecidos ou inválidos."]);
    exit;
}

// Prepara a consulta para exclusão
$query = "DELETE FROM germoplasma_cafe 
          WHERE numero_acesso = ? 
          AND designacao_material = ? 
          AND local_coleta = ? 
          AND proprietario = ?";

$stmt = $conn->prepare($query);

// Valida se a preparação foi bem-sucedida
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar a consulta."]);
    exit;
}

// Executa a exclusão para cada item
$deletedCount = 0;
foreach ($data->items as $item) {
    if (!isset($item->numero_acesso, $item->designacao_material, $item->local_coleta, $item->proprietario)) {
        continue; // Ignora itens com dados incompletos
    }

    $stmt->bind_param(
        "ssss",
        $item->numero_acesso,
        $item->designacao_material,
        $item->local_coleta,
        $item->proprietario
    );

    if ($stmt->execute()) {
        $deletedCount++;
    }
}

// Fecha o statement
$stmt->close();

// Retorna o resultado
if ($deletedCount > 0) {
    echo json_encode(["success" => true, "message" => "$deletedCount itens removidos com sucesso."]);
} else {
    echo json_encode(["success" => false, "message" => "Nenhum item foi removido."]);
}
?>
