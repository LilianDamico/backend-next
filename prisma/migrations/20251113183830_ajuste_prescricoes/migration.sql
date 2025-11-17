/*
  Warnings:

  - You are about to drop the column `descricao` on the `Prescricao` table. All the data in the column will be lost.
  - Added the required column `conteudo` to the `Prescricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pacienteId` to the `Prescricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profissionalId` to the `Prescricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Prescricao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Prescricao" DROP CONSTRAINT "Prescricao_consultaId_fkey";

-- DropIndex
DROP INDEX "public"."idx_user_nome";

-- AlterTable
ALTER TABLE "Prescricao" DROP COLUMN "descricao",
ADD COLUMN     "conteudo" TEXT NOT NULL,
ADD COLUMN     "pacienteId" TEXT NOT NULL,
ADD COLUMN     "profissionalId" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ALTER COLUMN "consultaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Prescricao" ADD CONSTRAINT "Prescricao_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescricao" ADD CONSTRAINT "Prescricao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescricao" ADD CONSTRAINT "Prescricao_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
