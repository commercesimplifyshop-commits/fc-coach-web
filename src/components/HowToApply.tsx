interface Props {
  formationName: string
  extra?: string[]
}

// Menu names follow the FC 26 screens seen in real gameplay; they may change
// slightly in newer versions, which the note below says out loud.
export default function HowToApply({ formationName, extra = [] }: Props) {
  return (
    <section className="card" aria-labelledby="apply-title">
      <h3 id="apply-title">Como aplicar no jogo</h3>
      <ol className="steps">
        <li>
          Abra o <b>Gerenciamento do time</b> e entre em <b>Editar tática</b>.
        </li>
        <li>
          Escolha a formação <b>{formationName}</b>. Se o seu jogo não tiver exatamente essa, use a mais parecida.
        </li>
        <li>
          Na aba <b>Táticas do time</b>, ajuste o estilo (construção, pressão e linha defensiva) para se aproximar do que está descrito aqui.
        </li>
        <li>
          Na aba <b>Funções de atletas</b>, confira a função de cada posição. Zagueiros e volantes com função defensiva protegem melhor a área.
        </li>
        <li>
          Leia os avisos que o próprio jogo mostra na tela (por exemplo, sobre funções defensivas baixas ou jogadores fora de posição) e corrija o que fizer sentido.
        </li>
        <li>Jogue algumas partidas antes de mudar de novo e envie uma delas para análise para ver se o problema principal diminuiu.</li>
      </ol>
      {extra.length > 0 && (
        <>
          <h4>Para chegar perto desse estilo</h4>
          <ul className="bullets">
            {extra.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </>
      )}
      <p className="note">Os nomes dos menus podem mudar de uma versão do jogo para outra. Os passos acima seguem o EA FC 26.</p>
    </section>
  )
}
