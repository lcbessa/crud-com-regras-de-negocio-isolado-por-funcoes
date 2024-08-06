import { PrismaClient } from "@prisma/client";
import { gerarToken, verificarCampoObrigatorio } from "../../utils/validacoes";

const prisma = new PrismaClient();

export default {
  async criarUsuario(request, response) {
    try {
      const { nome, email, senha } = request.body;
      let resposta = null;
      resposta = verificarCampoObrigatorio(nome, "nome");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = verificarCampoObrigatorio(email, "email");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = verificarCampoObrigatorio(senha, "senha");
      if (resposta) return response.status(resposta.status).json(resposta);

      const usuario = await buscarUsuarioPorEmail(email);

      if (usuario.email) {
        return response.status(400).send({ error: "Email já registrado!" });
      }

      // Criar novo usuário
      const usuarioCriado = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha,
        },
      });
      return response.status(201).json(usuarioCriado);
    } catch (error) {
      console.error("Erro ao criar usuário", error);
      return response
        .status(500)
        .send({ error: "Não foi possível criar um usuário!" });
    }
  },
  async Login(request, response) {
    try {
      const { email, senha } = request.body;
      let resposta = null;
      resposta = verificarCampoObrigatorio(email, "email");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = verificarCampoObrigatorio(senha, "senha");
      if (resposta) return response.status(resposta.status).json(resposta);

      const usuario = await buscarUsuarioPorEmail(email);

      if (!usuario.email) {
        return response.status(400).send({ error: "Email não registrado!" });
      }

      if (senha !== usuario.senha) {
        return response.status(400).json({ error: "Senha incorreta!" });
      }
      // Gerar token JWT
      const token = gerarToken(usuario.id, usuario.admin);
      response.status(200).json({ message: "Autenticado com sucesso", token });
    } catch (error) {
      console.error("Erro ao autenticar usuário", error);
      return response
        .status(500)
        .send({ error: "Não foi possível autenticar o usuário!" });
    }
  },
  async ListarUsuarios(request, response) {
    try {
      const usuarios = await prisma.usuario.findMany();
      const usuariosComReservas = await Promise.all(
        usuarios.map(async (usuario) => {
          const reservas = await prisma.reserva.findMany({
            where: {
              usuarioId: usuario.id,
            },
          });
          return {
            ...usuario,
            reservas,
          };
        })
      );

      return response.status(200).json(usuariosComReservas);
    } catch (error) {
      console.error("Erro ao listar usuários", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar os usuários!" });
    }
  },
};
async function buscarUsuarioPorEmail(email) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });
  console.log(usuario);

  return usuario;
}
