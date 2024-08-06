import { PrismaClient } from "@prisma/client";
import { validarId, verificarCampoObrigatorio } from "../../utils/validacoes";

const prisma = new PrismaClient();

export default {
  async criarLaboratorio(request, response) {
    try {
      const { nome, sigla } = request.body;
      let resposta = null;

      // Verifica se os campos obrigatórios estão presentes
      resposta = verificarCampoObrigatorio(nome, "nome");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = verificarCampoObrigatorio(sigla, "sigla");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await verificarCampoUnico(null, "nome", nome);
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await verificarCampoUnico(null, "sigla", sigla);
      if (resposta) return response.status(resposta.status).json(resposta);

      const laboratorioCriado = await prisma.laboratorio.create({
        data: {
          nome,
          sigla,
        },
      });
      return response.status(201).json(laboratorioCriado);
    } catch (error) {
      console.error("Erro ao criar laboratório", error);
      return response
        .status(500)
        .send({ error: "Não foi possível criar um laboratório!" });
    }
  },

  async listarLaboratorios(request, response) {
    try {
      const laboratorios = await prisma.laboratorio.findMany({
        orderBy: {
          nome: "asc",
        },
        include: { reservas: true },
      });
      return response.status(200).json(laboratorios);
    } catch (error) {
      console.error("Erro ao listar laboratórios", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar laboratórios!" });
    }
  },
  async listarUmLaboratorio(request, response) {
    try {
      const { id } = request.params;
      let resposta = validarId(id);
      if (resposta) return response.status(resposta.status).json(resposta);

      const laboratorio = await buscarLaboratorioPorId(id);

      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }
      return response.status(200).json(laboratorio);
    } catch (error) {
      console.error("Erro ao listar laboratório", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar laboratório!" });
    }
  },
  async atualizarLaboratorio(request, response) {
    try {
      const { id } = request.params;
      const { nome, sigla } = request.body;

      let resposta = null;
      resposta = validarId(id);
      if (resposta) return response.status(resposta.status).json(resposta);

      const laboratorio = await buscarLaboratorioPorId(id);

      if (!laboratorio || !laboratorio.ativo) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado ou inativo." });
      }
      resposta = verificarCampoObrigatorio(nome, "nome");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = verificarCampoObrigatorio(sigla, "sigla");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await verificarCampoUnico(id, "nome", nome);
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await verificarCampoUnico(id, "sigla", sigla);
      if (resposta) return response.status(resposta.status).json(resposta);

      laboratorio = await prisma.laboratorio.update({
        where: { id: Number(id) },
        data: {
          nome: nome,
          sigla: sigla,
        },
      });
      return response.status(200).json(laboratorio);
    } catch (error) {
      console.error("Erro ao atualizar laboratório", error);
      return response
        .status(500)
        .send({ error: "Não foi possível atualizar laboratório!" });
    }
  },
  async deletarLaboratorio(request, response) {
    try {
      const { id } = request.params;

      let resposta = null;

      resposta = validarId(id);
      if (resposta) return response.status(resposta.status).json(resposta);

      const laboratorio = await buscarLaboratorioPorId(id);

      // Verifica se o laboratório existe
      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }

      if (!laboratorio.reservas.length) {
        await prisma.laboratorio.delete({
          where: { id: Number(id) },
        });
        return response
          .status(200)
          .send({ message: "Laboratório excluído com sucesso." });
      } else {
        const dataAtual = new Date();
        dataAtual.setHours(dataAtual.getHours() - 3); // Ajusta o fuso horário para o horário de Brasília
        console.log(dataAtual);
        const reservasFuturas = laboratorio.reservas.filter(
          (reserva) => reserva.dataHoraFim >= dataAtual
        );
        console.log(reservasFuturas);
        // Se o laboratório não tem reservas futuras ou em andamento, ele pode ser desativado
        if (reservasFuturas.length === 0) {
          await prisma.laboratorio.update({
            where: { id: Number(id) },
            data: {
              ativo: false,
            },
          });
          return response
            .status(200)
            .send({ message: "Laboratório desativado com sucesso." });
        } else {
          // Se o laboratório tem reservas futuras ou em andamento, ele não pode ser desativado
          return response.status(400).send({
            error:
              "Laboratório não pode ser desativado pois tem reservas futuras ou em andamento.",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao excluir laboratório", error);
      return response
        .status(500)
        .send({ error: "Erro interno ao excluir laboratório." });
    }
  },
};
async function verificarCampoUnico(id, campo, valorCampo) {
  const campoProcurado = await prisma.laboratorio.findUnique({
    where: { [campo]: valorCampo, NOT: { id: Number(id) } },
  });
  if (campoProcurado) {
    return {
      status: 400,
      error: `Laboratório com mesma ${campo} já existe!`,
    };
  }
  return null;
}
async function buscarLaboratorioPorId(id) {
  const laboratorio = await prisma.laboratorio.findUnique({
    where: { id: Number(id) },
  });
  return laboratorio;
}
