import jwt from 'jsonwebtoken';

const USER_SECRET = process.env.JWT_SECRET || 'veloura_jwt_default_secret_key_2026';
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'veloura_admin_jwt_default_secret_key_2026';

export const generateUserToken = (id) =>
  jwt.sign({ id, role: 'user' }, USER_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const generateAdminToken = (id) =>
  jwt.sign({ id, role: 'admin' }, ADMIN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const getUserSecret = () => USER_SECRET;
export const getAdminSecret = () => ADMIN_SECRET;
