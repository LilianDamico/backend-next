/**
 * @swagger
 * tags:
 *   name: Prescrições
 *   description: Prescrições médicas emitidas por profissionais
 */

/**
 * @swagger
 * /api/prescricao:
 *   post:
 *     tags: [Prescrições]
 *     summary: Criar prescrição
 *     description: O profissional autenticado emite uma prescrição para um paciente.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrescricaoRequest'
 *     responses:
 *       201:
 *         description: Prescrição criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescricao'
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
 * /api/prescricao/paciente/{nome}:
 *   get:
 *     tags: [Prescrições]
 *     summary: Listar prescrições por nome do paciente
 *     description: Busca todas as prescrições de um paciente pelo nome. Acesso para **ADMIN** e **PROFISSIONAL**.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nome
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "Maria Silva"
 *     responses:
 *       200:
 *         description: Lista de prescrições
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescricao'
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
 * /api/prescricao/profissional/{nome}:
 *   get:
 *     tags: [Prescrições]
 *     summary: Listar prescrições por nome do profissional
 *     description: Busca todas as prescrições emitidas por um profissional. Acesso para **ADMIN** e **PROFISSIONAL**.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nome
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "Dr. João Souza"
 *     responses:
 *       200:
 *         description: Lista de prescrições
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescricao'
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
 *   name: Prontuários
 *   description: Prontuários dos pacientes
 */

/**
 * @swagger
 * /api/prontuarios/{nome}:
 *   get:
 *     tags: [Prontuários]
 *     summary: Listar prontuários por nome do paciente
 *     description: Retorna os prontuários de um paciente pesquisando pelo nome. Acesso para **ADMIN** e **PROFISSIONAL**.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nome
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "Maria Silva"
 *     responses:
 *       200:
 *         description: Lista de prontuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prontuario'
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

export {};
