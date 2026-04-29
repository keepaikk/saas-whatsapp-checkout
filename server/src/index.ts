import express from 'express';
import cors from 'cors';
import path from 'path';
import businessRoutes from './routes/businesses';
import menuRoutes from './routes/menus';
import orderRoutes from './routes/orders';
import webhookRoutes from './routes/webhook';

const app = express();
const PORT = process.env.PORT || 3001;

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map(o => o.trim()) }));
app.use(express.json());

const uploadStaticPath = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../public/uploads');
app.use('/uploads', express.static(uploadStaticPath));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/businesses', businessRoutes);
app.use('/api/businesses/:businessId/menus', menuRoutes);
app.use('/api/businesses/:businessId/orders', orderRoutes);
app.use('/api/webhook', webhookRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
