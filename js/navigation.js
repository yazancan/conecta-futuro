import { renderizarProjetos } from "./templates.js";

const paginas = {
  projetos: "projetos.html",
  cadastro: "cadastro.html",
};

const estilos = {
  inicio: "../css/index.css",
  projetos: "../css/projetos.css",
  cadastro: "../css/cadastro.css",
};

const container = document.getElementById("app");
const cssPagina = document.getElementById("css-pagina");
const conteudoInicial = container.innerHTML;

/**
 * Identifica a rota e a seção presentes na hash.
 * Exemplo: #projetos/oficinas
 */
function obterLocalAtual() {
  const hash = window.location.hash.replace("#", "");

  if (hash === "") {
    return {
      rota: "inicio",
      secao: null,
    };
  }

  const [rota, secao] = hash.split("/");

  return {
    rota,
    secao: secao || null,
  };
}

/**
 * Troca o arquivo CSS específico da página.
 */
function carregarEstilo(rota) {
  return new Promise((resolve, reject) => {
    const novoEstilo = estilos[rota] || estilos.inicio;
    const estiloAtual = cssPagina.getAttribute("href");

    if (estiloAtual === novoEstilo) {
      resolve();
      return;
    }

    cssPagina.onload = () => {
      cssPagina.onload = null;
      cssPagina.onerror = null;
      resolve();
    };

    cssPagina.onerror = () => {
      cssPagina.onload = null;
      cssPagina.onerror = null;
      reject(new Error(`Não foi possível carregar: ${novoEstilo}`));
    };

    cssPagina.href = novoEstilo;
  });
}

/**
 * Move a página até uma seção específica.
 */
function irParaSecao(secao) {
  if (!secao) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return;
  }

  const elemento = document.getElementById(secao);

  if (elemento) {
    elemento.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

/**
 * Renderiza o conteúdo correspondente à rota.
 */
async function renderizarPagina(rota, secao = null) {
  try {
    await carregarEstilo(rota);

    if (rota === "inicio") {
      container.innerHTML = conteudoInicial;
      document.title = "Conecta Futuro | Início";

      irParaSecao(secao);
      return;
    }

    const caminhoPagina = paginas[rota];

    if (!caminhoPagina) {
      throw new Error("Rota não encontrada.");
    }

    const resposta = await fetch(caminhoPagina);

    if (!resposta.ok) {
      throw new Error(`Erro ao carregar ${caminhoPagina}`);
    }

    const codigoHTML = await resposta.text();

    const documento = new DOMParser().parseFromString(codigoHTML, "text/html");

    const novoConteudo = documento.querySelector("main");

    if (!novoConteudo) {
      throw new Error("O elemento main não foi encontrado.");
    }

    container.innerHTML = novoConteudo.innerHTML;
    document.title = documento.title;

    if (rota === "projetos") {
      renderizarProjetos();
    }

    const menuToggle = document.getElementById("menu-toggle");

    if (menuToggle) {
      menuToggle.checked = false;
    }

    requestAnimationFrame(() => {
      irParaSecao(secao);
    });
  } catch (erro) {
    console.error(erro);

    container.innerHTML = `
      <section>
        <h1>Conteúdo indisponível</h1>
        <p>
          Não foi possível carregar esta página.
          Tente novamente.
        </p>
      </section>
    `;
  }
}

/**
 * Inicializa a navegação da SPA.
 */
export function iniciarNavegacao() {
  document.addEventListener("click", async (evento) => {
    const link = evento.target.closest("[data-route]");

    if (!link) {
      return;
    }

    evento.preventDefault();

    const rota = link.dataset.route;
    const secao = link.dataset.section || null;

    const novaHash = secao ? `#${rota}/${secao}` : `#${rota}`;

    history.pushState({ rota, secao }, "", novaHash);

    await renderizarPagina(rota, secao);
  });

  window.addEventListener("popstate", async () => {
    const { rota, secao } = obterLocalAtual();

    await renderizarPagina(rota, secao);
  });

  const { rota, secao } = obterLocalAtual();

  renderizarPagina(rota, secao);
}
