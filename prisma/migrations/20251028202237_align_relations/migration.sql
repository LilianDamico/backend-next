/*
  Warnings:

  - You are about to drop the `HorarioDisponivel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_horarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HorarioDisponivel" DROP CONSTRAINT "HorarioDisponivel_profissionalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MedicalRecord" DROP CONSTRAINT "MedicalRecord_consultaId_fkey";

-- DropTable
DROP TABLE "public"."HorarioDisponivel";

-- DropTable
DROP TABLE "public"."MedicalRecord";

-- CreateTable
CREATE TABLE "Horario" (
    "id" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "profissionalId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prontuario" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consultaId" TEXT NOT NULL,

    CONSTRAINT "Prontuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_horario_prof_data" ON "Horario"("profissionalId", "dataHora");

-- CreateIndex
CREATE INDEX "idx_horario_data" ON "Horario"("dataHora");

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "Horario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prontuario" ADD CONSTRAINT "Prontuario_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
