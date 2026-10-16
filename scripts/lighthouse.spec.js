import { describe, it, expect } from 'vitest';
import {
  calculateMedian,
  parseLighthouseReport,
  aggregateMedians,
  generateSummaryMarkdown,
} from './lighthouse.js';

describe('lighthouse runner utilities', () => {
  describe('calculateMedian', () => {
    it('retorna 0 para array vazio ou inválido', () => {
      expect(calculateMedian([])).toBe(0);
      expect(calculateMedian(null)).toBe(0);
    });

    it('calcula mediana de tamanho ímpar', () => {
      expect(calculateMedian([95, 80, 90])).toBe(90);
      expect(calculateMedian([10, 20, 30])).toBe(20);
      expect(calculateMedian([50])).toBe(50);
    });

    it('calcula mediana de tamanho par', () => {
      expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    });
  });

  describe('parseLighthouseReport', () => {
    it('extrai scores arredondados e web vitals do relatório bruto', () => {
      const mockReport = {
        categories: {
          performance: { score: 0.94 },
          accessibility: { score: 0.98 },
          'best-practices': { score: 1.0 },
          seo: { score: 0.92 },
        },
        audits: {
          'largest-contentful-paint': { numericValue: 1845.22 },
          'cumulative-layout-shift': { numericValue: 0.00123 },
          'total-blocking-time': { numericValue: 45.6 },
        },
      };

      const result = parseLighthouseReport(mockReport);
      expect(result).toEqual({
        performance: 94,
        accessibility: 98,
        bestPractices: 100,
        seo: 92,
        lcp: 1845.22,
        cls: 0.0012,
        tbt: 46,
      });
    });

    it('trata campos ausentes com segurança', () => {
      const result = parseLighthouseReport({});
      expect(result).toEqual({
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        lcp: 0,
        cls: 0,
        tbt: 0,
      });
    });
  });

  describe('aggregateMedians', () => {
    it('calcula medianas para todas as métricas de 3 rodadas', () => {
      const runs = [
        {
          performance: 90,
          accessibility: 95,
          bestPractices: 96,
          seo: 92,
          lcp: 2100,
          cls: 0.01,
          tbt: 50,
        },
        {
          performance: 95,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
          lcp: 1900,
          cls: 0,
          tbt: 20,
        },
        {
          performance: 92,
          accessibility: 98,
          bestPractices: 96,
          seo: 95,
          lcp: 2000,
          cls: 0.02,
          tbt: 40,
        },
      ];

      const median = aggregateMedians(runs);
      expect(median).toEqual({
        performance: 92,
        accessibility: 98,
        bestPractices: 96,
        seo: 95,
        lcp: 2000,
        cls: 0.01,
        tbt: 40,
      });
    });
  });

  describe('generateSummaryMarkdown', () => {
    it('produz tabela formatada com cabeçalho e detalhamento', () => {
      const results = [
        {
          name: 'home-desktop',
          route: '/',
          preset: 'desktop',
          runs: [
            { performance: 95, accessibility: 100, bestPractices: 100, seo: 92, lcp: 1200, cls: 0, tbt: 10 },
            { performance: 96, accessibility: 100, bestPractices: 100, seo: 92, lcp: 1100, cls: 0, tbt: 20 },
            { performance: 94, accessibility: 100, bestPractices: 100, seo: 92, lcp: 1300, cls: 0, tbt: 15 },
          ],
          median: {
            performance: 95,
            accessibility: 100,
            bestPractices: 100,
            seo: 92,
            lcp: 1200,
            cls: 0,
            tbt: 15,
          },
        },
      ];

      const md = generateSummaryMarkdown({
        results,
        metadata: {
          date: '2026-10-16',
          nodeVersion: 'v22.13.0',
          lighthouseVersion: '13.5.0',
          browser: 'chrome.exe',
        },
      });

      expect(md).toContain('# Relatório Consolidado de Auditoria Lighthouse');
      expect(md).toContain('home-desktop');
      expect(md).toContain('`/`');
      expect(md).toContain('1.20s');
      expect(md).toContain('100 ✅');
    });
  });
});
