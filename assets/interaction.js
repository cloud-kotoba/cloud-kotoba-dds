(() => {
  // work/runtime/node_modules/squint-cljs/src/squint/core.js
  var has = Object.prototype.hasOwnProperty;
  function findKey(iter, tar, key) {
    for (key of iter.keys()) {
      if (dequal(key, tar)) return key;
    }
  }
  function isSortedMap(m) {
    return m != null && m[SORTED_TAG] === true && m[TYPE_TAG] === MAP_TYPE;
  }
  function isSetLike(s) {
    return s != null && (s instanceof Set || s[TYPE_TAG] === SET_TYPE);
  }
  function isMapLike(m) {
    return m != null && typeof m === "object" && (m.constructor === Object || m instanceof Map || m[TYPE_TAG] === MAP_TYPE);
  }
  function mapHas(m, k) {
    return m instanceof Map || m[TYPE_TAG] === MAP_TYPE ? m.has(k) : has.call(m, k);
  }
  function mapGet(m, k) {
    return m instanceof Map || m[TYPE_TAG] === MAP_TYPE ? m.get(k) : m[k];
  }
  function mapCount(m) {
    return m instanceof Map || m[TYPE_TAG] === MAP_TYPE ? m.size : Object.keys(m).length;
  }
  function dequalSameCtor(foo, bar, ctor) {
    var len;
    if (ctor === Array) {
      if ((len = foo.length) === bar.length) {
        while (len-- && dequal(foo[len], bar[len])) ;
      }
      return len === -1;
    }
    len = 0;
    for (const k in foo) {
      if (has.call(foo, k) && ++len && !has.call(bar, k)) return false;
      if (!(k in bar) || !dequal(foo[k], bar[k])) return false;
    }
    return Object.keys(bar).length === len;
  }
  function dequal(foo, bar) {
    if (foo === bar) return true;
    if (foo == null) return bar == null;
    if (bar == null) return false;
    if (typeof foo !== "object" || typeof bar !== "object") return false;
    var ctor = foo.constructor, tmp;
    if (ctor === bar.constructor && (ctor === Object || ctor === Array)) {
      return dequalSameCtor(foo, bar, ctor);
    }
    if (typeof foo === "object" && foo[IEquiv__equiv] !== void 0) return !!foo[IEquiv__equiv](foo, bar);
    if (typeof bar === "object" && bar[IEquiv__equiv] !== void 0) return !!bar[IEquiv__equiv](bar, foo);
    const fooSorted = isSortedMap(foo);
    if (fooSorted || isSortedMap(bar)) {
      const sm = fooSorted ? foo : bar;
      const other = sm === foo ? bar : foo;
      if (!isMapLike(other) || mapCount(sm) !== mapCount(other)) return false;
      for (const k of sm.keys()) {
        if (!mapHas(other, k) || !dequal(sm.get(k), mapGet(other, k))) return false;
      }
      return true;
    }
    if (isMapLike(foo) && isMapLike(bar) && foo.constructor !== bar.constructor) {
      if (mapCount(foo) !== mapCount(bar)) return false;
      for (const k of foo instanceof Map ? foo.keys() : Object.keys(foo)) {
        if (!mapHas(bar, k) || !dequal(mapGet(foo, k), mapGet(bar, k))) return false;
      }
      return true;
    }
    if (isSetLike(foo) || isSetLike(bar)) {
      if (!isSetLike(foo) || !isSetLike(bar) || foo.size !== bar.size) return false;
      for (let e of foo) {
        if (e && typeof e === "object") {
          e = findKey(bar, e);
          if (!e) return false;
        }
        if (!bar.has(e)) return false;
      }
      return true;
    }
    if (foo && bar && ctor === bar.constructor) {
      if (ctor === Date) return foo.getTime() === bar.getTime();
      if (ctor === RegExp) return false;
      if (ctor === Map) {
        if (foo.size !== bar.size) {
          return false;
        }
        for (const kv of foo) {
          tmp = kv[0];
          if (tmp && typeof tmp === "object") {
            tmp = findKey(bar, tmp);
            if (!tmp) return false;
          }
          if (!dequal(kv[1], bar.get(tmp))) {
            return false;
          }
        }
        return true;
      }
      if ((!ctor || typeof foo === "object") && foo[TYPE_TAG] !== LAZY_ITERABLE_TYPE) {
        return dequalSameCtor(foo, bar, Object);
      }
    }
    if (foo && bar && (Array.isArray(foo) || foo[TYPE_TAG] === LAZY_ITERABLE_TYPE) && (Array.isArray(bar) || bar[TYPE_TAG] === LAZY_ITERABLE_TYPE)) {
      const fi = foo[Symbol.iterator]();
      const bi = bar[Symbol.iterator]();
      for (; ; ) {
        const a = fi.next();
        const b = bi.next();
        if (a.done || b.done) return !!(a.done && b.done);
        if (!dequal(a.value, b.value)) return false;
      }
    }
    return false;
  }
  function walkArray(arr, comp) {
    return arr.every(function(x, i) {
      return i === 0 || comp(arr[i - 1], x);
    });
  }
  function _EQ_(...xs) {
    return walkArray(xs, (x, y) => dequal(x, y));
  }
  var MAP_TYPE = 1;
  var ARRAY_TYPE = 2;
  var OBJECT_TYPE = 3;
  var LIST_TYPE = 4;
  var SET_TYPE = 5;
  var LAZY_ITERABLE_TYPE = 6;
  var INSTANCE_TYPE = 7;
  var TYPE_TAG = /* @__PURE__ */ Symbol.for("squint.core/type");
  var SORTED_TAG = /* @__PURE__ */ Symbol.for("squint.core/sorted");
  // @__NO_SIDE_EFFECTS__
  function defclass(c) {
    return c;
  }
  function isObj(coll) {
    return coll.constructor === Object;
  }
  function isVectorArray(x) {
    return Array.isArray(x) && x[TYPE_TAG] !== LIST_TYPE;
  }
  function object_QMARK_(coll) {
    return coll != null && isObj(coll);
  }
  function typeConst(obj) {
    if (obj == null) {
      return void 0;
    }
    if (isObj(obj)) {
      return OBJECT_TYPE;
    }
    if (obj instanceof Map) return MAP_TYPE;
    if (obj instanceof Set) return SET_TYPE;
    const tag = obj[TYPE_TAG];
    if (tag !== void 0) return tag;
    if (isVectorArray(obj)) return ARRAY_TYPE;
    if (typeof obj === "object") return INSTANCE_TYPE;
    return void 0;
  }
  function contains_QMARK_(coll, v) {
    if (typeof coll === "string") {
      return int_QMARK_(v) && v >= 0 && v < coll.length;
    }
    switch (typeConst(coll)) {
      case SET_TYPE:
      case MAP_TYPE:
        return coll.has(v);
      case void 0:
        return false;
      case INSTANCE_TYPE:
        if (coll[IAssociative__contains_key_QMARK_] !== void 0) {
          return coll[IAssociative__contains_key_QMARK_](coll, v);
        }
      // fall through
      default:
        return v in coll;
    }
  }
  function nth(coll, idx, orElse) {
    if (typeof idx !== "number") {
      throw new Error("Index argument to nth must be a number");
    }
    const hasDefault = arguments.length > 2;
    if (coll == null) return hasDefault ? orElse : null;
    if (Array.isArray(coll)) {
      if (idx >= 0 && idx < coll.length) {
        return coll[idx];
      }
    } else if (coll[IIndexed__nth] !== void 0) {
      return hasDefault ? coll[IIndexed__nth](coll, idx, orElse) : coll[IIndexed__nth](coll, idx);
    } else if (idx >= 0) {
      const next = chunkCursor(coll);
      let base = 0;
      let ch;
      while ((ch = next()) !== null) {
        if (idx < base + ch.length) return ch[idx - base];
        base += ch.length;
      }
    }
    if (hasDefault) return orElse;
    throw new Error("Index out of bounds: " + idx);
  }
  function get(coll, key, otherwise = void 0) {
    if (coll == null) {
      return otherwise;
    }
    let v;
    if (isObj(coll)) {
      v = coll[key];
      if (v === void 0) {
        return otherwise;
      } else {
        return v;
      }
    }
    let g;
    switch (typeConst(coll)) {
      case SET_TYPE:
        if (coll.has(key)) v = key;
        break;
      case MAP_TYPE:
        v = coll.get(key);
        break;
      case ARRAY_TYPE:
        v = coll[key];
        break;
      default:
        if (coll[ILookup__lookup] !== void 0) {
          v = coll[ILookup__lookup](coll, key, otherwise);
          return v === void 0 ? otherwise : v;
        }
        g = coll["get"];
        if (typeof g === "function") {
          try {
            v = coll.get(key);
            break;
          } catch (e) {
          }
        }
        v = coll[key];
        break;
    }
    return v !== void 0 ? v : otherwise;
  }
  function seqable_QMARK_(x) {
    return x === null || x === void 0 || // plain objects (squint maps) are seqable via Object.entries in `iterable`,
    // even though they lack Symbol.iterator.
    object_QMARK_(x) || // we used to check instanceof Object but this returns false for TC39 Records
    // also we used to write `Symbol.iterator in` but this does not work for strings and some other types
    !!x[Symbol.iterator] || !!x[ISEQABLE_SYM];
  }
  var MAP_ENTRY = /* @__PURE__ */ Symbol.for("squint.core/map-entry");
  function tagMapEntry(e) {
    e[MAP_ENTRY] = true;
    return e;
  }
  function iterable(x) {
    if (x === null || x === void 0) {
      return [];
    }
    if (x[Symbol.iterator]) {
      return x;
    }
    if (x[ISeqable__seq] !== void 0) return iterable(x[ISeqable__seq](x));
    if (isObj(x)) return Object.entries(x).map(tagMapEntry);
    throw new TypeError(`${x} is not iterable`);
  }
  var IIterable = /* @__PURE__ */ Symbol.for("squint.core/IIterable");
  function _iterator(coll) {
    return coll[Symbol.iterator]();
  }
  var es6_iterator = _iterator;
  function seq(x) {
    if (x == null) return x;
    if (!seqable_QMARK_(x)) throw new TypeError(x + " is not ISeqable");
    if (typeof x === "string") return x.length ? [...x] : null;
    const iter = iterable(x);
    if (iter.length === 0 || iter.size === 0) {
      return null;
    }
    if (iter instanceof Set || iter[TYPE_TAG] === SET_TYPE) {
      return [...iter];
    }
    if (iter instanceof Map || iter[TYPE_TAG] === MAP_TYPE) {
      return [...iter].map(tagMapEntry);
    }
    if (iter[IMap__dissoc] !== void 0) {
      const entries = [...iter].map(tagMapEntry);
      return entries.length === 0 ? null : entries;
    }
    const _i = iter[Symbol.iterator]();
    if (_i.next().done) return null;
    return iter;
  }
  var CHUNK_SIZE = 32;
  var LazyIterable = /* @__PURE__ */ defclass(
    class LazyIterable2 {
      constructor(step) {
        this[TYPE_TAG] = LAZY_ITERABLE_TYPE;
        this[IIterable] = true;
        this.step = step;
        this.realized = false;
        this.chunk = null;
        this._rest = null;
      }
      force() {
        if (!this.realized) {
          this.realized = true;
          const r = this.step();
          this.step = null;
          if (r !== null && r !== void 0) {
            this.chunk = r[0];
            this._rest = new LazyIterable2(r[1]);
          }
        }
        return this;
      }
      [Symbol.iterator]() {
        let cell = this;
        let i = 0;
        return {
          next() {
            for (; ; ) {
              cell.force();
              const ch = cell.chunk;
              if (ch === null) return { value: void 0, done: true };
              if (i < ch.length) return { value: ch[i++], done: false };
              cell = cell._rest;
              i = 0;
            }
          },
          [Symbol.iterator]() {
            return this;
          }
        };
      }
      // Mirrors Array.prototype.indexOf so lazy seqs support (.indexOf coll x):
      // reference equality, returns -1 when absent. Unlike cljs.core, not by value.
      indexOf(x, fromIndex = 0) {
        let i = 0;
        for (const v of this) {
          if (i >= fromIndex && v === x) return i;
          i++;
        }
        return -1;
      }
    }
  );
  function chunkCursor(coll) {
    if (coll instanceof LazyIterable) {
      let cell = coll;
      return () => {
        if (cell === null) return null;
        cell.force();
        const ch = cell.chunk;
        cell = ch === null ? null : cell._rest;
        return ch;
      };
    }
    const it = es6_iterator(iterable(coll));
    return () => {
      const b = [];
      for (let i = 0; i < CHUNK_SIZE; i++) {
        const r = it.next();
        if (r.done) break;
        b.push(r.value);
      }
      return b.length === 0 ? null : b;
    };
  }
  function not(expr) {
    return !truth_(expr);
  }
  var IATOM_SYM = /* @__PURE__ */ Symbol.for("squint.core/IAtom");
  var IDEREF_SYM = /* @__PURE__ */ Symbol.for("squint.core/IDeref");
  var ISEQABLE_SYM = /* @__PURE__ */ Symbol.for("squint.core/ISeqable");
  var IDeref__deref = /* @__PURE__ */ Symbol.for("squint.core/-deref");
  function _deref(o) {
    if (o != null && o[IDeref__deref] !== void 0) return o[IDeref__deref](o);
    return nilImpl(_deref, "IDeref.-deref", o)(o);
  }
  var ISeqable__seq = /* @__PURE__ */ Symbol.for("squint.core/-seq");
  var ILookup__lookup = /* @__PURE__ */ Symbol.for("squint.core/-lookup");
  var IAssociative__contains_key_QMARK_ = /* @__PURE__ */ Symbol.for("squint.core/-contains-key?");
  var IMap__dissoc = /* @__PURE__ */ Symbol.for("squint.core/-dissoc");
  var IEquiv__equiv = /* @__PURE__ */ Symbol.for("squint.core/-equiv");
  var IMeta__meta = /* @__PURE__ */ Symbol.for("squint.core/-meta");
  var M3_C1 = 3432918353 | 0;
  var M3_C2 = 461845907 | 0;
  var IIndexed__nth = /* @__PURE__ */ Symbol.for("squint.core/-nth");
  function nilImpl(dispatchFn, protoMethod, o) {
    const f = dispatchFn[null];
    if (f === void 0) throw missing_protocol(protoMethod, o);
    return f;
  }
  var IReset = { __sym: /* @__PURE__ */ Symbol.for("squint.core/IReset") };
  var IReset__reset_BANG_ = /* @__PURE__ */ Symbol.for("squint.core/-reset!");
  function _reset_BANG_(o, v) {
    if (o != null && o[IReset__reset_BANG_] !== void 0) return o[IReset__reset_BANG_](o, v);
    return nilImpl(_reset_BANG_, "IReset.-reset!", o)(o, v);
  }
  var ISwap = { __sym: /* @__PURE__ */ Symbol.for("squint.core/ISwap") };
  var ISwap__swap_BANG_ = /* @__PURE__ */ Symbol.for("squint.core/-swap!");
  var IWatchable = { __sym: /* @__PURE__ */ Symbol.for("squint.core/IWatchable") };
  var IWatchable__add_watch = /* @__PURE__ */ Symbol.for("squint.core/-add-watch");
  var IWatchable__remove_watch = /* @__PURE__ */ Symbol.for("squint.core/-remove-watch");
  var IWatchable__notify_watches = /* @__PURE__ */ Symbol.for("squint.core/-notify-watches");
  var ATOM_DEREF = (self) => self.val;
  var ATOM_RESET = (self, x) => {
    if (self._validator && !truth_(self._validator(x))) {
      throw new Error("Validator rejected reference state");
    }
    const old_val = self.val;
    self.val = x;
    if (self._hasWatches) {
      for (const [k, f] of Object.entries(self._watches)) f(k, self, old_val, x);
    }
    return x;
  };
  var ATOM_SWAP = function(self, f, a, b, xs) {
    switch (arguments.length) {
      case 2:
        return ATOM_RESET(self, f(self.val));
      case 3:
        return ATOM_RESET(self, f(self.val, a));
      case 4:
        return ATOM_RESET(self, f(self.val, a, b));
      default:
        return ATOM_RESET(self, f(self.val, a, b, ...xs));
    }
  };
  var ATOM_ADD_WATCH = (self, k, f) => {
    self._watches[k] = f;
    self._hasWatches = true;
  };
  var ATOM_REMOVE_WATCH = (self, k) => {
    delete self._watches[k];
  };
  var ATOM_NOTIFY = (self, oldv, newv) => {
    for (const [k, f] of Object.entries(self._watches)) f(k, self, oldv, newv);
  };
  var Atom = class {
    constructor(init) {
      this.val = init;
      this._watches = {};
      this._hasWatches = false;
      this[IATOM_SYM] = true;
      this[IDEREF_SYM] = true;
      this[IDeref__deref] = ATOM_DEREF;
      this[IReset.__sym] = true;
      this[IReset__reset_BANG_] = ATOM_RESET;
      this[ISwap.__sym] = true;
      this[ISwap__swap_BANG_] = ATOM_SWAP;
      this[IWatchable.__sym] = true;
      this[IWatchable__add_watch] = ATOM_ADD_WATCH;
      this[IWatchable__remove_watch] = ATOM_REMOVE_WATCH;
      this[IWatchable__notify_watches] = ATOM_NOTIFY;
    }
  };
  function atom(init, ...opts) {
    const a = new Atom(init);
    for (let i = 0; i < opts.length; i += 2) {
      if (opts[i] === "meta") {
        const mv = opts[i + 1];
        a[IMeta__meta] = () => mv;
      } else if (opts[i] === "validator") a._validator = opts[i + 1];
    }
    return a;
  }
  function missing_protocol(proto, obj) {
    let ty;
    if (obj === null) ty = "null";
    else if (obj === void 0) ty = "undefined";
    else if (Array.isArray(obj)) ty = "array";
    else if (typeof obj === "object" && obj.constructor && obj.constructor !== Object) {
      ty = obj.constructor.name;
    } else ty = typeof obj;
    return new Error(
      `No protocol method ${proto} defined for type ${ty}: ${obj ?? ""}`
    );
  }
  function deref(ref) {
    if (ref?.[IDeref__deref] !== void 0) return ref[IDeref__deref](ref);
    return nilImpl(_deref, "IDeref.-deref", ref)(ref);
  }
  function reset_BANG_(atm, v) {
    if (atm?.[IReset__reset_BANG_] !== void 0) return atm[IReset__reset_BANG_](atm, v);
    return nilImpl(_reset_BANG_, "IReset.-reset!", atm)(atm, v);
  }
  function re_find(re, s) {
    if (string_QMARK_(s)) {
      const matches = re.exec(s);
      if (matches != null) {
        if (matches.length === 1) return matches[0];
        else {
          return [...matches];
        }
      }
      return null;
    } else {
      throw new TypeError("re-find must match against a string.");
    }
  }
  function max(x, ...more) {
    let m = x;
    for (const y of more) m = isNaN(m) ? m : isNaN(y) ? y : m > y ? m : y;
    return m;
  }
  function min(x, ...more) {
    let m = x;
    for (const y of more) m = isNaN(m) ? m : isNaN(y) ? y : m < y ? m : y;
    return m;
  }
  function truth_(x) {
    return x != null && x !== false;
  }
  function string_QMARK_(s) {
    return typeof s === "string";
  }
  function int_QMARK_(x) {
    return Number.isInteger(x);
  }

  // work/compiled/outputs/cloud-kotoba-dds/source/interaction.mjs
  var $ = function(s) {
    return document.querySelector(s);
  };
  var all = function(s) {
    return seq(document.querySelectorAll(s));
  };
  var on = function(node, event, f) {
    return node.addEventListener(event, f);
  };
  var read_store = function(k) {
    try {
      return localStorage.getItem(`${"cloud-kotoba-dds.demo.v2/"}${k ?? ""}`);
    } catch (__1) {
      return null;
    }
    ;
  };
  var write_store = function(k, v) {
    try {
      if (v == null) {
        localStorage.removeItem(`${"cloud-kotoba-dds.demo.v2/"}${k ?? ""}`);
      } else {
        localStorage.setItem(`${"cloud-kotoba-dds.demo.v2/"}${k ?? ""}`, v);
      }
      ;
      return true;
    } catch (__1) {
      return false;
    }
    ;
  };
  var translations = { "\u25A6\u3000\u90E8\u54C1\u306E\u898B\u672C": "\u25A6  Components", "\u5B8C\u4E86\u97F3\u306E\u8A66\u8074": "Preview completion sound", "\u5B8C\u4E86 \xB7 \u8A73\u7D30\u3092\u8868\u793A": "Complete \xB7 Show details", "\u25C7 \u6210\u679C\u7269": "\u25C7 Content", "\u53D6\u5F97\u7D4C\u8DEF": "Transport", "\u518D\u8A66\u884C": "Retry", "\u30E2\u30C7\u30EB\u9078\u629E\u306E\u914D\u7F6E\u4F8B\u3067\u3059\u3002\u5B9F\u63A5\u7D9A\u306F\u3042\u308A\u307E\u305B\u3093\u3002": "A model control example; no model is connected.", "\u8B58\u5225\u5B50": "Identifier", "\u65B0\u3057\u3044\u4F1A\u8A71": "New conversation", "\u25CB \u5F85\u6A5F": "\u25CB Idle", "\u6B8B\u3059\u3082\u306E": "What persists", "\u8868\u793A\u3068\u64CD\u4F5C\u306E\u898B\u672C \xB7 \u5B9F\u969B\u306E AI \u306B\u306F\u9001\u4FE1\u3057\u307E\u305B\u3093": "Interactive study \xB7 Nothing is sent to an AI", "! \u5BFE\u5FDC\u304C\u5FC5\u8981": "! Action needed", "\u3053\u306E\u30EA\u30F3\u30AF\u306B\u3064\u3044\u3066": "About this link", "\u8003\u3048\u3066\u3044\u308B\u3053\u3068\u3092\u66F8\u3044\u3066\u304F\u3060\u3055\u3044": "Write what is on your mind", "\u4E0B\u66F8\u304D\u3092\u3053\u306E\u7AEF\u672B\u306B\u4FDD\u5B58": "Save drafts on this device", "\u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u8A2D\u5B9A": "Account & settings", "\u56FA\u5B9A\u3055\u308C\u305F\u7248 \xB7 v1 \xB7 JSON": "Pinned version \xB7 v1 \xB7 JSON", "\u3053\u306E\u898B\u672C\u306B\u540C\u68B1\u3057\u305F\u30D5\u30A1\u30A4\u30EB": "File included in this study", "\u8A2D\u5B9A\u306F\u3053\u306E\u898B\u672C\u3060\u3051\u306B\u9069\u7528\u3055\u308C\u307E\u3059\u3002": "These settings apply to this study only.", "\u9589\u3058\u308B": "Close", "\u30E2\u30D0\u30A4\u30EB\u306E\u4F5C\u696D": "Mobile workspace", "\u57FA\u672C\u64CD\u4F5C": "Basic actions", "\u691C\u8A3C": "Verification", "\u6587\u7AE0\u30FB\u30B3\u30FC\u30C9": "Text & code", "\u5FDC\u7B54\u3092\u8A66\u3059": "Try a reply", "\u30EA\u30F3\u30AF": "Links", "Enter\uFF1A\u6539\u884C \xB7 \u2318/Ctrl+Enter\uFF1A\u8A66\u3059": "Enter: new line \xB7 \u2318/Ctrl+Enter: try", "jp-go-dds / \u518D\u5229\u7528": "jp-go-dds / reused", "Kotoba \xB7 \u500B\u4EBA\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9": "Kotoba \xB7 Personal workspace", "\u30A8\u30E9\u30FC": "Error", "\u5171\u901A\u8A2D\u8A08\u3092\u8AAD\u3080 \u2197": "Read the design \u2197", "\u8A00\u8A9E": "Language", "\u4F1A\u8A71\u306E\u898B\u672C\u3078": "Open workspace", "\u610F\u5473\u3092\u63C3\u3048\u308B": "Consistent meanings", "\u30A2\u30AB\u30A6\u30F3\u30C8\u5165\u53E3": "Account entry", "\u540C\u3058\u610F\u5473 \u2192 \u540C\u3058\u90E8\u54C1 \u2192 \u540C\u3058\u64CD\u4F5C \u2192 \u540C\u3058\u5FDC\u7B54": "Same meaning \u2192 Same component \u2192 Same action \u2192 Same feedback", "\u25C9\u3000\u4F1A\u8A71": "\u25C9  Conversations", "\u30B9\u30DE\u30FC\u30C8\u30D5\u30A9\u30F3\u5E45": "Phone width", "cloud-kotoba-dds / \u63D0\u6848": "cloud-kotoba-dds / proposed", "\u25CC \u5B9F\u884C\u4E2D": "\u25CC Running", "\u4F1A\u8A71\u30FB\u4F5C\u696D\u30FB\u6210\u679C\u7269\u3092\u3001\u3072\u3068\u3064\u306E\u753B\u9762\u3067\u3064\u306A\u3050\u3002": "Connect conversations, work and content in one workspace.", "\u4F7F\u3046\u5834\u6240\u304C\u5909\u308F\u3063\u3066\u3082\u3001\u540C\u3058\u624B\u89E6\u308A\u3002": "Different places. One familiar experience.", "\u5BFE\u8C61": "Target", "\u30EA\u30F3\u30AF\u306F\u3001\u5834\u6240\u3088\u308A\u3082\u5185\u5BB9\u3078\u3002": "Link to content, beyond its location.", "\u5B8C\u4E86\u97F3\u3092\u6709\u52B9\u306B\u3059\u308B": "Enable completion sound", "\u25C9 \u4F1A\u8A71": "\u25C9 Chat", "\u30B5\u30F3\u30D7\u30EB\u5FDC\u7B54\u3092\u5C55\u958B": "Expand sample reply", "\u753B\u9762\u306E\u8A00\u8A9E\u3060\u3051\u3092\u5909\u66F4\u3057\u307E\u3059\u3002\u539F\u6587\u3068\u56DE\u7B54\u8A00\u8A9E\u306F\u5225\u3067\u3059\u3002": "This changes the interface language, not the source or reply language.", "\u4FDD\u5B58\u3068\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF": "Storage & feedback", "\u898B\u672C\u306E\u539F\u6587\u306F\u65E5\u672C\u8A9E\u3067\u3059\u3002UI \u306E\u8A00\u8A9E\u3068\u306F\u72EC\u7ACB\u3057\u3066\u3044\u307E\u3059\u3002": "Reference content remains in Japanese, independently of the interface language.", "\u30B9\u30C8\u30EA\u30FC\u30DF\u30F3\u30B0": "Streaming", "\u56FA\u5B9A\u3055\u308C\u305F\u7248\u3068\u3001\u66F4\u65B0\u3092\u8FFD\u3046\u540D\u524D\u3092\u3001\u898B\u305F\u76EE\u3067\u3082\u64CD\u4F5C\u3067\u3082\u5206\u3051\u307E\u3059\u3002": "Distinguish a pinned version from a name that follows updates.", "\u5171\u6709\u7BC4\u56F2": "Access", "\u4FDD\u5B58\u3057\u305F\u4E0B\u66F8\u304D\u3092\u524A\u9664": "Delete saved draft", "\u5B9F\u969B\u306E\u901A\u4FE1\u306F\u884C\u3044\u307E\u305B\u3093\u3002\u30AA\u30D5\u306B\u623B\u3057\u3066\u518D\u8A66\u884C\u3067\u304D\u307E\u3059\u3002": "No network request is made. Turn this off, then retry.", "\u25A6 \u90E8\u54C1": "\u25A6 Components", "\u5B8C\u4E86": "Complete", "\u72B6\u614B\u306E\u8A9E\u5F59": "State vocabulary", "\u52D5\u304D\u3068\u97F3\u306F\u3001\u7D50\u679C\u3092\u4F1D\u3048\u308B\u305F\u3081\u306B\u3002": "Motion and sound communicate outcomes.", "\u6210\u679C\u7269\u3078\u306E\u30EA\u30F3\u30AF": "Content link", "\u5185\u5BB9\u305D\u306E\u3082\u306E / \u56FA\u5B9A\u7248": "Content / pinned version", "\u56FA\u5B9A\u3055\u308C\u305F\u7248 / v1": "Pinned version / v1", "\u958B\u9589\u3092\u8A66\u3059": "Try disclosure", "\u30B5\u30F3\u30D7\u30EB\u56DE\u7B54\u306E\u8A00\u8A9E": "Sample reply language", "\u5185\u5BB9\u304C\u958B\u304D\u307E\u3057\u305F": "Content revealed", "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8": "Components", "\u6700\u65B0\u3092\u8FFD\u3046\u30EA\u30F3\u30AF\u3068\u306E\u9055\u3044": "How is a name link different?", "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9": "Workspace", "\u72EC\u81EA\u306B\u63CF\u304D\u76F4\u3055\u306A\u3044\u305F\u3081\u306E\u3001\u5171\u6709\u90E8\u54C1\u3002": "Shared components, without reinvention.", "\u52D5\u304D\u3068\u97F3": "Motion & sound", "\u2713 \u5B8C\u4E86": "\u2713 Complete", "\u63A5\u7D9A\u5207\u308C\u3092\u518D\u73FE": "Simulate disconnection", "\u5165\u529B\u3057\u305F\u4E0B\u66F8\u304D\u306F\u3001\u4E0A\u306E\u898B\u672C\u3092\u5207\u308A\u66FF\u3048\u3066\u3082\u6B8B\u308A\u307E\u3059\u3002": "Your draft stays with you when you switch views.", "\u30E2\u30C7\u30EB\u306E\u8A73\u7D30": "Model details", "\u2190 \u4F1A\u8A71\u3078\u623B\u308B": "\u2190 Back to conversation", "\u25C7\u3000\u6210\u679C\u7269": "\u25C7  Content", "\u958B\u304F \u2192": "Open \u2192", "\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u4E0B\u66F8\u304D": "Message draft", "\u8A00\u8A9E\u30FB\u8A2D\u5B9A": "Language & settings", "\u516C\u958B\u3084\u5171\u6709\u306F\u3001\u5185\u5BB9\u3092\u78BA\u8A8D\u3059\u308B\u5225\u306E\u64CD\u4F5C\u3068\u3057\u3066\u6271\u3044\u307E\u3059\u3002": "Publishing and sharing are separate, reviewable actions.", "\u3053\u306E\u7AEF\u672B\u5185\u3060\u3051\u3067\u52D5\u304F\u898B\u672C\u3067\u3059\u3002": "This example runs only on this device.", "\u5185\u5BB9\u306E JSON \u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9 \u2193": "Download the JSON \u2193", "\u9759\u304B\u306A\u521D\u671F\u72B6\u614B\u3002\u5FC5\u8981\u306A\u3068\u304D\u3060\u3051\u3001\u610F\u5473\u306E\u3042\u308B\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3002": "Quiet by default. Meaningful feedback when needed.", "\u5931\u6557\u304B\u3089\u306E\u5FA9\u65E7\u3092\u8A66\u3059": "Try recovery", "\u30C0\u30FC\u30AF": "Dark", "DADS \u306E\u57FA\u790E\u90E8\u54C1\u3068\u3001Kotoba \u304C\u6240\u6709\u3059\u308B\u30A2\u30D7\u30EA\u306E\u30D1\u30BF\u30FC\u30F3\u3092\u5206\u3051\u308B\u3002": "DADS foundations, with app patterns owned by Kotoba.", "\u52D5\u304D\u3092\u6291\u3048\u308B": "Reduce motion", "\u898B\u672C\u3078\u79FB\u52D5": "Skip to workspace", "\u898B\u672C\u306E\u5207\u66FF": "Study navigation" };
  var locale = atom("ja");
  var status_copy = atom(null);
  var t = function(ja, en) {
    if (deref(locale) === "en") {
      return en;
    } else {
      return ja;
    }
    ;
  };
  var text_records = new Array();
  var attr_records = new Array();
  var collect_translations_BANG_ = function() {
    const walker_1 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n_2 = walker_1.nextNode();
    while (true) {
      if (truth_(n_2)) {
        const raw_3 = n_2.nodeValue;
        const key_4 = raw_3.trim();
        const parent_5 = n_2.parentElement;
        if (truth_((() => {
          const and__23694__auto___6 = parent_5;
          if (truth_(and__23694__auto___6)) {
            return not(parent_5.closest("script,style,textarea,option,[data-language-selector]")) && !_EQ_(key_4, "");
          } else {
            return and__23694__auto___6;
          }
          ;
        })())) {
          const temp__23219__auto___7 = get(translations, key_4);
          if (truth_(temp__23219__auto___7)) {
            const en_8 = temp__23219__auto___7;
            text_records.push({ "node": n_2, "ja": raw_3, "en": raw_3.replace(key_4, en_8) });
          } else {
            if (truth_(re_find(/[ぁ-んァ-ヶ一-龠]/, key_4))) {
              parent_5.setAttribute("lang", "ja");
            }
          }
        }
        ;
        let G__9 = walker_1.nextNode();
        n_2 = G__9;
        continue;
      }
      ;
      break;
    }
    ;
    for (let G__10 of iterable(all("[placeholder],[aria-label]"))) {
      const el_11 = G__10;
      for (let G__12 of iterable(["placeholder", "aria-label"])) {
        const attr_13 = G__12;
        const ja_14 = el_11.getAttribute(attr_13);
        const temp__23298__auto___15 = get(translations, ja_14);
        if (truth_(temp__23298__auto___15)) {
          const en_16 = temp__23298__auto___15;
          attr_records.push({ "node": el_11, "attr": attr_13, "ja": ja_14, "en": en_16 });
        }
      }
    }
    return null;
  };
  var apply_language_BANG_ = function(lang) {
    reset_BANG_(locale, lang === "en" ? "en" : "ja");
    document.documentElement.lang = deref(locale);
    for (let G__1 of iterable(seq(text_records))) {
      const r_2 = G__1;
      r_2.node.nodeValue = r_2[deref(locale)];
    }
    ;
    for (let G__3 of iterable(seq(attr_records))) {
      const r_4 = G__3;
      r_4.node.setAttribute(r_4.attr, r_4[deref(locale)]);
    }
    ;
    const temp__23298__auto___5 = deref(status_copy);
    if (truth_(temp__23298__auto___5)) {
      const vec___6_9 = temp__23298__auto___5;
      const ja_10 = nth(vec___6_9, 0, null);
      const en_11 = nth(vec___6_9, 1, null);
      $("#compose-status").textContent = t(ja_10, en_11);
    }
    ;
    const label_12 = deref(locale) === "en" ? "English" : "\u65E5\u672C\u8A9E";
    $("[data-language-selector-current]").textContent = label_12;
    $("[data-language-selector-opener]").setAttribute("aria-label", `${"Language: "}${label_12 ?? ""}`);
    for (let G__13 of iterable(all("[data-language-selector-item]"))) {
      const item_14 = G__13;
      if (_EQ_(item_14.getAttribute("lang"), deref(locale))) {
        item_14.setAttribute("aria-current", "true");
      } else {
        item_14.removeAttribute("aria-current");
      }
    }
    ;
    return write_store("language", deref(locale));
  };
  var opener = atom(null);
  var open_sheet_BANG_ = function(button) {
    reset_BANG_(opener, button);
    return $("#account-sheet").showModal();
  };
  var close_sheet_BANG_ = function() {
    return $("#account-sheet").close();
  };
  var save_draft_BANG_ = function() {
    if (truth_($("#persist-draft").checked)) {
      if (truth_(write_store("draft", $("#draft").value))) {
        return null;
      } else {
        return $("#compose-status").textContent = t("\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3002\u4E0B\u66F8\u304D\u306F\u3053\u306E\u753B\u9762\u306B\u6B8B\u3063\u3066\u3044\u307E\u3059\u3002", "Storage unavailable. Your draft remains in this view.");
      }
      ;
    }
    ;
  };
  var autosize_BANG_ = function() {
    const input_1 = $("#draft");
    input_1.style.height = "auto";
    return input_1.style.height = `${min(160, max(70, input_1.scrollHeight)) ?? ""}px`;
  };
  var running = atom(false);
  var composing = atom(false);
  var set_status_BANG_ = function(state, ja, en) {
    reset_BANG_(status_copy, [ja, en]);
    $("#composer").setAttribute("data-state", state);
    return $("#compose-status").textContent = t(ja, en);
  };
  var try_reply_BANG_ = function() {
    if (truth_((() => {
      const or__23663__auto___1 = deref(running);
      if (truth_(or__23663__auto___1)) {
        return or__23663__auto___1;
      } else {
        return deref(composing);
      }
      ;
    })())) {
      return null;
    } else {
      const draft_2 = $("#draft").value;
      const input_3 = $("#draft");
      if (_EQ_("", draft_2.trim())) {
        input_3.setAttribute("aria-invalid", "true");
        set_status_BANG_("invalid", "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002", "Enter a message first.");
        return input_3.focus();
      } else {
        if (truth_($("#simulate-offline").checked)) {
          $("#retry").hidden = false;
          return set_status_BANG_("offline", "\u63A5\u7D9A\u5207\u308C\u306E\u518D\u73FE\u4E2D\u3002\u8A2D\u5B9A\u3067\u30AA\u30D5\u306B\u3057\u3066\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u4E0B\u66F8\u304D\u306F\u6B8B\u3063\u3066\u3044\u307E\u3059\u3002", "Simulated disconnection. Turn it off in settings and retry. Your draft is safe.");
        } else {
          if ("else") {
            input_3.removeAttribute("aria-invalid");
            reset_BANG_(running, true);
            $("#sample-send").disabled = true;
            $("#retry").hidden = true;
            set_status_BANG_("running", "\u30B5\u30F3\u30D7\u30EB\u5FDC\u7B54\u3092\u6E96\u5099\u4E2D\u2026", "Preparing a sample reply\u2026");
            return setTimeout((function() {
              const message_4 = document.createElement("article");
              const body_5 = document.createElement("p");
              const answer_lang_6 = $("#answer-language").value;
              message_4.className = "assistant-message sample-result reveal";
              message_4.setAttribute("lang", answer_lang_6);
              body_5.textContent = answer_lang_6 === "en" ? "Sample reply: your input stayed on this device. No AI or server was contacted." : "\u30B5\u30F3\u30D7\u30EB\u5FDC\u7B54\uFF1A\u5165\u529B\u306F\u3053\u306E\u7AEF\u672B\u5185\u3067\u6271\u3044\u307E\u3057\u305F\u3002AI \u3084\u30B5\u30FC\u30D0\u30FC\u306B\u306F\u9001\u4FE1\u3057\u3066\u3044\u307E\u305B\u3093\u3002";
              message_4.appendChild(body_5);
              $(".messages").appendChild(message_4);
              reset_BANG_(running, false);
              $("#sample-send").disabled = false;
              if (_EQ_(draft_2, input_3.value)) {
                input_3.value = "";
              }
              ;
              autosize_BANG_();
              save_draft_BANG_();
              set_status_BANG_("complete", "\u30B5\u30F3\u30D7\u30EB\u5B8C\u4E86\u3002\u5FDC\u7B54\u306F\u4F1A\u8A71\u6B04\u306E\u672B\u5C3E\u306B\u3042\u308A\u307E\u3059\u3002", "Sample complete. The reply is at the end of the conversation.");
              if (truth_($("#sound-enabled").checked)) {
                return $("audio").play().catch((function(_) {
                  return null;
                }));
              }
              ;
            }), 600);
          } else {
            return null;
          }
        }
      }
      ;
    }
    ;
  };
  var route_BANG_ = function() {
    const hash_1 = location.hash;
    const valid_2 = /* @__PURE__ */ new Set(["#workspace", "#content", "#components", "#behavior"]);
    const target_3 = truth_(contains_QMARK_(valid_2, hash_1)) ? $(hash_1) : $("#workspace");
    for (let G__4 of iterable(all(".study-bar nav a,.bottom-nav a"))) {
      const link_5 = G__4;
      if (link_5.getAttribute("href") === `${"#"}${target_3.id ?? ""}`) {
        link_5.setAttribute("aria-current", "page");
      } else {
        link_5.removeAttribute("aria-current");
      }
    }
    ;
    return target_3.focus({ "preventScroll": true });
  };
  collect_translations_BANG_();
  apply_language_BANG_((() => {
    const or__23663__auto___1 = new URLSearchParams(location.search).get("lang");
    if (truth_(or__23663__auto___1)) {
      return or__23663__auto___1;
    } else {
      const or__23663__auto___2 = read_store("language");
      if (truth_(or__23663__auto___2)) {
        return or__23663__auto___2;
      } else {
        return "ja";
      }
      ;
    }
    ;
  })());
  for (let G__1 of iterable(all("[data-open-dialog]"))) {
    let b1 = G__1;
    on(b1, "click", (function() {
      return open_sheet_BANG_(b1);
    }));
  }
  for (let G__1 of iterable(all("[data-close-dialog]"))) {
    let b2 = G__1;
    on(b2, "click", close_sheet_BANG_);
  }
  on($("#account-sheet"), "close", (function() {
    if (truth_(deref(opener))) {
      return deref(opener).focus();
    }
    ;
  }));
  $("#account-sheet").addEventListener("keydown", (function(e) {
    if (truth_(e.key === "Escape" && (() => {
      const and__23694__auto___1 = e.target.closest("[data-language-selector]");
      if (truth_(and__23694__auto___1)) {
        return $("[data-language-selector-popup]").hidden;
      } else {
        return and__23694__auto___1;
      }
      ;
    })())) {
      e.preventDefault();
      e.stopPropagation();
      return close_sheet_BANG_();
    }
    ;
  }), true);
  on(document, "click", (function(e) {
    const temp__23298__auto___1 = e.target.closest("[data-language-selector-item]");
    if (truth_(temp__23298__auto___1)) {
      const item_2 = temp__23298__auto___1;
      e.preventDefault();
      apply_language_BANG_(item_2.getAttribute("lang"));
      return $("[data-language-selector-opener]").focus();
    }
    ;
  }));
  on($("#composer"), "submit", (function(e) {
    e.preventDefault();
    return try_reply_BANG_();
  }));
  on($("#retry"), "click", try_reply_BANG_);
  on($("#draft"), "compositionstart", (function() {
    return reset_BANG_(composing, true);
  }));
  on($("#draft"), "compositionend", (function() {
    return reset_BANG_(composing, false);
  }));
  on($("#draft"), "keydown", (function(e) {
    if (truth_(e.key === "Enter" && (() => {
      const and__23694__auto___2 = (() => {
        const or__23663__auto___1 = e.metaKey;
        if (truth_(or__23663__auto___1)) {
          return or__23663__auto___1;
        } else {
          return e.ctrlKey;
        }
        ;
      })();
      if (truth_(and__23694__auto___2)) {
        return not(e.isComposing) && not(deref(composing));
      } else {
        return and__23694__auto___2;
      }
      ;
    })())) {
      e.preventDefault();
      return try_reply_BANG_();
    }
    ;
  }));
  on($("#draft"), "input", (function() {
    $("#draft").removeAttribute("aria-invalid");
    autosize_BANG_();
    return save_draft_BANG_();
  }));
  on($("#persist-draft"), "change", (function() {
    const enabled_1 = $("#persist-draft").checked;
    write_store("persist", truth_(enabled_1) ? "yes" : null);
    if (truth_(enabled_1)) {
      return save_draft_BANG_();
    } else {
      return write_store("draft", null);
    }
    ;
  }));
  on($("#clear-draft"), "click", (function() {
    const cleared_1 = write_store("draft", null);
    $("#persist-draft").checked = false;
    write_store("persist", null);
    return $("#settings-status").textContent = truth_(cleared_1) ? t("\u4FDD\u5B58\u5206\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002\u7DE8\u96C6\u4E2D\u306E\u4E0B\u66F8\u304D\u306F\u6B8B\u3057\u3066\u3044\u307E\u3059\u3002", "Saved draft deleted. Your current draft is unchanged.") : t("\u4FDD\u5B58\u9818\u57DF\u3092\u64CD\u4F5C\u3067\u304D\u307E\u305B\u3093\u3002", "Storage is unavailable.");
  }));
  on(window, "hashchange", route_BANG_);
  on(document, "keydown", (function(e) {
    if (truth_(e.key === "Escape" && (not($("#account-sheet").open) && (() => {
      for (let G__1 of iterable(all("details[open]"))) {
        const details_2 = G__1;
        details_2.open = false;
        details_2.querySelector("summary").focus();
      }
    })()))) {
      return null;
    }
    ;
  }));
  on(document, "click", (function(e) {
    for (let G__1 of iterable(all(".model-picker[open]"))) {
      const details_2 = G__1;
      if (truth_(details_2.contains(e.target))) {
      } else {
        details_2.open = false;
      }
    }
    return null;
  }));
  if ("yes" === read_store("persist")) {
    $("#persist-draft").checked = true;
    $("#draft").value = (() => {
      const or__23663__auto___1 = read_store("draft");
      if (truth_(or__23663__auto___1)) {
        return or__23663__auto___1;
      } else {
        return "";
      }
      ;
    })();
  }
  var viewport_BANG_ = function() {
    const vp_1 = window.visualViewport;
    if (truth_(vp_1)) {
      return document.documentElement.style.setProperty("--ck-visible-height", `${vp_1.height ?? ""}px`);
    }
    ;
  };
  if (truth_(window.visualViewport)) {
    on(window.visualViewport, "resize", viewport_BANG_);
  }
  viewport_BANG_();
  autosize_BANG_();
  route_BANG_();
})();
