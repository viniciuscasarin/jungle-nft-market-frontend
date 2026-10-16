import { describe, it, expect } from 'vitest';
import { sanitizeRedirect, normalizeEmail, normalizeUsername } from './index';

describe('Auth Domain Functions (@nft/auth-domain)', () => {
  describe('sanitizeRedirect()', () => {
    it('preserves valid internal relative paths with query and hash', () => {
      expect(sanitizeRedirect('/checkout')).toBe('/checkout');
      expect(sanitizeRedirect('/checkout?step=review')).toBe('/checkout?step=review');
      expect(sanitizeRedirect('/item/nft-123?sort=asc#activity')).toBe('/item/nft-123?sort=asc#activity');
      expect(sanitizeRedirect('/')).toBe('/');
    });

    it('rejects protocol-relative URLs (//host)', () => {
      expect(sanitizeRedirect('//evil.com')).toBe('/');
      expect(sanitizeRedirect('//phishing.org/path')).toBe('/');
    });

    it('rejects external URLs with protocols', () => {
      expect(sanitizeRedirect('https://evil.com')).toBe('/');
      expect(sanitizeRedirect('http://evil.com')).toBe('/');
      expect(sanitizeRedirect('ftp://files.org')).toBe('/');
    });

    it('rejects dangerous script and data schemes', () => {
      expect(sanitizeRedirect('javascript:alert(1)')).toBe('/');
      expect(sanitizeRedirect('javascript:void(0)')).toBe('/');
      expect(sanitizeRedirect('data:text/html,<script>evil()</script>')).toBe('/');
    });

    it('rejects backslash confusion patterns', () => {
      expect(sanitizeRedirect('/\\evil.com')).toBe('/');
      expect(sanitizeRedirect('\\/evil.com')).toBe('/');
    });

    it('rejects authentication loop routes (/login, /cadastro)', () => {
      expect(sanitizeRedirect('/login')).toBe('/');
      expect(sanitizeRedirect('/cadastro')).toBe('/');
      expect(sanitizeRedirect('/login?redirect=%2Fcheckout')).toBe('/');
      expect(sanitizeRedirect('/cadastro?redirect=%2Fcheckout')).toBe('/');
      expect(sanitizeRedirect('/LOGIN')).toBe('/');
      expect(sanitizeRedirect('/cadastro/')).toBe('/');
    });

    it('handles null, undefined, whitespace, or empty inputs by defaulting to /', () => {
      expect(sanitizeRedirect(null)).toBe('/');
      expect(sanitizeRedirect(undefined)).toBe('/');
      expect(sanitizeRedirect('')).toBe('/');
      expect(sanitizeRedirect('   ')).toBe('/');
    });
  });

  describe('normalizeEmail()', () => {
    it('lowercases and trims email addresses', () => {
      expect(normalizeEmail('  ALEX@Jungle.Market  ')).toBe('alex@jungle.market');
      expect(normalizeEmail('user.name+tag@DOMAIN.COM')).toBe('user.name+tag@domain.com');
    });
  });

  describe('normalizeUsername()', () => {
    it('lowercases and trims usernames', () => {
      expect(normalizeUsername('  Alex_Cooper  ')).toBe('alex_cooper');
      expect(normalizeUsername('VITALIK_01')).toBe('vitalik_01');
    });
  });
});
