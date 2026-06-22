/**
 * @swagger
 * tags:
 *   name: Profissional
 *   description: Perfil e agenda do profissional de saúde
 */

/**
 * @swagger
 * /api/profissional/perfil:
 *   get:
 *     tags: [Profissional]
 *     summary: Obter perfil do profissional autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioPublico'
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
 *
 *   put:
 *     tags: [Profissional]
 *     summary: Atualizar perfil do profissional autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string, example: "Dr. João Souza" }
 *               especialidade: { type: string, example: "Psicologia Clínica" }
 *               cidade: { type: string, example: "São Paulo" }
 *               bio: { type: string, example: "10 anos de experiência em terapia cognitivo-comportamental." }
 *               telefone: { type: string, example: "(11) 99999-9999" }
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioPublico'
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
 * /api/profissional/horarios:
 *   get:
 *     tags: [Profissional]
 *     summary: Listar horários do profissional autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de horários disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SlotCalendario'
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
 *
 *   post:
 *     tags: [Profissional]
 *     summary: Criar ou atualizar horário do profissional
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SlotRequest'
 *     responses:
 *       201:
 *         description: Horário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotCalendario'
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
 * /api/profissional/consultas:
 *   get:
 *     tags: [Profissional]
 *     summary: Listar consultas agendadas do profissional
 *     security:
 *       - bearerAuth: []
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
 *         description: Acesso negado — somente PROFISSIONAL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/profissional/buscar:
 *   get:
 *     tags: [Profissional]
 *     summary: Buscar profissional por nome
 *     description: Busca parcial pelo nome do profissional. Requer autenticação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nome
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: "João"
 *     responses:
 *       200:
 *         description: Lista de profissionais encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UsuarioPublico'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

export {};
