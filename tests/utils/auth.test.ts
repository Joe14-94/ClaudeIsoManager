import { describe, it, expect } from 'vitest';
import { hashPassword } from '../../utils/auth';

describe('hashPassword', () => {
  it('devrait retourner un hash hexadécimal de 64 caractères', async () => {
    const hash = await hashPassword('test123', 'salt');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('devrait produire le même hash pour les mêmes entrées', async () => {
    const hash1 = await hashPassword('password', 'salt');
    const hash2 = await hashPassword('password', 'salt');
    expect(hash1).toBe(hash2);
  });

  it('devrait produire des hashs différents pour des mots de passe différents', async () => {
    const hash1 = await hashPassword('password1', 'salt');
    const hash2 = await hashPassword('password2', 'salt');
    expect(hash1).not.toBe(hash2);
  });

  it('devrait produire des hashs différents pour des sels différents', async () => {
    const hash1 = await hashPassword('password', 'salt1');
    const hash2 = await hashPassword('password', 'salt2');
    expect(hash1).not.toBe(hash2);
  });

  it('devrait gérer les chaînes vides', async () => {
    const hash = await hashPassword('', '');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('devrait gérer les caractères spéciaux', async () => {
    const hash = await hashPassword('p@$$w0rd!#$%^&*()', 'sàlt-ëxtrå');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
