# Checklist de produção FACECAN

1. Colocar a aplicação atrás de HTTPS.
2. Usar PostgreSQL/RDS/Aurora em sub-rede privada.
3. Não expor a porta do banco à Internet.
4. Usar AWS Secrets Manager/Parameter Store para segredos.
5. Usar S3 privado para arquivos, com URLs temporárias.
6. Habilitar MFA para administradores.
7. Aplicar RBAC mínimo necessário.
8. Habilitar WAF/rate limiting e monitoramento.
9. Configurar backups e teste de restauração.
10. Habilitar logs centralizados e alertas.
11. Fazer varredura de dependências e SAST/DAST antes do go-live.
12. Definir política de retenção e descarte de biometria/registros.
13. Integrar liveness/face matching validado; a câmera do navegador não deve ser considerada, sozinha, uma solução biométrica completa.
14. Validar o layout Oracle/News Systems com o fornecedor antes de enviar dados reais.
15. Realizar avaliação LGPD, especialmente para dados biométricos.

## Rede recomendada

Internet -> CDN/WAF -> aplicação/API -> rede privada -> PostgreSQL/S3 privado.

Evite Internet -> banco.

## AWS

O fornecedor pode conectar os adaptadores deste projeto aos serviços AWS que a empresa definir. Chaves nunca devem ir para o código do navegador.
