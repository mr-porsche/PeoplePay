import app from './app';
import { runMigrations } from './db/migrations';

const PORT = process.env.PORT || 3001;

runMigrations();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});