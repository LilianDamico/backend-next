/*
  Warnings:

  - The `status` column on the `Consulta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `horarioId` on table `Consulta` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StatusConsulta" AS ENUM ('AGENDADA', 'CANCELADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "Cancelador" AS ENUM ('CLIENTE', 'PROFISSIONAL', 'SISTEMA');

-- AlterEnum
ALTER TYPE "TipoUsuario" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_horarioId_fkey";

-- AlterTable
ALTER TABLE "Consulta" ADD COLUMN     "canceladaPor" "Cancelador",
ADD COLUMN     "motivoCancel" TEXT,
ALTER COLUMN "horarioId" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusConsulta" NOT NULL DEFAULT 'AGENDADA';

-- CreateTable
CREATE TABLE "CalendarioProfissional" (
    "id" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarioProfissional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarioProfissional_profissionalId_dataHora_key" ON "CalendarioProfissional"("profissionalId", "dataHora");

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "Horario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarioProfissional" ADD CONSTRAINT "CalendarioProfissional_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
