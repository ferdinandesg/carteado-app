#!/usr/bin/env node
/**
 * Cria deploy/.env a partir de .env, adicionando vars de produção se ausentes.
 * Uso: node scripts/prepare-deploy-env.js
 */
const fs = require("fs");
const path = require("path");

const rootEnv = path.join(__dirname, "../.env");
const deployEnv = path.join(__dirname, "../deploy/.env");
const deployDir = path.join(__dirname, "../deploy");

const prodDefaults = {
  NEXTAUTH_URL: "https://carteado.ferdinandes.com.br",
  DATABASE_URL: "mongodb://mongodb:27017/carteado?replicaSet=rs0",
  APP_VERSION: "latest",
};

function parseEnv(content) {
  const out = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function serializeEnv(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

let env = {};
if (fs.existsSync(rootEnv)) {
  env = parseEnv(fs.readFileSync(rootEnv, "utf8"));
}
for (const [k, v] of Object.entries(prodDefaults)) {
  if (!env[k] || env[k] === "") env[k] = v;
}

if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });
fs.writeFileSync(deployEnv, serializeEnv(env));
console.log("deploy/.env criado/atualizado");
