import { describe, it, expect } from 'vitest';
import {
  CURRENT_VERSION,
  MAX_POKEMON_ID,
  GENERATIONS,
  LEGENDARY_IDS,
  RARE_IDS,
  UNCOMMON_IDS,
  STARTER_IDS,
  getAvailableGenerations,
  getPokemonRarity,
  getRandomPokemonId,
  getStarterPokemonId,
  getPokemonSprite,
  getPokemonOfficialArtwork,
  getPokemonAnimatedSprite,
} from './pokemonConfig';

describe('pokemonConfig', () => {
  describe('constants', () => {
    it('should have valid current version', () => {
      expect(CURRENT_VERSION).toBe('1.0');
    });

    it('should have MAX_POKEMON_ID set to 151 (Gen 1)', () => {
      expect(MAX_POKEMON_ID).toBe(151);
    });

    it('should have 9 generations defined', () => {
      expect(GENERATIONS).toHaveLength(9);
    });

    it('should have correct Generation 1 definition', () => {
      const gen1 = GENERATIONS[0];
      expect(gen1.name).toBe('Generation I');
      expect(gen1.region).toBe('Kanto');
      expect(gen1.startId).toBe(1);
      expect(gen1.endId).toBe(151);
    });
  });

  describe('Pokemon ID lists', () => {
    describe('LEGENDARY_IDS', () => {
      it('should contain the legendary birds and Mew/Mewtwo', () => {
        expect(LEGENDARY_IDS).toContain(144); // Articuno
        expect(LEGENDARY_IDS).toContain(145); // Zapdos
        expect(LEGENDARY_IDS).toContain(146); // Moltres
        expect(LEGENDARY_IDS).toContain(150); // Mewtwo
        expect(LEGENDARY_IDS).toContain(151); // Mew
      });

      it('should have IDs within Gen 1 range', () => {
        LEGENDARY_IDS.forEach(id => {
          expect(id).toBeGreaterThanOrEqual(1);
          expect(id).toBeLessThanOrEqual(151);
        });
      });

      it('should have unique IDs', () => {
        const unique = new Set(LEGENDARY_IDS);
        expect(unique.size).toBe(LEGENDARY_IDS.length);
      });
    });

    describe('RARE_IDS', () => {
      it('should contain fully evolved starters', () => {
        expect(RARE_IDS).toContain(3);  // Venusaur
        expect(RARE_IDS).toContain(6);  // Charizard
        expect(RARE_IDS).toContain(9);  // Blastoise
      });

      it('should contain other rare Pokemon', () => {
        expect(RARE_IDS).toContain(130); // Gyarados
        expect(RARE_IDS).toContain(143); // Snorlax
        expect(RARE_IDS).toContain(149); // Dragonite
      });

      it('should not overlap with legendary IDs', () => {
        RARE_IDS.forEach(id => {
          expect(LEGENDARY_IDS).not.toContain(id);
        });
      });
    });

    describe('UNCOMMON_IDS', () => {
      it('should contain middle evolutions', () => {
        expect(UNCOMMON_IDS).toContain(2);  // Ivysaur
        expect(UNCOMMON_IDS).toContain(5);  // Charmeleon
        expect(UNCOMMON_IDS).toContain(8);  // Wartortle
      });

      it('should contain Pikachu', () => {
        expect(UNCOMMON_IDS).toContain(25);
      });

      it('should not overlap with legendary or rare IDs', () => {
        UNCOMMON_IDS.forEach(id => {
          expect(LEGENDARY_IDS).not.toContain(id);
          expect(RARE_IDS).not.toContain(id);
        });
      });
    });

    describe('STARTER_IDS', () => {
      it('should contain the Gen 1 starters and Pikachu', () => {
        expect(STARTER_IDS).toContain(1);   // Bulbasaur
        expect(STARTER_IDS).toContain(4);   // Charmander
        expect(STARTER_IDS).toContain(7);   // Squirtle
        expect(STARTER_IDS).toContain(25);  // Pikachu
      });

      it('should have exactly 4 starters', () => {
        expect(STARTER_IDS).toHaveLength(4);
      });
    });

    describe('no overlapping categories', () => {
      it('should have distinct legendary, rare, and uncommon lists', () => {
        const allSpecial = [...LEGENDARY_IDS, ...RARE_IDS, ...UNCOMMON_IDS];
        const unique = new Set(allSpecial);
        expect(unique.size).toBe(allSpecial.length);
      });
    });
  });

  describe('getAvailableGenerations', () => {
    it('should return only Gen 1 with current MAX_POKEMON_ID', () => {
      const generations = getAvailableGenerations();
      expect(generations).toHaveLength(1);
      expect(generations[0].name).toBe('Generation I');
    });

    it('should return generations that start within MAX_POKEMON_ID', () => {
      const generations = getAvailableGenerations();
      generations.forEach(gen => {
        expect(gen.startId).toBeLessThanOrEqual(MAX_POKEMON_ID);
      });
    });
  });

  describe('getPokemonRarity', () => {
    it('should return "legendary" for legendary Pokemon', () => {
      LEGENDARY_IDS.forEach(id => {
        expect(getPokemonRarity(id)).toBe('legendary');
      });
    });

    it('should return "rare" for rare Pokemon', () => {
      RARE_IDS.forEach(id => {
        expect(getPokemonRarity(id)).toBe('rare');
      });
    });

    it('should return "uncommon" for uncommon Pokemon', () => {
      UNCOMMON_IDS.forEach(id => {
        expect(getPokemonRarity(id)).toBe('uncommon');
      });
    });

    it('should return "common" for non-special Pokemon', () => {
      // Test some known common Pokemon
      const commonIds = [10, 11, 12, 13, 14, 16, 17, 19, 20]; // Caterpie, Metapod, Butterfree, etc.
      commonIds.forEach(id => {
        if (!LEGENDARY_IDS.includes(id) && !RARE_IDS.includes(id) && !UNCOMMON_IDS.includes(id)) {
          expect(getPokemonRarity(id)).toBe('common');
        }
      });
    });
  });

  describe('getRandomPokemonId', () => {
    const runMultipleTimes = <T>(fn: () => T, iterations = 100): T[] => {
      return Array.from({ length: iterations }, fn);
    };

    it('should always return valid Pokemon IDs', () => {
      const ids = runMultipleTimes(() => getRandomPokemonId(5), 200);
      ids.forEach(id => {
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(MAX_POKEMON_ID);
      });
    });

    it('should not return legendaries at difficulty below 5', () => {
      const ids = runMultipleTimes(() => getRandomPokemonId(1), 200);
      ids.forEach(id => {
        expect(LEGENDARY_IDS).not.toContain(id);
      });
    });

    it('should not return rares at difficulty below 3', () => {
      const ids = runMultipleTimes(() => getRandomPokemonId(1), 200);
      ids.forEach(id => {
        expect(RARE_IDS).not.toContain(id);
      });
    });

    it('should have chance for legendaries at high difficulty', () => {
      // Run many times at max difficulty
      const ids = runMultipleTimes(() => getRandomPokemonId(10), 1000);
      const hasLegendary = ids.some(id => LEGENDARY_IDS.includes(id));
      // With 10% chance, should get at least one in 1000 tries
      expect(hasLegendary).toBe(true);
    });

    it('should return integers only', () => {
      const ids = runMultipleTimes(() => getRandomPokemonId(5), 100);
      ids.forEach(id => {
        expect(Number.isInteger(id)).toBe(true);
      });
    });
  });

  describe('getStarterPokemonId', () => {
    it('should return starters for first 4 catches', () => {
      expect(getStarterPokemonId(0)).toBe(1);   // Bulbasaur
      expect(getStarterPokemonId(1)).toBe(4);   // Charmander
      expect(getStarterPokemonId(2)).toBe(7);   // Squirtle
      expect(getStarterPokemonId(3)).toBe(25);  // Pikachu
    });

    it('should return random Pokemon after 4th catch', () => {
      const id = getStarterPokemonId(4);
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(MAX_POKEMON_ID);
    });

    it('should return random for any catch number >= starter count', () => {
      const ids = Array.from({ length: 100 }, () => getStarterPokemonId(10));
      ids.forEach(id => {
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(MAX_POKEMON_ID);
      });
    });
  });

  describe('sprite URL functions', () => {
    describe('getPokemonSprite', () => {
      it('should return correct sprite URL format', () => {
        const url = getPokemonSprite(25);
        expect(url).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png');
      });

      it('should work for any valid Pokemon ID', () => {
        const url1 = getPokemonSprite(1);
        const url151 = getPokemonSprite(151);

        expect(url1).toContain('/1.png');
        expect(url151).toContain('/151.png');
      });
    });

    describe('getPokemonOfficialArtwork', () => {
      it('should return correct official artwork URL format', () => {
        const url = getPokemonOfficialArtwork(25);
        expect(url).toContain('official-artwork');
        expect(url).toContain('/25.png');
      });
    });

    describe('getPokemonAnimatedSprite', () => {
      it('should return correct animated sprite URL format', () => {
        const url = getPokemonAnimatedSprite(25);
        expect(url).toContain('showdown');
        expect(url).toContain('/25.gif');
      });
    });
  });

  describe('coverage of all Pokemon', () => {
    it('should categorize all Gen 1 Pokemon', () => {
      for (let id = 1; id <= MAX_POKEMON_ID; id++) {
        const rarity = getPokemonRarity(id);
        expect(['common', 'uncommon', 'rare', 'legendary']).toContain(rarity);
      }
    });

    it('should have reasonable distribution of rarities', () => {
      let legendary = 0;
      let rare = 0;
      let uncommon = 0;
      let common = 0;

      for (let id = 1; id <= MAX_POKEMON_ID; id++) {
        const rarity = getPokemonRarity(id);
        switch (rarity) {
          case 'legendary': legendary++; break;
          case 'rare': rare++; break;
          case 'uncommon': uncommon++; break;
          case 'common': common++; break;
        }
      }

      // Verify distribution makes sense
      expect(legendary).toBe(LEGENDARY_IDS.length);
      expect(rare).toBe(RARE_IDS.length);
      expect(uncommon).toBe(UNCOMMON_IDS.length);
      expect(common).toBe(MAX_POKEMON_ID - legendary - rare - uncommon);

      // Common should be the majority
      expect(common).toBeGreaterThan(rare);
      expect(common).toBeGreaterThan(uncommon);
      expect(common).toBeGreaterThan(legendary);
    });
  });
});
