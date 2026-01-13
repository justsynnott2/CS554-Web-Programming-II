import blogRoutes from './blogs.js';
import mostPopularRoutes from './mostPopular.js';

const constructorMethod = (app) => {
  app.use('/blog', blogRoutes);
  app.use('/mostpopular', mostPopularRoutes);

  app.use(/.*/, (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;