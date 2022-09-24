import { Head, PageProps, usePageContext } from "rakkasjs";
import css from "./[pokemon].module.css";
import { useQuery } from "@tanstack/react-query";

// Types for the dynamic route params
interface Params {
  pokemon: string;
}

// Type for the Pokéapi data, just the bits we actually use
interface Pokemon {
  sprites?: { front_default?: string };
  stats: Array<{
    stat: { name: string };
    base_stat: number;
    effort: number;
  }>;
}

export default function PokemonStatPage({ params }: PageProps<Params>) {
  // Unique key for the data to be fetched

  const pageContext = usePageContext();
  const { data } = useQuery(["pokemon", params.pokemon], async () => {
    // Fetch pokémon data from the Pokéapi
    const pokemon: Pokemon = await pageContext
      .fetch(`https://pokeapi.co/api/v2/pokemon/${params.pokemon}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      });

    // Pokéapi returns a lot of data, we only need the sprite and stats.
    // Let's pluck it to avoid unnecessary data serialization in case this
    // is a server-side render.
    const result = {
      sprites: {
        front_default: pokemon.sprites?.front_default,
      },
      stats: pokemon.stats.map((stat) => ({
        stat: { name: stat.stat.name },
        base_stat: stat.base_stat,
        effort: stat.effort,
      })),
    };

    return result;
  });

  return (
    <>
      <Head title={`${params.pokemon} stats`} />

      <p className={css.imageWrapper}>
        <img
          src={data!.sprites && data!.sprites.front_default}
          className={css.image}
          height={96}
        />
      </p>

      <h3 className={css.heading}>Stats</h3>
      <ul className={css.stats}>
        {data!.stats.map((s) => (
          <li className={css.stat} key={s.stat.name}>
            <h4>{s.stat.name}</h4>
            Base: {s.base_stat}
            <br />
            Effort: {s.effort}
          </li>
        ))}
      </ul>
    </>
  );
}
