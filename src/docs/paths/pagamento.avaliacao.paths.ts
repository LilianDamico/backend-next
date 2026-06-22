/**
 * @swagger
 * tags:
 *   name: Pagamentos
 *   description: Registro e consulta de pagamentos
 */

/**
 * @swagger
 * /api/pagamentos:
 *   get:
 *     tags: [Pagamentos]
 *     summary: Listar todos os pagamentos
 *     description: Retorna todos os pagamentos registrados. Acesso restrito a **ADMIN**.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pagamento'
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
 *
 *   post:
 *     tags: [Pagamentos]
 *     summary: Registrar pagamento
 *     description: Registra um novo pagamento vinculado a uma consulta. Acesso para **ADMIN** e **PROFISSIONAL**.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagamentoRequest'
 *     responses:
 *       201:
 *         description: Pagamento registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagamento'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       403:
 *         description: Acesso negado — somente ADMIN ou PROFISSIONAL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * tags:
 *   name: Avaliações
 *   description: Avaliações de consultas pelos pacientes
 */

/**
 * @swagger
 * /api/avaliacao/criar:
 *   post:
 *     tags: [Avaliações]
 *     summary: Criar avaliação de consulta
 *     description: O paciente avalia a consulta com nota de 1 a 5 e comentário opcional.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvaliacaoRequest'
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 consultaId: { type: string, format: uuid }
 *                 nota: { type: integer, example: 5 }
 *                 comentario: { type: string, nullable: true }
 *                 criadoEm: { type: string, format: date-time }
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Consulta não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

export {};
