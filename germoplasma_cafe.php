<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require 'database.php';

$query = "SELECT * FROM germoplasma_cafe";

if ($is_query_run = mysqli_query($conn, $query)) {
    $userData = [];
    while ($query_executed = mysqli_fetch_assoc($is_query_run)) {
        $userData[] = $query_executed;
    }
    echo json_encode($userData);
} else {
    echo json_encode(["error" => "Erro na execução da consulta"]);
}
?>
