const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`AI Ticket It: servidor disponible en http://localhost:${port}`);
});
