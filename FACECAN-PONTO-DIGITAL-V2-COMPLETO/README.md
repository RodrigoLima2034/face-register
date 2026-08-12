# FACECAN Ponto Digital V2

Sistema corporativo de controle de ponto preparado para:
- terminal de ponto por câmera;
- cadastro de funcionários;
- turnos manhã/noite;
- regras automáticas de entrada, intervalo e saída;
- espelho de ponto;
- relatórios;
- central administrativa de arquivos;
- auditoria;
- banco SQLite para desenvolvimento/local;
- camada de integração preparada para AWS / News Systems / Oracle.

## Executar

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

### Banco local

O banco SQLite é criado automaticamente em `data/facecan.db`.

Para produção, recomenda-se trocar o armazenamento local por PostgreSQL gerenciado em uma rede privada (por exemplo AWS RDS/Aurora) e usar storage privado (S3) para arquivos.

## Segurança

Este projeto não promete "segurança total". Ele foi estruturado para aplicar boas práticas, mas produção exige revisão de segurança, segredo fora do código, HTTPS, firewall/WAF, backups, monitoramento, MFA e testes de segurança.

### Admin

A área `/admin` usa uma autenticação de demonstração por cookie. Antes de produção, substitua por um provedor/SSO corporativo ou autenticação robusta com MFA. Nunca use a senha de exemplo em produção.

## Integrações

As configurações de AWS, Oracle e News Systems ficam em variáveis de ambiente. O código não coloca chaves secretas no frontend.

## Biometria

A câmera funciona como captura no navegador. A correspondência biométrica real deve ser ligada a um motor de reconhecimento facial/liveness validado pela empresa. Não é correto considerar uma simples foto como biometria segura.
