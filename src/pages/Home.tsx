import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">EA FC · eFootball</p>
        <h1>Entenda por que tomou o gol e o que fazer diferente na próxima partida.</h1>
        <p className="lead">
          Envie o clipe de um lance ou a partida inteira. Você recebe os erros com as imagens que os mostram e um plano curto para a próxima, sem curso e sem tutorial.
        </p>
        <div className="actions">
          <Link className="btn btn-primary" to="/analisar">
            Analisar uma partida
          </Link>
          <Link className="btn" to="/formacoes">
            Ver formações e times
          </Link>
        </div>
      </section>

      <section aria-labelledby="how">
        <h2 id="how">Como funciona</h2>
        <div className="grid3">
          <article className="card">
            <h3>1. Você envia o vídeo</h3>
            <p>O vídeo fica no seu computador. Só alguns quadros pequenos são enviados para análise.</p>
          </article>
          <article className="card">
            <h3>2. O site acha os gols</h3>
            <p>Lê o placar ao longo da partida, separa cada gol e olha os segundos anteriores a ele.</p>
          </article>
          <article className="card">
            <h3>3. Você recebe até 3 prioridades</h3>
            <p>Cada erro vem com a imagem, o motivo e uma ação concreta. Marcado como visível, inferido ou incerto.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="forms">
        <h2 id="forms">Formações para copiar</h2>
        <p className="lead">
          Escolha a formação de um time de referência, como Flamengo ou Palmeiras, veja o desenho em campo e siga o passo a passo para aplicar no seu jogo.
        </p>
        <Link className="btn" to="/formacoes">
          Explorar formações
        </Link>
      </section>

      <section className="card note-card" aria-labelledby="honest">
        <h2 id="honest">O que este site não faz</h2>
        <p>
          A análise é feita em quadros parados. Ela não avalia timing de botão, qualidade de drible nem tempo de reação, e diz quando não dá para ter certeza. Os gols são achados pelo placar que aparece no canto superior esquerdo da tela. Se o seu vídeo não mostra o placar, marque os lances que quer entender.
        </p>
      </section>
    </>
  )
}
