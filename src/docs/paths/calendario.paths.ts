/**
 * @swagger
 * tags:
 *   name: Calendário
 *   description: Gestão de slots de agenda do profissional
 */

/**
 * @swagger
 * /api/calendario/me:
 *   get:
 *     tags: [Calendário]
 *     summary: Listar slots da agenda do profissional autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de slots do profissional
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
 */

/**
 * @swagger
 * /api/calendario:
 *   post:
 *     tags: [Calendário]
 *     summary: Criar slot de agenda
 *     description: Cria um único slot de horário disponível na agenda do profissional.
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
 *         description: Slot criado com sucesso
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
 * /api/calendario/gerar-dia:
 *   post:
 *     tags: [Calendário]
 *     summary: Gerar slots automáticos para um dia inteiro
 *     description: |
 *       Gera automaticamente todos os slots de um dia com base no horário
 *       de início, fim e intervalo definidos.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GerarDiaRequest'
 *     responses:
 *       201:
 *         description: Slots criados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 criados:
 *                   type: integer
 *                   example: 16
 *                 slots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SlotCalendario'
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
 * /api/calendario/{id}:
 *   put:
 *     tags: [Calendário]
 *     summary: Atualizar slot de agenda
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disponivel: { type: boolean }
 *               observacao: { type: string }
 *               dataHora: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Slot atualizado
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
 *       404:
 *         description: Slot não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *
 *   delete:
 *     tags: [Calendário]
 *     summary: Excluir slot de agenda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Slot excluído com sucesso
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
 *       403:
 *         description: Acesso negado — somente PROFISSIONAL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Slot não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

/**
 * @swagger
 * tags:
 *   name: Horários
 *   description: Consulta e gestão de horários por nome do profissional
 */

/**
 * @swagger
 * /api/horarios/nome/{userNome}:
 *   get:
 *     tags: [Horários]
 *     summary: Listar horários disponíveis de um profissional pelo nome
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userNome
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
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       403:
 *         description: Acesso negado — somente CLIENTE ou PROFISSIONAL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Profissional não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *
 *   post:
 *     tags: [Horários]
 *     summary: Criar horário por nome do profissional
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userNome
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
 *
 *   put:
 *     tags: [Horários]
 *     summary: Atualizar horários do profissional pelo nome
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userNome
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SlotRequest'
 *     responses:
 *       200:
 *         description: Horário atualizado
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
 *
 *   delete:
 *     tags: [Horários]
 *     summary: Excluir horário do profissional pelo nome
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userNome
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Horário excluído com sucesso
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
 *       403:
 *         description: Acesso negado — somente PROFISSIONAL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 */

export {};
