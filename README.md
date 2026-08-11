# Ponto Facial — Transp Machado

Versão local pronta para rodar sem Supabase.

## Instalação

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Administração

Senha inicial: `admin123`

Antes de qualquer uso real, troque a autenticação por uma solução server-side.

## Observação

Esta versão guarda funcionários, templates faciais e registros no navegador (`localStorage`). Isso é útil para teste/protótipo, mas não é um banco corporativo compartilhado. Para uso real em vários celulares/computadores, conecte a um banco como Supabase/Neon/Postgres e proteja as APIs.
