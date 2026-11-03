import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalizeDomainId,
  canonicalizeDomainIds,
  DOMAIN_CATALOG,
} from './taxonomy.ts';

const expectedDomainIds = [
  'web_development',
  'ai_ml',
  'cloud_devops',
  'iot_embedded',
  'data_analytics',
  'cybersecurity',
  'mobile_dev',
];

test('all seven catalog choices use the model canonical IDs and retain labels', () => {
  assert.deepEqual(DOMAIN_CATALOG.map(({ id }) => id), expectedDomainIds);
  assert.deepEqual(
    canonicalizeDomainIds(DOMAIN_CATALOG.map(({ id }) => id)),
    expectedDomainIds,
  );
  assert.deepEqual(
    DOMAIN_CATALOG.map(({ name }) => name),
    [
      'Full-Stack Web Development',
      'Applied AI & Machine Learning',
      'Cloud Architecture & DevOps',
      'IoT & Embedded Systems',
      'Data Engineering & Big Data',
      'Cybersecurity & Defense',
      'Mobile App Development',
    ],
  );
});

test('legacy profile labels map to canonical IDs case-insensitively', () => {
  const legacyLabels = [
    'Full-Stack Web Development',
    'Artificial Intelligence',
    'Cloud Computing',
    'Internet of Things',
    'Data Science',
    'Cybersecurity',
    'Mobile App Development',
  ];

  assert.deepEqual(canonicalizeDomainIds(legacyLabels), expectedDomainIds);
});

test('unknown profile domains pass through unchanged and input arrays are not mutated', () => {
  const existingDomains = ['Unknown Faculty Track', ' AI '];
  const originalDomains = existingDomains.slice();

  assert.equal(canonicalizeDomainId(existingDomains[0]), existingDomains[0]);
  assert.deepEqual(canonicalizeDomainIds(existingDomains), ['Unknown Faculty Track', 'ai_ml']);
  assert.deepEqual(existingDomains, originalDomains);
});
