import { salvarCadastro } from "./storage.js";

let validacaoIniciada = false;

const PADROES = {
  cpf: /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/,
  telefone: /^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/,
  cep: /^[0-9]{5}-[0-9]{3}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

const NOMES_CAMPOS = [
  "nome",
  "email",
  "nascimento",
  "cpf",
  "telefone",
  "cep",
  "endereco",
  "cidade",
  "estado",
  "interesse",
  "consentimento",
];

function obterMensagemErro(campo) {
  const valor = campo.value.trim();

  if (campo.type === "checkbox" && !campo.checked) {
    return "É necessário autorizar o tratamento dos dados.";
  }

  if (valor === "") {
    return "Este campo é obrigatório.";
  }

  if (campo.name === "nome" && valor.length < 3) {
    return "Informe um nome com pelo menos três caracteres.";
  }

  if (campo.name === "email" && !PADROES.email.test(valor)) {
    return "Informe um endereço de e-mail válido.";
  }

  if (campo.name === "nascimento") {
    const dataInformada = new Date(`${valor}T00:00:00`);

    if (dataInformada > new Date()) {
      return "A data de nascimento não pode estar no futuro.";
    }
  }

  if (PADROES[campo.name] && !PADROES[campo.name].test(valor)) {
    return campo.title || "Confira o formato informado.";
  }

  return "";
}

function removerMensagem(formulario, nomeCampo) {
  formulario
    .querySelectorAll(`.mensagem-erro[data-campo="${nomeCampo}"]`)
    .forEach((mensagem) => mensagem.remove());
}

function obterContainer(campo) {
  return campo.closest("p") || campo.parentElement;
}

function mostrarEstadoCampo(formulario, campo, mensagem) {
  removerMensagem(formulario, campo.name);
  campo.classList.remove("campo-erro", "campo-sucesso");

  if (mensagem) {
    campo.classList.add("campo-erro");
    campo.setAttribute("aria-invalid", "true");

    const aviso = document.createElement("small");
    aviso.className = "mensagem-erro";
    aviso.dataset.campo = campo.name;
    aviso.id = `erro-${campo.name}`;
    aviso.setAttribute("role", "alert");
    aviso.textContent = mensagem;

    campo.setAttribute("aria-describedby", aviso.id);
    obterContainer(campo).append(aviso);
    return false;
  }

  campo.classList.add("campo-sucesso");
  campo.setAttribute("aria-invalid", "false");
  campo.removeAttribute("aria-describedby");
  return true;
}

function validarCampo(formulario, campo) {
  return mostrarEstadoCampo(
    formulario,
    campo,
    obterMensagemErro(campo),
  );
}

function validarParticipacao(formulario) {
  const opcoes = Array.from(
    formulario.querySelectorAll('input[name="participacao"]'),
  );
  const selecionada = opcoes.some((opcao) => opcao.checked);

  removerMensagem(formulario, "participacao");

  opcoes.forEach((opcao) => {
    opcao.classList.toggle("campo-erro", !selecionada);
    opcao.setAttribute("aria-invalid", String(!selecionada));
  });

  if (!selecionada) {
    const aviso = document.createElement("small");
    aviso.className = "mensagem-erro";
    aviso.dataset.campo = "participacao";
    aviso.setAttribute("role", "alert");
    aviso.textContent = "Escolha voluntariado ou doação.";
    opcoes[opcoes.length - 1].closest("fieldset").append(aviso);
  }

  return selecionada;
}

function validarFormulario(formulario) {
  const resultados = NOMES_CAMPOS.map((nome) => {
    const campo = formulario.elements.namedItem(nome);
    return validarCampo(formulario, campo);
  });

  resultados.push(validarParticipacao(formulario));
  return resultados.every(Boolean);
}

function limparEstados(formulario) {
  formulario
    .querySelectorAll(".campo-erro, .campo-sucesso")
    .forEach((campo) => {
      campo.classList.remove("campo-erro", "campo-sucesso");
      campo.removeAttribute("aria-invalid");
      campo.removeAttribute("aria-describedby");
    });

  formulario
    .querySelectorAll(".mensagem-erro")
    .forEach((mensagem) => mensagem.remove());
}

function mostrarMensagemGeral(formulario, texto, tipo) {
  const mensagem = formulario.querySelector("#mensagem-formulario");

  if (!mensagem) {
    return;
  }

  mensagem.className = `mensagem-formulario ${tipo}`;
  mensagem.textContent = texto;
}

function obterDados(formulario) {
  const dados = new FormData(formulario);
  return Object.fromEntries(dados.entries());
}

export function iniciarValidacao() {
  if (validacaoIniciada) {
    return;
  }

  validacaoIniciada = true;

  document.addEventListener("input", (evento) => {
    const campo = evento.target.closest("#form-cadastro input");

    if (!campo || campo.type === "radio" || campo.type === "checkbox") {
      return;
    }

    validarCampo(campo.form, campo);
  });

  document.addEventListener("change", (evento) => {
    const campo = evento.target.closest(
      "#form-cadastro input, #form-cadastro select",
    );

    if (!campo) {
      return;
    }

    if (campo.type === "radio") {
      validarParticipacao(campo.form);
      return;
    }

    validarCampo(campo.form, campo);
  });

  document.addEventListener("submit", (evento) => {
    const formulario = evento.target.closest("#form-cadastro");

    if (!formulario) {
      return;
    }

    evento.preventDefault();
    mostrarMensagemGeral(formulario, "", "");

    if (!validarFormulario(formulario)) {
      mostrarMensagemGeral(
        formulario,
        "Verifique os campos destacados antes de enviar.",
        "erro",
      );

      formulario.querySelector(".campo-erro")?.focus();
      return;
    }

    salvarCadastro(obterDados(formulario));
    formulario.reset();

    setTimeout(() => {
      limparEstados(formulario);
      mostrarMensagemGeral(
        formulario,
        "Cadastro realizado com sucesso!",
        "sucesso",
      );
    });
  });

  document.addEventListener("reset", (evento) => {
    const formulario = evento.target.closest("#form-cadastro");

    if (!formulario) {
      return;
    }

    setTimeout(() => {
      limparEstados(formulario);
      mostrarMensagemGeral(formulario, "", "");
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarValidacao);
} else {
  iniciarValidacao();
}
