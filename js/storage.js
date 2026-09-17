const CHAVE_CADASTROS = "conectaFuturoCadastros";

export function obterCadastros() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CADASTROS)) || [];
  } catch (erro) {
    console.error("Não foi possível ler os cadastros.", erro);
    return [];
  }
}

export function salvarCadastro(dados) {
  const cadastros = obterCadastros();

  const cadastroSeguro = {
    nome: dados.nome,
    email: dados.email,
    estado: dados.estado,
    participacao: dados.participacao,
    interesse: dados.interesse,
    cadastradoEm: new Date().toISOString(),
  };

  cadastros.push(cadastroSeguro);
  localStorage.setItem(CHAVE_CADASTROS, JSON.stringify(cadastros));
}
