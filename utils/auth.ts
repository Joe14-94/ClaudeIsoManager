
/**
 * Hache un mot de passe avec un sel en utilisant l'algorithme SHA-256.
 * @param password Le mot de passe en clair à hacher.
 * @param salt Le sel à concaténer au mot de passe avant le hachage.
 * @returns Une promesse qui se résout avec le hash hexadécimal.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
