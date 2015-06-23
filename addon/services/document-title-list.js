import Ember from 'ember';

const get = Ember.get;
const { set, copy } = Ember;

export default Ember.Service.extend({

  init() {
    this._super();
    set(this, 'tokens', Ember.A());
    set(this, 'length', 0);
  },

  push(token) {
    let tokenForId = this.tokens.findBy('id', token.id);
    if (tokenForId) {
      let index = this.tokens.indexOf(tokenForId);
      let tokens = copy(this.tokens);
      let previous = tokenForId.previous;
      token.previous = previous;
      token.next = tokenForId.next;
      if (previous) {
        if (token.separator == null) {
          token.separator = previous.separator;
        }

        if (token.prepend == null) {
          token.prepend = previous.prepend;
        }
      }
      tokens.splice(index, 1, token);
      set(this, 'tokens', Ember.A(tokens));
      return;
    }

    var previous = this.tokens.slice(-1)[0];
    if (previous) {
      token.previous = previous;
      previous.next = token;

      if (token.separator == null) {
        token.separator = previous.separator;
      }

      if (token.prepend == null) {
        token.prepend = previous.prepend;
      }
    }

    let tokens = copy(this.tokens);
    tokens.push(token);
    set(this, 'tokens', Ember.A(tokens));
    set(this, 'length', get(this, 'length') + 1);
  },

  remove(id) {
    let token = this.tokens.findBy('id', id);
    var next = token.next;
    var previous = token.previous;
    if (next) {
      next.previous = previous;
    }

    if (previous) {
      previous.next = next;
    }

    token.previous = token.next = null;

    let tokens = Ember.A(copy(this.tokens));
    tokens.removeObject(token);
    set(this, 'tokens', Ember.A(tokens));
    set(this, 'length', get(this, 'length') - 1);
  },

  displayTokens: Ember.computed('tokens', {
    get() {
      let tokens = get(this, 'tokens');
      let i = tokens.length;
      let visible = [];
      while (i--) {
        let token = tokens[i];
        if (token.replace) {
          visible.unshift(token);
          break;
        } else {
          visible.unshift(token);
        }
      }

      let appending = true;
      let group = [];
      let groups = Ember.A([group]);
      visible.forEach((token) => {
        if (token.prepend) {
          if (appending) {
            appending = false;
            group = [];
            groups.push(group);
          }
          let lastToken = group[0];
          if (lastToken) {
            token = copy(token);
            token.separator = lastToken.separator;
          }
          group.unshift(token);
        } else {
          if (!appending) {
            appending = true;
            group = [];
            groups.push(group);
          }
          group.push(token);
        }
      });

      let sorted = groups.reduce((E, group) => E.concat(group), []);
      return sorted;
    }
  }),

  toString() {
    let tokens = get(this, 'displayTokens');
    let title = [];
    for (let i = 0, len = tokens.length; i < len; i++) {
      let token = tokens[i];
      title.push(token.title);
      if (i + 1 < len) {
        title.push(token.separator);
      }
    }
    return title.join('');
  }
});