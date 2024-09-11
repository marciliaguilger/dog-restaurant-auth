import { Request, Response, Router } from 'express';

const router = Router();

router.post('/auth', (req: Request, res: Response) => {
    const { username, password } = req.body;
  
    // Lógica de autenticação (exemplo simples)
    if (username === 'admin' && password === 'password') {
      res.status(200).json({ message: 'Authenticated' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

export default router;