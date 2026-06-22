/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: Painel administrativo com métricas e relatórios
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Dados do painel administrativo
 *     description: |
 *       Retorna métricas consolidadas para o painel do administrador:
 *       - Consultas do dia (nome do paciente, horário, status)
 *       - Receita do mês vs. meta
 *       - Engajamento (feedbacks, sessões de chatbot)
 *       - Satisfação média das avaliações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminDashboard'
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
 * tags:
 *   name: Público
 *   description: Endpoints públicos — não exigem autenticação
 */

/**
 * @swagger
 * /api/public/profissionais:
 *   get:
 *     tags: [Público]
 *     summary: Listar profissionais disponíveis (público)
 *     description: Retorna todos os profissionais ativos sem exigir autenticação.
 *     responses:
 *       200:
 *         description: Lista de profissionais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UsuarioPublico'
 */

/**
 * @swagger
 * /api/public/horarios:
 *   get:
 *     tags: [Público]
 *     summary: Listar horários disponíveis de um profissional (público)
 *     description: Retorna todos os slots disponíveis de um profissional buscado pelo nome.
 *     parameters:
 *       - name: nome
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: "Dr. João Souza"
 *     responses:
 *       200:
 *         description: Lista de horários disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SlotCalendario'
 *       404:
 *         description: Profissional não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/public/triagem:
 *   post:
 *     tags: [Público]
 *     summary: Triagem de saúde mental por IA
 *     description: |
 *       Analisa a mensagem do usuário e retorna uma avaliação de risco
 *       com recomendações de ação. Não exige autenticação.
 *       A resposta pode sugerir agendamento ou direcionar para emergência.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TriagemRequest'
 *     responses:
 *       200:
 *         description: Triagem realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TriagemResponse'
 *       400:
 *         description: Mensagem ausente ou muito longa (máx. 2000 caracteres)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * tags:
 *   name: Agenda Pública
 *   description: Consulta de agenda de profissionais sem autenticação
 */

/**
 * @swagger
 * /api/agenda/buscar:
 *   get:
 *     tags: [Agenda Pública]
 *     summary: Buscar profissional por nome (público)
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
 *       400:
 *         description: Parâmetro nome não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * /api/agenda/{nome}/horarios:
 *   get:
 *     tags: [Agenda Pública]
 *     summary: Listar horários disponíveis de um profissional (público)
 *     parameters:
 *       - name: nome
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "Dr. João Souza"
 *     responses:
 *       200:
 *         description: Lista de slots disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SlotCalendario'
 *       404:
 *         description: Profissional não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * tags:
 *   name: Clínicas
 *   description: Gerenciamento de clínicas cadastradas
 */

/**
 * @swagger
 * /api/clinicas:
 *   get:
 *     tags: [Clínicas]
 *     summary: Listar clínicas (público)
 *     description: Retorna todas as clínicas cadastradas sem exigir autenticação.
 *     responses:
 *       200:
 *         description: Lista de clínicas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   nome: { type: string, example: "Clínica MindCare" }
 *                   endereco: { type: string, example: "Av. Paulista, 1000 - São Paulo, SP" }
 *                   telefone: { type: string, example: "(11) 3000-9999" }
 *                   criadoEm: { type: string, format: date-time }
 *
 *   post:
 *     tags: [Clínicas]
 *     summary: Cadastrar nova clínica
 *     description: Cria uma nova clínica. Somente **ADMIN**.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string, example: "Clínica MindCare" }
 *               endereco: { type: string }
 *               telefone: { type: string }
 *     responses:
 *       201:
 *         description: Clínica criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 nome: { type: string }
 *                 endereco: { type: string, nullable: true }
 *                 telefone: { type: string, nullable: true }
 *                 criadoEm: { type: string, format: date-time }
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
