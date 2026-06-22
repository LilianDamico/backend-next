/**
 * @swagger
 * tags:
 *   name: LGPD
 *   description: |
 *     Consentimentos e direitos do titular sob a
 *     **Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)**.
 *     O titular pode registrar, consultar, revogar consentimento e exportar seus dados.
 */

/**
 * @swagger
 * /api/lgpd/consentimento:
 *   post:
 *     tags: [LGPD]
 *     summary: Registrar consentimento LGPD
 *     description: |
 *       Registra o aceite de consentimento de um usuário.
 *       Chamado normalmente durante o cadastro (sem autenticação).
 *       O consentimento expira em 24 meses.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, versao, origem]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do usuário que está aceitando
 *               versao:
 *                 type: string
 *                 example: "1.0"
 *                 description: Versão da política de privacidade aceita
 *               origem:
 *                 type: string
 *                 example: "politica-privacidade.html"
 *                 description: Origem da página onde o aceite foi feito
 *               ip:
 *                 type: string
 *                 nullable: true
 *                 example: "179.212.0.1"
 *                 description: IP do usuário (opcional — capturado automaticamente se omitido)
 *     responses:
 *       201:
 *         description: Consentimento registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "LGPD registrado com sucesso" }
 *                 registro:
 *                   $ref: '#/components/schemas/Consentimento'
 *       400:
 *         description: Campos obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *
 *   get:
 *     tags: [LGPD]
 *     summary: Consultar consentimento ativo do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consentimento ativo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consentimento'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Nenhum consentimento ativo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *
 *   delete:
 *     tags: [LGPD]
 *     summary: Revogar consentimento LGPD
 *     description: O usuário revoga seu consentimento. Após a revogação, o acesso pode ser bloqueado por `requireLgpd`.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consentimento revogado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/lgpd/status:
 *   get:
 *     tags: [LGPD]
 *     summary: Status do consentimento do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status retornado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ativo: { type: boolean, example: true }
 *                 versao: { type: string, example: "1.0" }
 *                 expiraEm: { type: string, format: date-time, nullable: true }
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/lgpd/historico:
 *   get:
 *     tags: [LGPD]
 *     summary: Histórico de consentimentos do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos os consentimentos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consentimento'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/lgpd/exportar/json:
 *   get:
 *     tags: [LGPD]
 *     summary: Exportar dados pessoais em JSON (direito de portabilidade)
 *     description: Retorna todos os dados do titular em formato JSON conforme Art. 18 da LGPD.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados exportados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Objeto com todos os dados do titular
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/lgpd/exportar/pdf:
 *   get:
 *     tags: [LGPD]
 *     summary: Exportar dados pessoais em PDF (direito de portabilidade)
 *     description: Retorna todos os dados do titular em formato PDF conforme Art. 18 da LGPD.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/lgpd/conta:
 *   delete:
 *     tags: [LGPD]
 *     summary: Solicitar exclusão de conta (direito ao esquecimento)
 *     description: |
 *       Remove todos os dados pessoais do titular conforme Art. 18, VI da LGPD.
 *       Esta operação é **irreversível**.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta e dados excluídos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * tags:
 *   name: Admin LGPD
 *   description: Gestão de consentimentos LGPD pelo administrador
 */

/**
 * @swagger
 * /api/admin/lgpd:
 *   get:
 *     tags: [Admin LGPD]
 *     summary: Listar todos os consentimentos LGPD
 *     description: Retorna todos os consentimentos registrados na plataforma. Somente **ADMIN**.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuário específico
 *     responses:
 *       200:
 *         description: Lista de consentimentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consentimento'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       403:
 *         description: Acesso negado — somente ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/admin/lgpd/usuario/{userId}:
 *   get:
 *     tags: [Admin LGPD]
 *     summary: Listar consentimentos de um usuário específico
 *     description: Retorna todos os consentimentos de um usuário pelo ID. Somente **ADMIN**.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados do usuário e seus consentimentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/UsuarioPublico'
 *                 consentimentos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Consentimento'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       403:
 *         description: Acesso negado — somente ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

export {};
