const projetos = [
  {
    tag: "article",
    id: "oficinas",
    titulo: "Oficinas de inclusão digital",
    descricao:
      "As oficinas ensinam competências digitais essenciais de maneira gratuita, acessível e prática.",
    subtitulo: "Atividades oferecidas",
    itens: [
      "Uso básico de computadores e celulares;",
      "Criação de currículos e envio de documentos;",
      "Segurança e cidadania digital;",
      "Preparação para processos seletivos on-line.",
    ],
  },
  {
    tag: "section",
    id: "voluntariado",
    titulo: "Programa de voluntariado",
    descricao:
      "Voluntários podem apoiar oficinas, produzir materiais educativos ou orientar participantes em atividades práticas.",
    subtitulo: "Requisitos",
    itens: [
      "Ter disponibilidade para participar das atividades;",
      "Respeitar a diversidade dos participantes;",
      "Compartilhar conhecimentos com linguagem acessível.",
    ],
    botao: {
      texto: "Quero ser voluntário",
      rota: "cadastro",
    },
  },
  {
    tag: "section",
    id: "doacoes",
    titulo: "Campanha de doações",
    descricao:
      "As contribuições ajudam a manter as oficinas, adquirir equipamentos e oferecer acesso gratuito aos participantes.",
    botao: {
      texto: "Quero fazer uma doação",
      rota: "cadastro",
    },
  },
  {
    tag: "section",
    id: "resultados",
    titulo: "Resultados alcançados",
    itens: [
      "500 pessoas atendidas;",
      "30 oficinas realizadas;",
      "45 voluntários participantes;",
      "200 currículos produzidos.",
    ],
  },
];

function criarLista(itens = []) {
  if (itens.length === 0) {
    return "";
  }

  const elementos = itens.map((item) => `<li>${item}</li>`).join("");

  return `<ul>${elementos}</ul>`;
}

function criarBotao(botao) {
  if (!botao) {
    return "";
  }

  return `
    <a href="#${botao.rota}" data-route="${botao.rota}">
      ${botao.texto}
    </a>
  `;
}

function criarComponente(projeto) {
  const tituloId = `titulo-${projeto.id}`;
  const descricao = projeto.descricao
    ? `<p>${projeto.descricao}</p>`
    : "";
  const subtitulo = projeto.subtitulo
    ? `<h3>${projeto.subtitulo}</h3>`
    : "";

  return `
    <${projeto.tag} id="${projeto.id}" aria-labelledby="${tituloId}">
      <h2 id="${tituloId}">${projeto.titulo}</h2>
      ${descricao}
      ${subtitulo}
      ${criarLista(projeto.itens)}
      ${criarBotao(projeto.botao)}
    </${projeto.tag}>
  `;
}

export function renderizarProjetos() {
  const marcador = document.getElementById("projetos-dinamicos");

  if (!marcador) {
    return;
  }

  const componentes = projetos.map(criarComponente).join("");

  marcador.insertAdjacentHTML("beforebegin", componentes);
  marcador.remove();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderizarProjetos);
} else {
  renderizarProjetos();
}
