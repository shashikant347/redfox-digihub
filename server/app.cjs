// Startup file for cPanel "Setup Node.js App" (Passenger).
// Passenger loads the startup file as CommonJS; the server itself is an ES module,
// so this tiny file loads it with a dynamic import.
import('./src/index.js').catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
