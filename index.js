const app = require('./app');

// Define port
const PORT = process.env.PORT || 3000;

// Start server
if (process.env.NODE_ENV !== 'test') {
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
}