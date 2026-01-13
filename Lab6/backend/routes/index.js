import pokemonpageRoutes from './PokemonPage.js';
import pokemonRoutes from './Pokemon.js';

const constructorMethod = (app) => {
  app.use('/api/pokemon/page', pokemonpageRoutes);
  app.use('/api/pokemon', pokemonRoutes);

  app.use(/(.*)/, (req, res) => {
    res.json({error: 'Route not valid'});
  });
};

export default constructorMethod;