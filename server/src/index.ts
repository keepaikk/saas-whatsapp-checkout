import express from 'express';
import cors from 'cors';
import path from 'path';
import businessRoutes from './routes/businesses';
import menuRoutes from './routes/menus';
import orderRoutes from './routes/orders';
import webhookRoutes from './routes/webhook';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/businesses', businessRoutes);
app.use('/api/businesses/:businessId/menus', menuRoutes);
app.use('/api/businesses/:businessId/orders', orderRoutes);
app.use('/api/webhook', webhookRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
