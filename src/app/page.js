"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./globals.css";

export default function Home() {
  const [pokemonName, setPokemonName] = useState("");
  const [pokemonData, setPokemonData] = useState(null);
  const [error, setError] = useState("");
  const [pokemonList, setPokemonList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [allPokemon, setAllPokemon] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const types = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", 
    "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
  ];

  useEffect(() => {
    async function fetchAllPokemon() {
      try {
        const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=151");
        const detailedData = await Promise.all(
          response.data.results.map(async (pokemon) => {
            const res = await axios.get(pokemon.url);
            return res.data;
          })
        );
        setAllPokemon(detailedData);
      } catch (err) {
        setError("Erro ao carregar a lista de Pokémon.");
      }
    }
    fetchAllPokemon();
  }, []);

  async function fetchPokemon() {
    if (!pokemonName.trim()) return;
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
      );
      setPokemonData(response.data);
      setError("");
    } catch (err) {
      setPokemonData(null);
      setError("Pokémon não encontrado! Tente novamente.");
    }
  }

  async function fetchPokemonByType(type) {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
      const detailedData = await Promise.all(
        response.data.pokemon.slice(0, 20).map(async (p) => {
          const res = await axios.get(p.pokemon.url);
          return res.data;
        })
      );
      setTypeList(detailedData);
      setCurrentPage(0);
      setError("");
    } catch (err) {
      setError("Erro ao carregar Pokémon desse tipo.");
    }
  }

  const displayedPokemon = typeList.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="container">
    <h1 className="pokemon-title">Pokédex</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Digite o nome do Pokémon"
          value={pokemonName}
          onChange={(e) => setPokemonName(e.target.value)}
        />
        <button onClick={fetchPokemon}>Procurar</button>
      </div>

      <div className="button-container">
        {types.map((type) => (
          <button key={type} onClick={() => fetchPokemonByType(type)}>
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      {pokemonData && (
        <div className="pokemon-card">
          <h2>{pokemonData.name.toUpperCase()}</h2>
          <img
            src={pokemonData.sprites.other["official-artwork"].front_default}
            alt={pokemonData.name}
          />
          <p>Tipo: {pokemonData.types.map((t) => t.type.name).join(", ")}</p>
          <p>Poder: {pokemonData.stats[0].base_stat}</p>
        </div>
      )}

      {displayedPokemon.length > 0 && (
        <div className="pokemon-list">
          <h2>Pokémon do Tipo</h2>
          <div className="pokemon-grid">
            {displayedPokemon.map((p, index) => (
              <div key={index} className="pokemon-card">
                <h3>{p.name.toUpperCase()}</h3>
                <img
                  src={p.sprites.other["official-artwork"].front_default}
                  alt={p.name}
                />
                <p>Tipo: {p.types.map((t) => t.type.name).join(", ")}</p>
                <p>Poder: {p.stats[0].base_stat}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            {currentPage > 0 && (
              <button onClick={() => setCurrentPage(currentPage - 1)}>Anterior</button>
            )}
            {currentPage < Math.ceil(typeList.length / itemsPerPage) - 1 && (
              <button onClick={() => setCurrentPage(currentPage + 1)}>Próximo</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
