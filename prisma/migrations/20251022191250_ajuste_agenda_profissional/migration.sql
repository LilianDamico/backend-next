-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "cidade" TEXT;

-- CreateIndex
CREATE INDEX "idx_consulta_prof_cliente" ON "Consulta"("profissionalId", "clienteId");

-- CreateIndex
CREATE INDEX "idx_horario_prof_data" ON "HorarioDisponivel"("profissionalId", "dataHora");

-- CreateIndex
CREATE INDEX "idx_horario_data" ON "HorarioDisponivel"("dataHora");

-- CreateIndex
CREATE INDEX "idx_user_nome" ON "User"("nome");
