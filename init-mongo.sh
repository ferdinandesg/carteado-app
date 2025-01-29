#!/bin/bash

# Espera até o MongoDB iniciar completamente
sleep 10

# Conectar ao MongoDB e inicializar o replica set
echo "Iniciando configuração do replica set..."

mongo --host mongodb1 --eval 'rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb1:27017" },
    { _id: 1, host: "mongodb2:27017" },
    { _id: 2, host: "mongodb3:27017" }
  ]
})'

echo "Replica set configurado!"
