import blogRoutes from './blogs.js';

const constructorMethod = (app) => {
  app.use('/blog', blogRoutes);

  app.use(/.*/, (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;