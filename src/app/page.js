"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./globals.css";

export default function Home() {
  const [pokemonName, setPokemonName] = useState("");
  const [pokemonData, setPokemonData] = useState(null);
  const [error, setError] = useState("");
  const [typeList, setTypeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [shinyStates, setShinyStates] = useState({});
  const itemsPerPage = 8;

  const types = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", 
    "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
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
      setShinyStates({});
      setError("");
    } catch (err) {
      setError("Erro ao carregar Pokémon desse tipo.");
    }
  }

  function toggleShiny(name) {
    setShinyStates((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  }

  function getAdvantages(types) {
    return types.flatMap((t) => typeAdvantages[t.type.name] || []).join(", ");
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
            src={shinyStates[pokemonData.name] ? pokemonData.sprites.other["official-artwork"].front_shiny : pokemonData.sprites.other["official-artwork"].front_default}
            alt={pokemonData.name}
          />
          <p>Tipo: {pokemonData.types.map((t) => t.type.name).join(", ")}</p>
          <p>Vantagem contra: {getAdvantages(pokemonData.types)}</p>
          <button onClick={() => toggleShiny(pokemonData.name)}>Alternar Shiny</button>
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
                  src={shinyStates[p.name] ? p.sprites.other["official-artwork"].front_shiny : p.sprites.other["official-artwork"].front_default}
                  alt={p.name}
                />
                <p>Tipo: {p.types.map((t) => t.type.name).join(", ")}</p>
                <p>Vantagem contra: {getAdvantages(p.types)}</p>
                <button onClick={() => toggleShiny(p.name)}>Alternar Shiny</button>
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
