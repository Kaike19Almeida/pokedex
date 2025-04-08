"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./globals.css";

export default function Home() {
  const [regionData, setRegionData] = useState([]);
  const [error, setError] = useState("");
  const [shinyStates, setShinyStates] = useState({});
  const [pages, setPages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const porPagina = 6;

  const regioes = [
    { nome: "Kanto", offset: 0, limit: 151 },
    { nome: "Johto", offset: 151, limit: 100 },
    { nome: "Hoenn", offset: 251, limit: 135 },
    { nome: "Sinnoh", offset: 386, limit: 107 },
    { nome: "Unova", offset: 493, limit: 156 },
    { nome: "Kalos", offset: 649, limit: 72 },
    { nome: "Alola", offset: 721, limit: 88 },
    { nome: "Galar", offset: 809, limit: 96 },
    { nome: "Paldea", offset: 905, limit: 112 }
  ];

  const typeAdvantages = {
    normal: [],
    fire: ["grass", "ice", "bug", "steel"],
    water: ["fire", "ground", "rock"],
    electric: ["water", "flying"],
    grass: ["water", "ground", "rock"],
    ice: ["grass", "ground", "flying", "dragon"],
    fighting: ["normal", "ice", "rock", "dark", "steel"],
    poison: ["grass", "fairy"],
    ground: ["fire", "electric", "poison", "rock", "steel"],
    flying: ["grass", "fighting", "bug"],
    psychic: ["fighting", "poison"],
    bug: ["grass", "psychic", "dark"],
    rock: ["fire", "ice", "flying", "bug"],
    ghost: ["psychic", "ghost"],
    dragon: ["dragon"],
    dark: ["psychic", "ghost"],
    steel: ["ice", "rock", "fairy"],
    fairy: ["fighting", "dragon", "dark"]
  };

  function getAdvantages(types) {
    const advantages = new Set();
    types.forEach(t => {
      const vantagens = typeAdvantages[t.type.name] || [];
      vantagens.forEach(v => advantages.add(v));
    });
    return Array.from(advantages).join(", ");
  }

  function toggleShiny(name) {
    setShinyStates(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }

  function mudarPagina(regiao, tipo, direcao, total) {
    const chave = `${regiao}-${tipo}`;
    const paginaAtual = pages[chave] || 0;
    const novaPagina = paginaAtual + direcao;
    if (novaPagina < 0 || novaPagina * porPagina >= total) return;

    setPages(prev => ({
      ...prev,
      [chave]: novaPagina
    }));
  }

  async function fetchPokemonsPorRegiao(offset, limit) {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
      const detalhes = await Promise.all(res.data.results.map(p => axios.get(p.url).then(r => r.data)));
      return detalhes;
    } catch {
      setError("Erro ao carregar Pokémon.");
      return [];
    }
  }

  useEffect(() => {
    async function carregarTodasRegioes() {
      const todas = await Promise.all(
        regioes.map(async (r) => {
          const pokemons = await fetchPokemonsPorRegiao(r.offset, r.limit);
          const porTipo = {};

          pokemons.forEach(p => {
            p.types.forEach(t => {
              const tipo = t.type.name;
              if (!porTipo[tipo]) porTipo[tipo] = [];
              porTipo[tipo].push(p);
            });
          });

          return { nome: r.nome, pokemonsPorTipo: porTipo };
        })
      );

      setRegionData(todas);
    }

    carregarTodasRegioes();
  }, []);

  return (
    <div className="container">
      <h1 className="pokemon-title">Pokédex</h1>

      <input
        className="search"
        type="text"
        placeholder="Pesquisar Pokémon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
      />

      {error && <p className="error">{error}</p>}

      {regionData.map((regiao) => (
        <div key={regiao.nome} className="regiao-bloco">
          <h2>{regiao.nome}</h2>

          {Object.entries(regiao.pokemonsPorTipo).map(([tipo, pokemons]) => {
            const filtrados = pokemons.filter(p =>
              p.name.toLowerCase().includes(searchTerm)
            );
            const chave = `${regiao.nome}-${tipo}`;
            const pagina = pages[chave] || 0;
            const inicio = pagina * porPagina;
            const fim = inicio + porPagina;
            const paginados = filtrados.slice(inicio, fim);

            if (filtrados.length === 0) return null;

            return (
              <div key={tipo}>
                <h3>{tipo.toUpperCase()}</h3>
                <div className="pokemon-grid">
                  {paginados.map((p) => (
                    <div key={p.id} className="pokemon-card">
                      <h4>{p.name.toUpperCase()}</h4>
                      <img
                        src={
                          shinyStates[p.name]
                            ? p.sprites.other["official-artwork"].front_shiny
                            : p.sprites.other["official-artwork"].front_default
                        }
                        alt={p.name}
                      />
                      <p>Tipo: {p.types.map(t => t.type.name).join(", ")}</p>
                      <p>Vantagem contra: {getAdvantages(p.types)}</p>
                      <button onClick={() => toggleShiny(p.name)}>Alternar Shiny</button>
                    </div>
                  ))}
                </div>
                {filtrados.length > porPagina && (
                  <div className="paginacao-regiao">
                    <button onClick={() => mudarPagina(regiao.nome, tipo, -1, filtrados.length)}>Anterior</button>
                    <button onClick={() => mudarPagina(regiao.nome, tipo, 1, filtrados.length)}>Próximo</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
