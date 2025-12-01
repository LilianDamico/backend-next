/*
  Warnings:

  - You are about to drop the column `data` on the `Consulta` table. All the data in the column will be lost.
  - You are about to drop the `Horario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dataHora` to the `Consulta` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_horarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Horario" DROP CONSTRAINT "Horario_profissionalId_fkey";

-- AlterTable
ALTER TABLE "Consulta" DROP COLUMN "data",
ADD COLUMN     "dataHora" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletado" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."Horario";

-- CreateTable
CREATE TABLE "Consentimento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aceito" BOOLEAN NOT NULL,
    "ip" TEXT,
    "metodo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consentimento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "CalendarioProfissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consentimento" ADD CONSTRAINT "Consentimento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
