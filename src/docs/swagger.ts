import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "MindCare API",
      version: "1.0.0",
      description: `
API REST do sistema MindCare — plataforma de saúde mental que conecta pacientes
a profissionais de psicologia e psiquiatria.

## Autenticação
A maioria dos endpoints protegidos exige um **Bearer Token JWT**.
Obtenha o token em \`POST /api/auth/login\` e inclua-o no header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Roles
| Role | Descrição |
|------|-----------|
| CLIENTE | Paciente cadastrado |
| PROFISSIONAL | Psicólogo / psiquiatra |
| ADMIN | Administrador do sistema |
      `.trim(),
      contact: {
        name: "MindCare Dev",
        email: "suporte@mindcare.com.br",
      },
      license: {
        name: "Privado",
      },
    },
    servers: [
      {
        url: "https://backend-next-het9.onrender.com",
        description: "Produção (Render)",
      },
      {
        url: "http://localhost:8081",
        description: "Desenvolvimento local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtido via POST /api/auth/login",
        },
      },
      schemas: {
        // ── Usuário ──────────────────────────────────────────────
        UsuarioPublico: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "a1b2c3d4-..." },
            nome: { type: "string", example: "Maria Silva" },
            email: { type: "string", format: "email", example: "maria@email.com" },
            tipo: { type: "string", enum: ["CLIENTE", "PROFISSIONAL", "ADMIN"] },
            especialidade: { type: "string", nullable: true, example: "Psicologia Clínica" },
            cidade: { type: "string", nullable: true, example: "São Paulo" },
            criadoEm: { type: "string", format: "date-time" },
          },
        },
        RegistroRequest: {
          type: "object",
          required: ["nome", "email", "cpf", "senha", "tipo"],
          properties: {
            nome: { type: "string", example: "Maria Silva" },
            email: { type: "string", format: "email", example: "maria@email.com" },
            cpf: { type: "string", example: "12345678900" },
            senha: { type: "string", minLength: 6, example: "senha123" },
            tipo: { type: "string", enum: ["CLIENTE", "PROFISSIONAL"] },
            telefone: { type: "string", nullable: true, example: "(11) 99999-9999" },
            endereco: { type: "string", nullable: true },
            especialidade: { type: "string", nullable: true },
            cidade: { type: "string", nullable: true },
            bio: { type: "string", nullable: true },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["login", "senha"],
          properties: {
            login: {
              type: "string",
              example: "maria@email.com",
              description: "E-mail ou CPF",
            },
            senha: { type: "string", example: "senha123" },
          },
        },
        TokenResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                nome: { type: "string" },
                email: { type: "string" },
                tipo: { type: "string", enum: ["CLIENTE", "PROFISSIONAL", "ADMIN"] },
              },
            },
          },
        },
        // ── Consulta ─────────────────────────────────────────────
        Consulta: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            horarioId: { type: "string", format: "uuid" },
            profissionalId: { type: "string", format: "uuid" },
            clienteId: { type: "string", format: "uuid", nullable: true },
            dataHora: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["AGENDADA", "CANCELADA", "CONCLUIDA"],
            },
            motivoCancel: { type: "string", nullable: true },
            criadoEm: { type: "string", format: "date-time" },
          },
        },
        // ── Calendário ───────────────────────────────────────────
        SlotCalendario: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            profissionalId: { type: "string", format: "uuid" },
            dataHora: { type: "string", format: "date-time" },
            disponivel: { type: "boolean" },
            observacao: { type: "string", nullable: true },
            criadoEm: { type: "string", format: "date-time" },
          },
        },
        SlotRequest: {
          type: "object",
          required: ["dataHora"],
          properties: {
            dataHora: {
              type: "string",
              format: "date-time",
              example: "2026-07-10T09:00:00.000Z",
            },
            observacao: { type: "string", nullable: true, example: "Consulta inicial" },
          },
        },
        GerarDiaRequest: {
          type: "object",
          required: ["data", "inicio", "fim", "intervaloMinutos"],
          properties: {
            data: { type: "string", format: "date", example: "2026-07-10" },
            inicio: { type: "string", example: "09:00" },
            fim: { type: "string", example: "17:00" },
            intervaloMinutos: { type: "integer", example: 30 },
          },
        },
        // ── Pagamento ────────────────────────────────────────────
        Pagamento: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            valor: { type: "number", format: "float", example: 150.0 },
            metodo: {
              type: "string",
              enum: ["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "BOLETO"],
              example: "PIX",
            },
            status: {
              type: "string",
              enum: ["PENDENTE", "PAGO", "CANCELADO"],
              example: "PAGO",
            },
            consultaId: { type: "string", format: "uuid" },
            criadoEm: { type: "string", format: "date-time" },
          },
        },
        PagamentoRequest: {
          type: "object",
          required: ["valor", "metodo", "status", "consultaId"],
          properties: {
            valor: { type: "number", example: 150.0 },
            metodo: { type: "string", example: "PIX" },
            status: { type: "string", example: "PAGO" },
            consultaId: { type: "string", format: "uuid" },
          },
        },
        // ── Avaliação ────────────────────────────────────────────
        AvaliacaoRequest: {
          type: "object",
          required: ["consultaId", "nota"],
          properties: {
            consultaId: { type: "string", format: "uuid" },
            nota: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comentario: { type: "string", nullable: true, example: "Excelente atendimento!" },
          },
        },
        // ── Prescrição ───────────────────────────────────────────
        PrescricaoRequest: {
          type: "object",
          required: ["conteudo", "tipo", "profissionalNome", "pacienteNome", "consultaId"],
          properties: {
            conteudo: { type: "string", example: "Fluoxetina 20mg — 1x ao dia por 30 dias" },
            tipo: { type: "string", example: "Medicamento" },
            profissionalNome: { type: "string", example: "Dr. João Souza" },
            pacienteNome: { type: "string", example: "Maria Silva" },
            consultaId: { type: "string", format: "uuid" },
          },
        },
        Prescricao: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            conteudo: { type: "string" },
            tipo: { type: "string" },
            profissionalId: { type: "string", format: "uuid" },
            pacienteId: { type: "string", format: "uuid" },
            consultaId: { type: "string", format: "uuid", nullable: true },
            criadoEm: { type: "string", format: "date-time" },
          },
        },
        // ── Prontuário ───────────────────────────────────────────
        Prontuario: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            descricao: { type: "string" },
            consultaId: { type: "string", format: "uuid" },
            criadoEm: { type: "string", format: "date-time" },
          },
        },
        // ── LGPD ─────────────────────────────────────────────────
        Consentimento: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            aceito: { type: "boolean" },
            metodo: { type: "string", example: "web" },
            versao: { type: "string", example: "1.0" },
            origem: { type: "string", example: "politica-privacidade.html" },
            expiraEm: { type: "string", format: "date-time", nullable: true },
            criadoEm: { type: "string", format: "date-time" },
          },
        },
        // ── Triagem IA ───────────────────────────────────────────
        TriagemRequest: {
          type: "object",
          required: ["mensagem"],
          properties: {
            mensagem: {
              type: "string",
              maxLength: 2000,
              example: "Estou me sentindo muito ansioso e não consigo dormir.",
            },
          },
        },
        TriagemResponse: {
          type: "object",
          properties: {
            risco: {
              type: "string",
              enum: ["risco_baixo", "risco_moderado", "risco_alto"],
              example: "risco_moderado",
            },
            resposta: {
              type: "string",
              example: "Entendo que você está passando por um momento difícil.",
            },
            acao: {
              type: "string",
              enum: ["continuar", "sugerir_agendamento", "direcionar_emergencia"],
              example: "sugerir_agendamento",
            },
          },
        },
        // ── Admin Dashboard ──────────────────────────────────────
        AdminDashboard: {
          type: "object",
          properties: {
            appointments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "string", example: "09:00" },
                  period: { type: "string", enum: ["Manhã", "Tarde", "Noite"] },
                  patient: { type: "string", example: "Maria Silva" },
                  status: {
                    type: "string",
                    enum: ["Confirmado", "Pendente", "Cancelado"],
                  },
                },
              },
            },
            revenue: {
              type: "object",
              properties: {
                currentMonth: { type: "number", example: 8500 },
                goal: { type: "number", example: 22000 },
                percent: { type: "integer", example: 39 },
              },
            },
            engagement: {
              type: "object",
              properties: {
                feedbackCollected: { type: "integer", example: 42 },
                communityPosts: { type: "integer", example: 0 },
                chatbotSessions: { type: "integer", example: 0 },
              },
            },
            satisfaction: {
              type: "object",
              properties: {
                average: { type: "number", example: 4.7 },
                totalRatings: { type: "integer", example: 42 },
              },
            },
          },
        },
        // ── Erros ────────────────────────────────────────────────
        ErroResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Mensagem de erro descritiva." },
          },
        },
        MensagemResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Operação realizada com sucesso." },
          },
        },
      },
    },
    security: [],
  },
  apis: ["./src/docs/paths/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
