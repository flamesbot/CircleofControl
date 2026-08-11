const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Circle of Control - App Logic', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Load the HTML file
    const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

    // Create a new JSDOM instance with dangerously runScripts so the inline script executes
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    window = dom.window;
    document = window.document;

    // Clear the concerns array for testing addConcern
    window.eval("concerns.length = 0; Object.keys(placements).forEach(k => delete placements[k]);");
  });

  describe('show(id)', () => {
    it('should show the target screen and hide others', () => {
      // Screens are originally set up so s1 is active
      const s1 = document.getElementById('s1');
      const s2 = document.getElementById('s2');

      expect(s1.classList.contains('active')).toBe(true);
      expect(s2.classList.contains('active')).toBe(false);

      // Call show('s2')
      window.show('s2');

      // Now s2 should be active and s1 should not be
      expect(s1.classList.contains('active')).toBe(false);
      expect(s2.classList.contains('active')).toBe(true);
    });
  });

  describe('findHint(text)', () => {
    it('should return a hint when a known keyword is found', () => {
      // HINTS contains 'sleep' keyword
      const hint = window.findHint('I need more sleep tonight');
      expect(hint).toBeTruthy();
      expect(typeof hint).toBe('string');
      expect(hint).toContain('Sleep is highly controllable');
    });

    it('should return null when no known keyword is found', () => {
      const hint = window.findHint('this is some random text with no keywords');
      expect(hint).toBeNull();
    });

    it('should be case-insensitive', () => {
      const hint1 = window.findHint('SLEEP');
      const hint2 = window.findHint('sleep');
      expect(hint1).toBe(hint2);
      expect(hint1).not.toBeNull();
    });
  });

  describe('addConcern(txt)', () => {
    it('should add a valid concern to the concerns array and render chips', () => {
      const chipsEl = document.getElementById('chips');
      const initialChipsCount = chipsEl.children.length;
      expect(window.eval("concerns").length).toBe(0);

      window.addConcern('Test concern');

      expect(window.eval("concerns").length).toBe(1);
      expect(window.eval("concerns")[0].text).toBe('Test concern');
      expect(window.eval("placements")[window.eval("concerns")[0].id]).toBe('unsorted');

      // Check DOM updates
      expect(chipsEl.children.length).toBe(initialChipsCount + 1);
      expect(chipsEl.textContent).toContain('Test concern');
    });

    it('should not add empty concerns', () => {
      window.addConcern('');
      window.addConcern('   ');
      expect(window.eval("concerns").length).toBe(0);
    });

    it('should not add duplicate concerns (case-insensitive)', () => {
      window.addConcern('My concern');
      expect(window.eval("concerns").length).toBe(1);

      window.addConcern('my concern');
      expect(window.eval("concerns").length).toBe(1);
    });
  });
});
