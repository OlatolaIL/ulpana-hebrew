/* eslint-disable @typescript-eslint/no-require-imports */
require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  FREE_DECK_IDS,
  MOM_DECK_IDS,
  isMomDeck,
  isMomPromo,
  isDeckAlwaysFree,
  isDeckAuthRequired,
  getDeckAccessTier,
} = require('../src/lib/permissions');

const { MOM_DECKS } = require('../src/data/professionalDecks/mom');

test('Mom Decks: all 7 mom decks are defined in MOM_DECKS', () => {
  assert.equal(MOM_DECKS.length, 7, 'Expected 7 professional decks for moms');
  const expectedDeckIds = [
    'mom-infant',
    'mom-pediatrician',
    'mom-pharmacy',
    'mom-kindergarten',
    'mom-school',
    'mom-whatsapp',
    'mom-playground',
  ];
  for (const id of expectedDeckIds) {
    const deck = MOM_DECKS.find((d) => d.id === id);
    assert.ok(deck, `Deck with id ${id} must exist in MOM_DECKS`);
    assert.equal(deck.category, 'mom');
    assert.ok(deck.words.length > 0, `Deck ${id} must contain words`);
    assert.ok(isMomDeck(id), `isMomDeck('${id}') must return true`);
  }
});

test('Mom Decks: isMomPromo recognizes LATTE_MAMA and MOMS', () => {
  assert.equal(isMomPromo('LATTE_MAMA'), true);
  assert.equal(isMomPromo('latte_mama'), true);
  assert.equal(isMomPromo('  Latte_Mama  '), true);
  assert.equal(isMomPromo('MOMS'), true);
  assert.equal(isMomPromo('moms'), true);
  assert.equal(isMomPromo('OTHER'), false);
  assert.equal(isMomPromo(null), false);
  assert.equal(isMomPromo(undefined), false);
});

test('Mom Decks: without mom promo, mom decks require auth and are not always free', () => {
  for (const deckId of MOM_DECK_IDS) {
    assert.equal(
      isDeckAlwaysFree(deckId),
      false,
      `Without promo, isDeckAlwaysFree('${deckId}') must return false`
    );
    assert.equal(
      isDeckAlwaysFree(deckId, 'OTHER_PROMO'),
      false,
      `With other promo, isDeckAlwaysFree('${deckId}') must return false`
    );
    assert.equal(
      isDeckAuthRequired(deckId, false),
      true,
      `Without promo, isDeckAuthRequired('${deckId}', false) must return true for guests`
    );
  }
});

test('Mom Decks: with promo LATTE_MAMA or MOMS, all 7 mom decks are always_free', () => {
  for (const code of ['LATTE_MAMA', 'latte_mama', 'MOMS', 'moms']) {
    for (const deckId of MOM_DECK_IDS) {
      assert.equal(
        isDeckAlwaysFree(deckId, code),
        true,
        `With promo ${code}, isDeckAlwaysFree('${deckId}', '${code}') must return true`
      );
      assert.equal(
        isDeckAuthRequired(deckId, true, code),
        false,
        `With promo ${code} and logged in, isDeckAuthRequired('${deckId}', true, '${code}') must return false`
      );
      assert.equal(
        getDeckAccessTier(deckId, false, code),
        'always_free',
        `With promo ${code}, getDeckAccessTier('${deckId}', false, '${code}') must return 'always_free'`
      );
    }
  }
});
