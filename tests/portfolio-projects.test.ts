import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isHiddenPortfolioProject, PORTFOLIO_PROJECTS } from '../src/lib/portfolio-projects';

test('retired projects stay out of the public gallery, including Firestore records', () => {
  assert.equal(isHiddenPortfolioProject({ name: 'Tanzania Connect Engine' }), true);
  assert.equal(isHiddenPortfolioProject({ id: 'tanzania-connect-engine' }), true);
  assert.equal(isHiddenPortfolioProject({ name: 'CareTrack' }), true);
  assert.equal(isHiddenPortfolioProject({ name: 'CareTrack Clinic' }), true);
  assert.equal(isHiddenPortfolioProject({ title: 'Care Track' }), true);
  assert.equal(isHiddenPortfolioProject({ liveUrl: 'https://caretrack-six.vercel.app/dashboard' }), true);
  assert.ok(PORTFOLIO_PROJECTS.every(project => !isHiddenPortfolioProject(project)));
});

test('unrelated projects are not hidden', () => {
  assert.equal(isHiddenPortfolioProject({ name: 'UAUT Connect' }), false);
  assert.equal(isHiddenPortfolioProject({ name: 'Tanzania Reach' }), false);
  assert.equal(isHiddenPortfolioProject({ name: 'Faida POS' }), false);
  assert.equal(isHiddenPortfolioProject({ name: null }), false);
});
