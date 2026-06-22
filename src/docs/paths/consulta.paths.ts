/**
 * @swagger
 * tags:
 *   name: Consultas
 *   description: Agendamento e gestão de consultas
 */

/**
 * @swagger
 * /api/consultas:
 *   post:
 *     tags: [Consultas]
 *     summary: Agendar consulta
 *     description: Agenda uma nova consulta para o **CLIENTE** autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [horarioId, profissionalId, dataHora]
 *             properties:
 *               horarioId:
 *                 type: string
 *                 format: uuid
 *               profissionalId:
 *                 type: string
 *                 format: uuid
 *               dataHora:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-10T09:00:00.000Z"
 *     responses:
 *       201:
 *         description: Consulta agendada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consulta'
 *       400:
 *         description: Dados inválidos ou horário indisponível
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
 *         description: Acesso negado — somente CLIENTE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/consultas/cliente:
 *   get:
 *     tags: [Consultas]
 *     summary: Listar minhas consultas (CLIENTE)
 *     description: Retorna todas as consultas do cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consultas do cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consulta'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       403:
 *         description: Acesso negado — somente CLIENTE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/consultas/profissional:
 *   get:
 *     tags: [Consultas]
 *     summary: Listar consultas do profissional
 *     description: Retorna todas as consultas do profissional autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consultas do profissional
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consulta'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       403:
 *         description: Acesso negado — somente PROFISSIONAL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/consultas/cliente/nome/{userNome}:
 *   get:
 *     tags: [Consultas]
 *     summary: Buscar consultas por nome do cliente
 *     description: Busca todas as consultas de um cliente pelo nome. Acesso para **ADMIN** e **PROFISSIONAL**.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userNome
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "Maria Silva"
 *     responses:
 *       200:
 *         description: Lista de consultas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consulta'
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
 * /api/consultas/cancelar/{id}:
 *   patch:
 *     tags: [Consultas]
 *     summary: Cancelar consulta
 *     description: Cancela uma consulta agendada. Somente o **CLIENTE** dono da consulta pode cancelar.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 example: "Compromisso de última hora"
 *     responses:
 *       200:
 *         description: Consulta cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consulta'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       403:
 *         description: Acesso negado — somente CLIENTE dono da consulta
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
