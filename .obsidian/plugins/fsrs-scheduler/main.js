"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/yaml/dist/nodes/identity.js"(exports2) {
    "use strict";
    var ALIAS = /* @__PURE__ */ Symbol.for("yaml.alias");
    var DOC = /* @__PURE__ */ Symbol.for("yaml.document");
    var MAP = /* @__PURE__ */ Symbol.for("yaml.map");
    var PAIR = /* @__PURE__ */ Symbol.for("yaml.pair");
    var SCALAR = /* @__PURE__ */ Symbol.for("yaml.scalar");
    var SEQ = /* @__PURE__ */ Symbol.for("yaml.seq");
    var NODE_TYPE = /* @__PURE__ */ Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports2.ALIAS = ALIAS;
    exports2.DOC = DOC;
    exports2.MAP = MAP;
    exports2.NODE_TYPE = NODE_TYPE;
    exports2.PAIR = PAIR;
    exports2.SCALAR = SCALAR;
    exports2.SEQ = SEQ;
    exports2.hasAnchor = hasAnchor;
    exports2.isAlias = isAlias;
    exports2.isCollection = isCollection;
    exports2.isDocument = isDocument;
    exports2.isMap = isMap;
    exports2.isNode = isNode;
    exports2.isPair = isPair;
    exports2.isScalar = isScalar;
    exports2.isSeq = isSeq;
  }
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/yaml/dist/visit.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
      const ctrl = callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = visit_(i, node.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = visit_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path) {
      const ctrl = await callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = await visitAsync_(i, node.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node, path);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
      return void 0;
    }
    function replaceNode(key, path, node) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports2.visit = visit;
    exports2.visitAsync = visitAsync;
  }
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/yaml/dist/doc/directives.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts2 = line.trim().split(/[ \t]+/);
        const name = parts2.shift();
        switch (name) {
          case "%TAG": {
            if (parts2.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts2.length < 2)
                return false;
            }
            const [handle, prefix] = parts2;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts2.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version2] = parts2;
            if (version2 === "1.1" || version2 === "1.2") {
              this.yaml.version = version2;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version2);
              onError(6, `Unsupported YAML version ${version2}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports2.Directives = Directives;
  }
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/yaml/dist/doc/anchors.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports2.anchorIsValid = anchorIsValid;
    exports2.anchorNames = anchorNames;
    exports2.createNodeAnchors = createNodeAnchors;
    exports2.findNewAnchor = findNewAnchor;
  }
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/yaml/dist/doc/applyReviver.js"(exports2) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports2.applyReviver = applyReviver;
  }
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/yaml/dist/nodes/toJS.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports2.toJS = toJS;
  }
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/yaml/dist/nodes/Node.js"(exports2) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports2.NodeBase = NodeBase;
  }
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/yaml/dist/nodes/Alias.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        if (found && ctx) {
          const { anchors: anchors2, doc: doc2, maxAliasCount } = ctx;
          let data = anchors2.get(found);
          if (!data) {
            toJS.toJS(found, null, ctx);
            data = anchors2.get(found);
          }
          if (data?.res === void 0) {
            const msg = "This should not happen: Alias anchor was not resolved?";
            throw new ReferenceError(msg);
          }
          if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
              data.aliasCount = getAliasCount(doc2, found, anchors2);
            if (data.count * data.aliasCount > maxAliasCount) {
              const msg = "Excessive alias count indicates a resource exhaustion attack";
              throw new ReferenceError(msg);
            }
          }
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const source = this.resolve(ctx.doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        return ctx.anchors.get(source).res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports2.Alias = Alias;
  }
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/yaml/dist/nodes/Scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports2.Scalar = Scalar;
    exports2.isScalarValue = isScalarValue;
  }
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/yaml/dist/doc/createNode.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports2.createNode = createNode;
  }
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/yaml/dist/nodes/Collection.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path, value) {
      let v = value;
      for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value) {
        if (isEmptyPath(path))
          this.add(value);
        else {
          const [key, ...rest] = path;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports2.Collection = Collection;
    exports2.collectionFromPath = collectionFromPath;
    exports2.isEmptyPath = isEmptyPath;
  }
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyComment.js"(exports2) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports2.indentComment = indentComment;
    exports2.lineComment = lineComment;
    exports2.stringifyComment = stringifyComment;
  }
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/yaml/dist/stringify/foldFlowLines.js"(exports2) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text2, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text2;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text2.length <= endStep)
        return text2;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text2, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text2[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text2[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text2, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text2[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text2[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text2;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text2;
      if (onFold)
        onFold();
      let res = text2.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text2.length;
        if (fold === 0)
          res = `
${indent}${text2.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text2[fold]}\\`;
          res += `
${indent}${text2.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text2, i, indent) {
      let end = i;
      let start = i + 1;
      let ch = text2[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent) {
          ch = text2[++i];
        } else {
          do {
            ch = text2[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text2[start];
        }
      }
      return end;
    }
    exports2.FOLD_BLOCK = FOLD_BLOCK;
    exports2.FOLD_FLOW = FOLD_FLOW;
    exports2.FOLD_QUOTED = FOLD_QUOTED;
    exports2.foldFlowLines = foldFlowLines;
  }
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyString.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str += json.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str += json.slice(start, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str += json.slice(start, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str += "\n";
                  i += 2;
                }
                str += indent;
                if (json[i + 2] === " ")
                  str += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str = start ? str + json.slice(start) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports2.stringifyString = stringifyString;
  }
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/yaml/dist/stringify/stringify.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports2.createStringifyContext = createStringifyContext;
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyPair.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports2.stringifyPair = stringifyPair;
  }
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/yaml/dist/log.js"(exports2) {
    "use strict";
    var node_process = require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports2.debug = debug;
    exports2.warn = warn;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports2.addMergeToJSMap = addMergeToJSMap;
    exports2.isMergeKey = isMergeKey;
    exports2.merge = merge;
  }
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports2) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports2.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/yaml/dist/nodes/Pair.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports2.Pair = Pair;
    exports2.createPair = createPair;
  }
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyCollection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
        if (i < items.length - 1) {
          str += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str += ",";
          }
        }
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports2.stringifyCollection = stringifyCollection;
  }
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLMap.js"(exports2) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports2.YAMLMap = YAMLMap;
    exports2.findPair = findPair;
  }
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/yaml/dist/schema/common/map.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports2.map = map;
  }
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLSeq.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports2.YAMLSeq = YAMLSeq;
  }
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/yaml/dist/schema/common/seq.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports2.seq = seq;
  }
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/yaml/dist/schema/common/string.js"(exports2) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports2.string = string;
  }
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/yaml/dist/schema/common/null.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports2.nullTag = nullTag;
  }
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/yaml/dist/schema/core/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports2.boolTag = boolTag;
  }
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyNumber.js"(exports2) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num = typeof value === "number" ? value : Number(value);
      if (!isFinite(num))
        return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports2.stringifyNumber = stringifyNumber;
  }
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/yaml/dist/schema/core/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/yaml/dist/schema/core/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/yaml/dist/schema/core/schema.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/yaml/dist/schema/json/schema.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports2) {
    "use strict";
    var node_buffer = require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i = 0; i < str.length; ++i)
            buffer[i] = str.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str.substr(o, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports2.binary = binary;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports2.createPairs = createPairs;
    exports2.pairs = pairs;
    exports2.resolvePairs = resolvePairs;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports2.YAMLOMap = YAMLOMap;
    exports2.omap = omap;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports2.falseTag = falseTag;
    exports2.trueTag = trueTag;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intBin = intBin;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports2.YAMLSet = YAMLSet;
    exports2.set = set;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts2 = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts2.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
      return sign === "-" ? num(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num = (n) => n;
      if (typeof value === "bigint")
        num = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num(-1);
      }
      const _60 = num(60);
      const parts2 = [value % _60];
      if (value < 60) {
        parts2.unshift(0);
      } else {
        value = (value - parts2[0]) / _60;
        parts2.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts2[0]) / _60;
          parts2.unshift(value);
        }
      }
      return sign + parts2.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports2.floatTime = floatTime;
    exports2.intTime = intTime;
    exports2.timestamp = timestamp;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/yaml/dist/schema/tags.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports2.coreKnownTags = coreKnownTags;
    exports2.getTags = getTags;
  }
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/yaml/dist/schema/Schema.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports2.Schema = Schema;
  }
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyDocument.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports2.stringifyDocument = stringifyDocument;
  }
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/yaml/dist/doc/Document.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version: version2 } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version2 = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version: version2 });
        this.setSchema(version2, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version2, options = {}) {
        if (typeof version2 === "number")
          version2 = String(version2);
        let opt;
        switch (version2) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version2;
            else
              this.directives = new directives.Directives({ version: version2 });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version2);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports2.Document = Document;
  }
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/yaml/dist/errors.js"(exports2) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports2.YAMLError = YAMLError;
    exports2.YAMLParseError = YAMLParseError;
    exports2.YAMLWarning = YAMLWarning;
    exports2.prettifyError = prettifyError;
  }
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/yaml/dist/compose/resolve-props.js"(exports2) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports2.resolveProps = resolveProps;
  }
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/yaml/dist/compose/util-contains-newline.js"(exports2) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports2.containsNewline = containsNewline;
  }
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports2) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports2.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/yaml/dist/compose/util-map-includes.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports2.mapIncludes = mapIncludes;
  }
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-map.js"(exports2) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports2.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-seq.js"(exports2) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports2.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/yaml/dist/compose/resolve-end.js"(exports2) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports2.resolveEnd = resolveEnd;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports2.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/yaml/dist/compose/compose-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports2.composeCollection = composeCollection;
  }
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports2.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return unfoldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function unfoldLines(source) {
      const line = /(.*?)\r?\n/sy;
      let match = line.exec(source);
      if (!match)
        return source;
      let trimEnd, trimBoth;
      try {
        trimEnd = new RegExp("(?<![ 	])[ 	]+$");
        trimBoth = new RegExp("^[ 	]+|(?<![ 	])[ 	]+$", "g");
      } catch {
        trimEnd = /[ \t]+$/;
        trimBoth = /^[ \t]+|[ \t]+$/g;
      }
      let res = match[1].replace(trimEnd, "");
      let sep = " ";
      let pos = line.lastIndex;
      while (match = line.exec(source)) {
        const lm = match[1].replace(trimBoth, "");
        if (lm === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + lm;
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports2.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/yaml/dist/compose/compose-scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports2.composeScalar = composeScalar;
  }
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports2) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports2.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/yaml/dist/compose/compose-node.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports2.composeEmptyNode = composeEmptyNode;
    exports2.composeNode = composeNode;
  }
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/yaml/dist/compose/compose-doc.js"(exports2) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports2.composeDoc = composeDoc;
  }
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/yaml/dist/compose/composer.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i = 0; i < this.errors.length; ++i)
            doc.errors.push(this.errors[i]);
          for (let i = 0; i < this.warnings.length; ++i)
            doc.warnings.push(this.warnings[i]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports2.Composer = Composer;
  }
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/yaml/dist/parse/cst-scalar.js"(exports2) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports2.createScalarToken = createScalarToken;
    exports2.resolveAsScalar = resolveAsScalar;
    exports2.setScalarValue = setScalarValue;
  }
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/yaml/dist/parse/cst-stringify.js"(exports2) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/yaml/dist/parse/cst-visit.js"(exports2) {
    "use strict";
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports2.visit = visit;
  }
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/yaml/dist/parse/cst.js"(exports2) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports2.createScalarToken = cstScalar.createScalarToken;
    exports2.resolveAsScalar = cstScalar.resolveAsScalar;
    exports2.setScalarValue = cstScalar.setScalarValue;
    exports2.stringify = cstStringify.stringify;
    exports2.visit = cstVisit.visit;
    exports2.BOM = BOM;
    exports2.DOCUMENT = DOCUMENT;
    exports2.FLOW_END = FLOW_END;
    exports2.SCALAR = SCALAR;
    exports2.isCollection = isCollection;
    exports2.isScalar = isScalar;
    exports2.prettyToken = prettyToken;
    exports2.tokenType = tokenType;
  }
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/yaml/dist/parse/lexer.js"(exports2) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports2.Lexer = Lexer;
  }
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/yaml/dist/parse/line-counter.js"(exports2) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports2.LineCounter = LineCounter;
  }
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/yaml/dist/parse/parser.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i = 0; i < source.length; ++i)
          target.push(source[i]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports2.Parser = Parser;
  }
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/yaml/dist/public-api.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument2(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument2(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports2.parse = parse;
    exports2.parseAllDocuments = parseAllDocuments;
    exports2.parseDocument = parseDocument2;
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/yaml/dist/index.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports2.Composer = composer.Composer;
    exports2.Document = Document.Document;
    exports2.Schema = Schema.Schema;
    exports2.YAMLError = errors.YAMLError;
    exports2.YAMLParseError = errors.YAMLParseError;
    exports2.YAMLWarning = errors.YAMLWarning;
    exports2.Alias = Alias.Alias;
    exports2.isAlias = identity.isAlias;
    exports2.isCollection = identity.isCollection;
    exports2.isDocument = identity.isDocument;
    exports2.isMap = identity.isMap;
    exports2.isNode = identity.isNode;
    exports2.isPair = identity.isPair;
    exports2.isScalar = identity.isScalar;
    exports2.isSeq = identity.isSeq;
    exports2.Pair = Pair.Pair;
    exports2.Scalar = Scalar.Scalar;
    exports2.YAMLMap = YAMLMap.YAMLMap;
    exports2.YAMLSeq = YAMLSeq.YAMLSeq;
    exports2.CST = cst;
    exports2.Lexer = lexer.Lexer;
    exports2.LineCounter = lineCounter.LineCounter;
    exports2.Parser = parser.Parser;
    exports2.parse = publicApi.parse;
    exports2.parseAllDocuments = publicApi.parseAllDocuments;
    exports2.parseDocument = publicApi.parseDocument;
    exports2.stringify = publicApi.stringify;
    exports2.visit = visit.visit;
    exports2.visitAsync = visit.visitAsync;
  }
});

// src/Main.ts
var Main_exports = {};
__export(Main_exports, {
  default: () => ReviewPlugin
});
module.exports = __toCommonJS(Main_exports);
var import_obsidian = require("obsidian");
var import_node_crypto4 = require("node:crypto");

// src/core/Store.ts
var import_node_path2 = require("node:path");
var import_node_crypto3 = require("node:crypto");
var import_yaml = __toESM(require_dist(), 1);

// src/core/Files.ts
var import_node_crypto = require("node:crypto");
var import_promises = require("node:fs/promises");
var import_node_path = require("node:path");
function canonical(value) {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value !== null && typeof value === "object")
    return "{" + Object.entries(value).filter(([, v]) => v !== void 0).sort(([a], [b]) => a.localeCompare(b, "en")).map(([k, v]) => JSON.stringify(k) + ":" + canonical(v)).join(",") + "}";
  return JSON.stringify(value) ?? "null";
}
function digest(value) {
  return (0, import_node_crypto.createHash)("sha256").update(value).digest("hex");
}
function identifier(id) {
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(id)) throw new Error("Invalid identifier");
  return id;
}
function relativePath(path) {
  if (!path || path.includes("\\") || path.includes("\0") || path.includes(":") || path.startsWith("/") || path.split("/").some((x) => x === "." || x === ".." || x === ""))
    throw new Error("Unsafe relative path");
  return path;
}
function object(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected object");
  return value;
}
function text(value, max = 1e5) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error("Invalid text");
  return value;
}
var Files = class {
  root;
  updateText;
  constructor(root) {
    this.root = (0, import_node_path.resolve)(root);
  }
  async path(relative) {
    relativePath(relative);
    await (0, import_promises.mkdir)(this.root, { recursive: true });
    const root = await (0, import_promises.realpath)(this.root);
    let current = root;
    for (const piece of relative.split("/")) {
      current = (0, import_node_path.join)(current, piece);
      try {
        if ((await (0, import_promises.lstat)(current)).isSymbolicLink())
          throw new Error("Symlink paths are not allowed");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    return current;
  }
  async exists(relative) {
    try {
      await (0, import_promises.lstat)(await this.path(relative));
      return true;
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
  }
  async read(relative, max = 5e6) {
    const p = await this.path(relative);
    const stat = await (0, import_promises.lstat)(p);
    if (!stat.isFile() || stat.size > max) throw new Error("File type or size rejected");
    return (0, import_promises.readFile)(p, "utf8");
  }
  async json(relative) {
    return JSON.parse(await this.read(relative));
  }
  async list(relative) {
    try {
      return (await (0, import_promises.readdir)(await this.path(relative))).sort();
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }
  async entriesWithStamps(relative) {
    const directory = await this.path(relative);
    let names;
    try {
      names = (await (0, import_promises.readdir)(directory)).filter((name) => name.endsWith(".json")).sort();
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
    const result = [];
    for (let i = 0; i < names.length; i += 64) {
      const batch = await Promise.all(
        names.slice(i, i + 64).map(async (name) => {
          const info = await (0, import_promises.lstat)((0, import_node_path.join)(directory, name));
          if (!info.isFile() || info.isSymbolicLink())
            throw new Error("Unexpected event file type");
          return { name, stamp: [info.size, info.mtimeMs, info.ctimeMs].join(":") };
        })
      );
      result.push(...batch);
    }
    return result;
  }
  async write(relative, value, immutable = false) {
    const path = await this.path(relative);
    await (0, import_promises.mkdir)((0, import_node_path.resolve)(path, ".."), { recursive: true });
    await this.path(relative);
    const temporary = path + "." + (0, import_node_crypto.randomUUID)() + ".tmp";
    const handle = await (0, import_promises.open)(temporary, "wx");
    try {
      await handle.writeFile(value, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    try {
      if (immutable) {
        try {
          await (0, import_promises.link)(temporary, path);
        } catch (error) {
          if (error.code !== "EEXIST" || await this.read(relative) !== value)
            throw error;
        }
      } else await (0, import_promises.rename)(temporary, path);
    } finally {
      await (0, import_promises.unlink)(temporary).catch(() => void 0);
    }
    if (await this.read(relative) !== value) throw new Error("File readback failed");
  }
  async put(relative, value) {
    await this.write(relative, canonical(value) + "\n", true);
  }
  async set(relative, value) {
    await this.write(relative, canonical(value) + "\n");
  }
  async lock(name, action) {
    const p = await this.path(name);
    const handle = await (0, import_promises.open)(p, "wx");
    try {
      return await action();
    } finally {
      await handle.close();
      await (0, import_promises.unlink)(p);
    }
  }
};

// src/core/ReviewService.ts
var import_node_crypto2 = require("node:crypto");

// node_modules/ts-fsrs/dist/index.mjs
var FSRSError = class _FSRSError extends Error {
  constructor(message = "FSRS Error") {
    super(message);
    this.name = "FSRSError";
    Error.captureStackTrace?.(this, _FSRSError);
  }
};
var FSRSValidationError = class _FSRSValidationError extends FSRSError {
  constructor(message) {
    super(message);
    this.name = "FSRSValidationError";
    Error.captureStackTrace?.(this, _FSRSValidationError);
  }
};
var State = /* @__PURE__ */ ((State2) => {
  State2[State2["New"] = 0] = "New";
  State2[State2["Learning"] = 1] = "Learning";
  State2[State2["Review"] = 2] = "Review";
  State2[State2["Relearning"] = 3] = "Relearning";
  return State2;
})(State || {});
var Rating = /* @__PURE__ */ ((Rating2) => {
  Rating2[Rating2["Manual"] = 0] = "Manual";
  Rating2[Rating2["Again"] = 1] = "Again";
  Rating2[Rating2["Hard"] = 2] = "Hard";
  Rating2[Rating2["Good"] = 3] = "Good";
  Rating2[Rating2["Easy"] = 4] = "Easy";
  return Rating2;
})(Rating || {});
var TypeConvert = class _TypeConvert {
  static card(card) {
    return {
      ...card,
      state: _TypeConvert.state(card.state),
      due: _TypeConvert.time(card.due),
      last_review: card.last_review ? _TypeConvert.time(card.last_review) : void 0
    };
  }
  static rating(value) {
    if (typeof value === "string") {
      const firstLetter = value.charAt(0).toUpperCase();
      const restOfString = value.slice(1).toLowerCase();
      const ret = Rating[`${firstLetter}${restOfString}`];
      if (ret === void 0) {
        throw new FSRSValidationError(`Invalid rating:[${value}]`);
      }
      return ret;
    } else if (typeof value === "number") {
      return value;
    }
    throw new FSRSValidationError(`Invalid rating:[${value}]`);
  }
  static state(value) {
    if (typeof value === "string") {
      const firstLetter = value.charAt(0).toUpperCase();
      const restOfString = value.slice(1).toLowerCase();
      const ret = State[`${firstLetter}${restOfString}`];
      if (ret === void 0) {
        throw new FSRSValidationError(`Invalid state:[${value}]`);
      }
      return ret;
    } else if (typeof value === "number") {
      return value;
    }
    throw new FSRSValidationError(`Invalid state:[${value}]`);
  }
  static time(value) {
    if (value instanceof Date) {
      return value;
    }
    const date = new Date(value);
    if (typeof value === "object" && value !== null && !Number.isNaN(Date.parse(value) || +date)) {
      return date;
    } else if (typeof value === "string") {
      const timestamp = Date.parse(value);
      if (!Number.isNaN(timestamp)) {
        return new Date(timestamp);
      } else {
        throw new FSRSValidationError(`Invalid date:[${value}]`);
      }
    } else if (typeof value === "number") {
      return new Date(value);
    }
    throw new FSRSValidationError(`Invalid date:[${value}]`);
  }
  static review_log(log) {
    return {
      ...log,
      due: _TypeConvert.time(log.due),
      rating: _TypeConvert.rating(log.rating),
      state: _TypeConvert.state(log.state),
      review: _TypeConvert.time(log.review)
    };
  }
};
Date.prototype.scheduler = function(t, isDay) {
  return date_scheduler(this, t, isDay);
};
Date.prototype.diff = function(pre, unit) {
  return date_diff(this, pre, unit);
};
Date.prototype.format = function() {
  return formatDate(this);
};
Date.prototype.dueFormat = function(last_review, unit, timeUnit) {
  return show_diff_message(this, last_review, unit, timeUnit);
};
function date_scheduler(now, t, isDay) {
  return new Date(
    isDay ? TypeConvert.time(now).getTime() + t * 24 * 60 * 60 * 1e3 : TypeConvert.time(now).getTime() + t * 60 * 1e3
  );
}
function date_diff(now, pre, unit) {
  if (!now || !pre) {
    throw new FSRSValidationError("Invalid date");
  }
  const diff = TypeConvert.time(now).getTime() - TypeConvert.time(pre).getTime();
  let r = 0;
  switch (unit) {
    case "days":
      r = Math.floor(diff / (24 * 60 * 60 * 1e3));
      break;
    case "minutes":
      r = Math.floor(diff / (60 * 1e3));
      break;
  }
  return r;
}
function formatDate(dateInput) {
  const date = TypeConvert.time(dateInput);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hours)}:${padZero(
    minutes
  )}:${padZero(seconds)}`;
}
function padZero(num) {
  return num < 10 ? `0${num}` : `${num}`;
}
var TIMEUNIT = [60, 60, 24, 31, 12];
var TIMEUNITFORMAT = ["second", "min", "hour", "day", "month", "year"];
function show_diff_message(due, last_review, unit, timeUnit = TIMEUNITFORMAT) {
  due = TypeConvert.time(due);
  last_review = TypeConvert.time(last_review);
  if (timeUnit.length !== TIMEUNITFORMAT.length) {
    timeUnit = TIMEUNITFORMAT;
  }
  let diff = due.getTime() - last_review.getTime();
  let i = 0;
  diff /= 1e3;
  for (i = 0; i < TIMEUNIT.length; i++) {
    if (diff < TIMEUNIT[i]) {
      break;
    } else {
      diff /= TIMEUNIT[i];
    }
  }
  return `${Math.floor(diff)}${unit ? timeUnit[i] : ""}`;
}
var Grades = Object.freeze([
  Rating.Again,
  Rating.Hard,
  Rating.Good,
  Rating.Easy
]);
var FUZZ_RANGES = [
  {
    start: 2.5,
    end: 7,
    factor: 0.15
  },
  {
    start: 7,
    end: 20,
    factor: 0.1
  },
  {
    start: 20,
    end: Infinity,
    factor: 0.05
  }
];
function get_fuzz_range(interval, elapsed_days, maximum_interval) {
  let delta = 1;
  for (const range of FUZZ_RANGES) {
    delta += range.factor * Math.max(Math.min(interval, range.end) - range.start, 0);
  }
  interval = Math.min(interval, maximum_interval);
  let min_ivl = Math.max(2, Math.round(interval - delta));
  const max_ivl = Math.min(Math.round(interval + delta), maximum_interval);
  if (interval > elapsed_days) {
    min_ivl = Math.max(min_ivl, elapsed_days + 1);
  }
  min_ivl = Math.min(min_ivl, max_ivl);
  return { min_ivl, max_ivl };
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function roundTo(num, decimals) {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
}
function dateDiffInDays(last, cur) {
  const utc1 = Date.UTC(
    last.getUTCFullYear(),
    last.getUTCMonth(),
    last.getUTCDate()
  );
  const utc2 = Date.UTC(
    cur.getUTCFullYear(),
    cur.getUTCMonth(),
    cur.getUTCDate()
  );
  return Math.floor(
    (utc2 - utc1) / 864e5
    /** 1000 * 60 * 60 * 24*/
  );
}
var ConvertStepUnitToMinutes = (step) => {
  const unit = step.slice(-1);
  const value = parseInt(step.slice(0, -1), 10);
  if (Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
    throw new FSRSValidationError(`Invalid step value: ${step}`);
  }
  switch (unit) {
    case "m":
      return value;
    case "h":
      return value * 60;
    case "d":
      return value * 1440;
    default:
      throw new FSRSValidationError(
        `Invalid step unit: ${step}, expected m/h/d`
      );
  }
};
var BasicLearningStepsStrategy = (params, state, cur_step) => {
  const learning_steps = state === State.Relearning || state === State.Review ? params.relearning_steps : params.learning_steps;
  const steps_length = learning_steps.length;
  if (steps_length === 0 || cur_step >= steps_length) return {};
  const firstStep = learning_steps[0];
  const toMinutes = ConvertStepUnitToMinutes;
  const getAgainInterval = () => {
    return toMinutes(firstStep);
  };
  const getHardInterval = () => {
    if (steps_length === 1) return Math.round(toMinutes(firstStep) * 1.5);
    const nextStep = learning_steps[1];
    return Math.round((toMinutes(firstStep) + toMinutes(nextStep)) / 2);
  };
  const getStepInfo = (index) => {
    if (index < 0 || index >= steps_length) {
      return null;
    } else {
      return learning_steps[index];
    }
  };
  const getGoodMinutes = (step) => {
    return toMinutes(step);
  };
  const result = {};
  const step_info = getStepInfo(Math.max(0, cur_step));
  if (state === State.Review) {
    result[Rating.Again] = {
      scheduled_minutes: toMinutes(step_info),
      next_step: 0
    };
    return result;
  } else {
    result[Rating.Again] = {
      scheduled_minutes: getAgainInterval(),
      next_step: 0
    };
    result[Rating.Hard] = {
      scheduled_minutes: getHardInterval(),
      next_step: cur_step
    };
    const next_info = getStepInfo(cur_step + 1);
    if (next_info) {
      const nextMin = getGoodMinutes(next_info);
      if (nextMin) {
        result[Rating.Good] = {
          scheduled_minutes: Math.round(nextMin),
          next_step: cur_step + 1
        };
      }
    }
  }
  return result;
};
function DefaultInitSeedStrategy() {
  const time = this.review_time.getTime();
  const reps = this.current.reps;
  const mul = this.current.difficulty * this.current.stability;
  return `${time}_${reps}_${mul}`;
}
var StrategyMode = /* @__PURE__ */ ((StrategyMode2) => {
  StrategyMode2["SCHEDULER"] = "Scheduler";
  StrategyMode2["LEARNING_STEPS"] = "LearningSteps";
  StrategyMode2["SEED"] = "Seed";
  return StrategyMode2;
})(StrategyMode || {});
var AbstractScheduler = class {
  last;
  current;
  review_time;
  next = /* @__PURE__ */ new Map();
  algorithm;
  strategies;
  elapsed_days = 0;
  // init
  constructor(card, now, algorithm, strategies) {
    this.algorithm = algorithm;
    this.last = TypeConvert.card(card);
    this.current = TypeConvert.card(card);
    this.review_time = TypeConvert.time(now);
    this.strategies = strategies;
    this.init();
  }
  checkGrade(grade) {
    if (!Number.isFinite(grade) || grade < 1 || grade > 4) {
      throw new FSRSValidationError(`Invalid grade "${grade}",expected 1-4`);
    }
  }
  init() {
    const { state, last_review } = this.current;
    let interval = 0;
    if (state !== State.New && last_review) {
      interval = dateDiffInDays(last_review, this.review_time);
    }
    this.current.last_review = this.review_time;
    this.elapsed_days = interval;
    this.current.elapsed_days = interval;
    this.current.reps += 1;
    let seed_strategy = DefaultInitSeedStrategy;
    if (this.strategies) {
      const custom_strategy = this.strategies.get(StrategyMode.SEED);
      if (custom_strategy) {
        seed_strategy = custom_strategy;
      }
    }
    this.algorithm.seed = seed_strategy.call(this);
  }
  preview() {
    return {
      [Rating.Again]: this.review(Rating.Again),
      [Rating.Hard]: this.review(Rating.Hard),
      [Rating.Good]: this.review(Rating.Good),
      [Rating.Easy]: this.review(Rating.Easy),
      [Symbol.iterator]: this.previewIterator.bind(this)
    };
  }
  *previewIterator() {
    for (const grade of Grades) {
      yield this.review(grade);
    }
  }
  review(grade) {
    const { state } = this.last;
    let item;
    this.checkGrade(grade);
    switch (state) {
      case State.New:
        item = this.newState(grade);
        break;
      case State.Learning:
      case State.Relearning:
        item = this.learningState(grade);
        break;
      case State.Review:
        item = this.reviewState(grade);
        break;
    }
    return item;
  }
  buildLog(rating) {
    const { last_review, due, elapsed_days } = this.last;
    return {
      rating,
      state: this.current.state,
      due: last_review || due,
      stability: this.current.stability,
      difficulty: this.current.difficulty,
      elapsed_days: this.elapsed_days,
      last_elapsed_days: elapsed_days,
      scheduled_days: this.current.scheduled_days,
      learning_steps: this.current.learning_steps,
      review: this.review_time
    };
  }
};
var Alea = class {
  c;
  s0;
  s1;
  s2;
  constructor(seed) {
    const mash = Mash();
    this.c = 1;
    this.s0 = mash(" ");
    this.s1 = mash(" ");
    this.s2 = mash(" ");
    if (seed == null) seed = Date.now();
    this.s0 -= mash(seed);
    if (this.s0 < 0) this.s0 += 1;
    this.s1 -= mash(seed);
    if (this.s1 < 0) this.s1 += 1;
    this.s2 -= mash(seed);
    if (this.s2 < 0) this.s2 += 1;
  }
  next() {
    const t = 2091639 * this.s0 + this.c * 23283064365386963e-26;
    this.s0 = this.s1;
    this.s1 = this.s2;
    this.c = t | 0;
    this.s2 = t - this.c;
    return this.s2;
  }
  set state(state) {
    this.c = state.c;
    this.s0 = state.s0;
    this.s1 = state.s1;
    this.s2 = state.s2;
  }
  get state() {
    return {
      c: this.c,
      s0: this.s0,
      s1: this.s1,
      s2: this.s2
    };
  }
};
function Mash() {
  let n = 4022871197;
  return function mash(data) {
    data = String(data);
    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 4294967296;
    }
    return (n >>> 0) * 23283064365386963e-26;
  };
}
function alea(seed) {
  const xg = new Alea(seed);
  const prng = () => xg.next();
  prng.int32 = () => xg.next() * 4294967296 | 0;
  prng.double = () => prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;
  prng.state = () => xg.state;
  prng.importState = (state) => {
    xg.state = state;
    return prng;
  };
  return prng;
}
var version = "5.4.2";
var default_request_retention = 0.9;
var default_maximum_interval = 36500;
var default_enable_fuzz = false;
var default_enable_short_term = true;
var default_learning_steps = Object.freeze([
  "1m",
  "10m"
]);
var default_relearning_steps = Object.freeze([
  "10m"
]);
var FSRSVersion = `v${version} using FSRS-6.0`;
var S_MIN = 1e-3;
var INIT_S_MAX = 100;
var FSRS5_DEFAULT_DECAY = 0.5;
var FSRS6_DEFAULT_DECAY = 0.1542;
var default_w = Object.freeze([
  0.212,
  1.2931,
  2.3065,
  8.2956,
  6.4133,
  0.8334,
  3.0194,
  1e-3,
  1.8722,
  0.1666,
  0.796,
  1.4835,
  0.0614,
  0.2629,
  1.6483,
  0.6014,
  1.8729,
  0.5425,
  0.0912,
  0.0658,
  FSRS6_DEFAULT_DECAY
]);
var W17_W18_Ceiling = 2;
var CLAMP_PARAMETERS = (w17_w18_ceiling, enable_short_term = default_enable_short_term) => [
  [S_MIN, INIT_S_MAX],
  [S_MIN, INIT_S_MAX],
  [S_MIN, INIT_S_MAX],
  [S_MIN, INIT_S_MAX],
  [1, 10],
  [1e-3, 4],
  [1e-3, 4],
  [1e-3, 0.75],
  [0, 4.5],
  [0, 0.8],
  [1e-3, 3.5],
  [1e-3, 5],
  [1e-3, 0.25],
  [1e-3, 0.9],
  [0, 4],
  [0, 1],
  [1, 6],
  [0, w17_w18_ceiling],
  [0, w17_w18_ceiling],
  [
    enable_short_term ? 0.01 : 0,
    0.8
  ],
  [0.1, 0.8]
];
var clipParameters = (parameters, numRelearningSteps, enableShortTerm = default_enable_short_term) => {
  const clip = CLAMP_PARAMETERS(W17_W18_Ceiling, enableShortTerm).slice(
    0,
    parameters.length
  );
  if (Math.max(0, numRelearningSteps) > 1) {
    const w11 = clamp(parameters[11] || 0, clip[11][0], clip[11][1]);
    const w13 = clamp(parameters[13] || 0, clip[13][0], clip[13][1]);
    const w14 = clamp(parameters[14] || 0, clip[14][0], clip[14][1]);
    const value = -(Math.log(w11) + Math.log(Math.pow(2, w13) - 1) + w14 * 0.3) / numRelearningSteps;
    const w17_w18_ceiling = clamp(
      roundTo(Math.sqrt(Math.max(value, 0)), 8),
      0.01,
      W17_W18_Ceiling
    );
    if (clip[17]) clip[17] = [clip[17][0], w17_w18_ceiling];
    if (clip[18]) clip[18] = [clip[18][0], w17_w18_ceiling];
  }
  return clip.map(
    ([min, max], index) => clamp(parameters[index] || 0, min, max)
  );
};
var migrateParameters = (parameters, numRelearningSteps = 0, enableShortTerm = default_enable_short_term) => {
  if (parameters === void 0) {
    return [...default_w];
  }
  switch (parameters.length) {
    case 21:
      return clipParameters(
        Array.from(parameters),
        numRelearningSteps,
        enableShortTerm
      );
    case 19:
      console.debug("[FSRS-6]auto fill w from 19 to 21 length");
      return clipParameters(
        Array.from(parameters),
        numRelearningSteps,
        enableShortTerm
      ).concat([0, FSRS5_DEFAULT_DECAY]);
    case 17: {
      const w = clipParameters(
        Array.from(parameters),
        numRelearningSteps,
        enableShortTerm
      );
      w[4] = +(w[5] * 2 + w[4]).toFixed(8);
      w[5] = +(Math.log(w[5] * 3 + 1) / 3).toFixed(8);
      w[6] = +(w[6] + 0.5).toFixed(8);
      console.debug("[FSRS-6]auto fill w from 17 to 21 length");
      return w.concat([0, 0, 0, FSRS5_DEFAULT_DECAY]);
    }
    default:
      console.warn("[FSRS]Invalid parameters length, using default parameters");
      return [...default_w];
  }
};
var generatorParameters = (props) => {
  const learning_steps = Array.isArray(props?.learning_steps) ? props.learning_steps : default_learning_steps;
  const relearning_steps = Array.isArray(props?.relearning_steps) ? props.relearning_steps : default_relearning_steps;
  const enable_short_term = props?.enable_short_term ?? default_enable_short_term;
  const w = migrateParameters(
    props?.w,
    relearning_steps.length,
    enable_short_term
  );
  return {
    request_retention: props?.request_retention || default_request_retention,
    maximum_interval: props?.maximum_interval || default_maximum_interval,
    w,
    enable_fuzz: props?.enable_fuzz ?? default_enable_fuzz,
    enable_short_term,
    learning_steps,
    relearning_steps
  };
};
function createEmptyCard(now, afterHandler) {
  const emptyCard = {
    due: now ? TypeConvert.time(now) : /* @__PURE__ */ new Date(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    learning_steps: 0,
    state: State.New,
    last_review: void 0
  };
  if (afterHandler && typeof afterHandler === "function") {
    return afterHandler(emptyCard);
  } else {
    return emptyCard;
  }
}
var computeDecayFactor = (decayOrParams) => {
  const decay = typeof decayOrParams === "number" ? -decayOrParams : -decayOrParams[20];
  const factor = Math.exp(Math.pow(decay, -1) * Math.log(0.9)) - 1;
  return { decay, factor: roundTo(factor, 8) };
};
function forgetting_curve(decayOrParams, elapsed_days, stability) {
  const { decay, factor } = computeDecayFactor(decayOrParams);
  return roundTo(Math.pow(1 + factor * elapsed_days / stability, decay), 8);
}
var FSRSAlgorithm = class {
  param;
  intervalModifier;
  _seed;
  constructor(params) {
    this.param = new Proxy(
      this.prepare_parameters(params),
      this.params_handler_proxy()
    );
    this.intervalModifier = this.calculate_interval_modifier(
      this.param.request_retention
    );
    this.forgetting_curve = forgetting_curve.bind(this, this.param.w);
  }
  get interval_modifier() {
    return this.intervalModifier;
  }
  set seed(seed) {
    this._seed = seed;
  }
  /**
   * @see https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm#fsrs-5
   *
   * The formula used is: $$I(r,s) = (r^{\frac{1}{DECAY}} - 1) / FACTOR \times s$$
   * @param request_retention 0<request_retention<=1,Requested retention rate
   * @throws {Error} Requested retention rate should be in the range (0,1]
   */
  calculate_interval_modifier(request_retention) {
    if (request_retention <= 0 || request_retention > 1) {
      throw new FSRSValidationError(
        "Requested retention rate should be in the range (0,1]"
      );
    }
    const { decay, factor } = computeDecayFactor(this.param.w);
    return roundTo((Math.pow(request_retention, 1 / decay) - 1) / factor, 8);
  }
  /**
   * Get the parameters of the algorithm.
   */
  get parameters() {
    return this.param;
  }
  /**
   * Set the parameters of the algorithm.
   * @param params Partial<FSRSParameters>
   */
  set parameters(params) {
    this.update_parameters(params);
  }
  params_handler_proxy() {
    const _this = this;
    return {
      set: function(target, prop, value) {
        if (prop === "request_retention" && Number.isFinite(value)) {
          _this.intervalModifier = _this.calculate_interval_modifier(
            Number(value)
          );
        } else if (prop === "w") {
          value = migrateParameters(
            value,
            target.relearning_steps.length,
            target.enable_short_term
          );
          value = clipParameters(
            Array.from(value),
            target.relearning_steps.length,
            target.enable_short_term
          );
          _this.forgetting_curve = forgetting_curve.bind(this, value);
          _this.intervalModifier = _this.calculate_interval_modifier(
            Number(target.request_retention)
          );
        }
        Reflect.set(target, prop, value);
        return true;
      }
    };
  }
  update_parameters(params) {
    const _params = this.prepare_parameters(params);
    for (const key in _params) {
      const paramKey = key;
      this.param[paramKey] = _params[paramKey];
    }
  }
  prepare_parameters = (params) => {
    const generated = generatorParameters(params);
    generated.w = clipParameters(
      Array.from(generated.w),
      generated.relearning_steps.length,
      generated.enable_short_term
    );
    return generated;
  };
  /**
     * The formula used is :
     * $$ S_0(G) = w_{G-1}$$
     * $$S_0 = \max \lbrace S_0,0.1\rbrace $$
  
     * @param g Grade (rating at Anki) [1.again,2.hard,3.good,4.easy]
     * @return Stability (interval when R=90%)
     */
  init_stability(g) {
    return Math.max(this.param.w[g - 1], 0.1);
  }
  /**
   * The formula used is :
   * $$D_0(G) = w_4 - e^{(G-1) \cdot w_5} + 1 $$
   * $$D_0 = \min \lbrace \max \lbrace D_0(G),1 \rbrace,10 \rbrace$$
   * where the $$D_0(1)=w_4$$ when the first rating is good.
   *
   * @param {Grade} g Grade (rating at Anki) [1.again,2.hard,3.good,4.easy]
   * @return {number} Difficulty $$D \in [1,10]$$
   */
  init_difficulty(g) {
    const w = this.param.w;
    const d = w[4] - Math.exp((g - 1) * w[5]) + 1;
    return roundTo(d, 8);
  }
  /**
   * If fuzzing is disabled or ivl is less than 2.5, it returns the original interval.
   * @param {number} ivl - The interval to be fuzzed.
   * @param {number} elapsed_days t days since the last review
   * @return {number} - The fuzzed interval.
   **/
  apply_fuzz(ivl, elapsed_days) {
    if (!this.param.enable_fuzz || ivl < 2.5) return Math.round(ivl);
    const generator = alea(this._seed);
    const fuzz_factor = generator();
    const { min_ivl, max_ivl } = get_fuzz_range(
      ivl,
      elapsed_days,
      this.param.maximum_interval
    );
    return Math.floor(fuzz_factor * (max_ivl - min_ivl + 1) + min_ivl);
  }
  /**
   *   @see The formula used is : {@link FSRSAlgorithm.calculate_interval_modifier}
   *   @param {number} s - Stability (interval when R=90%)
   *   @param {number} elapsed_days t days since the last review
   */
  next_interval(s, elapsed_days) {
    const newInterval = Math.min(
      Math.max(1, Math.round(s * this.intervalModifier)),
      this.param.maximum_interval
    );
    return this.apply_fuzz(newInterval, elapsed_days);
  }
  /**
   * @see https://github.com/open-spaced-repetition/fsrs4anki/issues/697
   */
  linear_damping(delta_d, old_d) {
    return roundTo(delta_d * (10 - old_d) / 9, 8);
  }
  /**
   * The formula used is :
   * $$\text{delta}_d = -w_6 \cdot (g - 3)$$
   * $$\text{next}_d = D + \text{linear damping}(\text{delta}_d , D)$$
   * $$D^\prime(D,R) = w_7 \cdot D_0(4) +(1 - w_7) \cdot \text{next}_d$$
   * @param {number} d Difficulty $$D \in [1,10]$$
   * @param {Grade} g Grade (rating at Anki) [1.again,2.hard,3.good,4.easy]
   * @return {number} $$\text{next}_D$$
   */
  next_difficulty(d, g) {
    const delta_d = -this.param.w[6] * (g - 3);
    const next_d = d + this.linear_damping(delta_d, d);
    return clamp(
      this.mean_reversion(this.init_difficulty(Rating.Easy), next_d),
      1,
      10
    );
  }
  /**
   * The formula used is :
   * $$w_7 \cdot \text{init} +(1 - w_7) \cdot \text{current}$$
   * @param {number} init $$w_2 : D_0(3) = w_2 + (R-2) \cdot w_3= w_2$$
   * @param {number} current $$D - w_6 \cdot (R - 2)$$
   * @return {number} difficulty
   */
  mean_reversion(init, current) {
    const w = this.param.w;
    return roundTo(w[7] * init + (1 - w[7]) * current, 8);
  }
  /**
   * The formula used is :
   * $$S^\prime_r(D,S,R,G) = S\cdot(e^{w_8}\cdot (11-D)\cdot S^{-w_9}\cdot(e^{w_{10}\cdot(1-R)}-1)\cdot w_{15}(\text{if} G=2) \cdot w_{16}(\text{if} G=4)+1)$$
   * @param {number} d Difficulty D \in [1,10]
   * @param {number} s Stability (interval when R=90%)
   * @param {number} r Retrievability (probability of recall)
   * @param {Grade} g Grade (Rating[0.again,1.hard,2.good,3.easy])
   * @return {number} S^\prime_r new stability after recall
   */
  next_recall_stability(d, s, r, g) {
    const w = this.param.w;
    const hard_penalty = Rating.Hard === g ? w[15] : 1;
    const easy_bound = Rating.Easy === g ? w[16] : 1;
    return roundTo(
      clamp(
        s * (1 + Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) * (Math.exp((1 - r) * w[10]) - 1) * hard_penalty * easy_bound),
        S_MIN,
        36500
      ),
      8
    );
  }
  /**
   * The formula used is :
   * $$S^\prime_f(D,S,R) = w_{11}\cdot D^{-w_{12}}\cdot ((S+1)^{w_{13}}-1) \cdot e^{w_{14}\cdot(1-R)}$$
   * enable_short_term = true : $$S^\prime_f \in \min \lbrace \max \lbrace S^\prime_f,0.01\rbrace, \frac{S}{e^{w_{17} \cdot w_{18}}} \rbrace$$
   * enable_short_term = false : $$S^\prime_f \in \min \lbrace \max \lbrace S^\prime_f,0.01\rbrace, S \rbrace$$
   * @param {number} d Difficulty D \in [1,10]
   * @param {number} s Stability (interval when R=90%)
   * @param {number} r Retrievability (probability of recall)
   * @return {number} S^\prime_f new stability after forgetting
   */
  next_forget_stability(d, s, r) {
    const w = this.param.w;
    return roundTo(
      clamp(
        w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]),
        S_MIN,
        36500
      ),
      8
    );
  }
  /**
   * The formula used is :
   * $$S^\prime_s(S,G) = S \cdot e^{w_{17} \cdot (G-3+w_{18})}$$
   * @param {number} s Stability (interval when R=90%)
   * @param {Grade} g Grade (Rating[0.again,1.hard,2.good,3.easy])
   */
  next_short_term_stability(s, g) {
    const w = this.param.w;
    const sinc = Math.pow(s, -w[19]) * Math.exp(w[17] * (g - 3 + w[18]));
    const maskedSinc = g >= Rating.Hard ? Math.max(sinc, 1) : sinc;
    return roundTo(clamp(s * maskedSinc, S_MIN, 36500), 8);
  }
  /**
   * The formula used is :
   * $$R(t,S) = (1 + \text{FACTOR} \times \frac{t}{9 \cdot S})^{\text{DECAY}}$$
   * @param {number} elapsed_days t days since the last review
   * @param {number} stability Stability (interval when R=90%)
   * @return {number} r Retrievability (probability of recall)
   */
  forgetting_curve;
  /**
   * Calculates the next state of memory based on the current state, time elapsed, and grade.
   *
   * @param memory_state - The current state of memory, which can be null.
   * @param t - The time elapsed since the last review.
   * @param {Rating} g Grade (Rating[0.Manual,1.Again,2.Hard,3.Good,4.Easy])
   * @param r - Optional retrievability value. If not provided, it will be calculated.
   * @returns The next state of memory with updated difficulty and stability.
   */
  next_state(memory_state, t, g, r) {
    const { difficulty: d, stability: s } = memory_state ?? {
      difficulty: 0,
      stability: 0
    };
    if (t < 0) {
      throw new FSRSValidationError(`Invalid delta_t "${t}"`);
    }
    if (g < 0 || g > 4) {
      throw new FSRSValidationError(`Invalid grade "${g}"`);
    }
    if (d === 0 && s === 0) {
      return {
        difficulty: clamp(this.init_difficulty(g), 1, 10),
        stability: this.init_stability(g)
      };
    }
    if (g === 0) {
      return {
        difficulty: d,
        stability: s
      };
    }
    if (d < 1 || s < S_MIN) {
      throw new FSRSValidationError(
        `Invalid memory state { difficulty: ${d}, stability: ${s} }`
      );
    }
    const w = this.param.w;
    r = typeof r === "number" ? r : this.forgetting_curve(t, s);
    let new_s;
    if (t === 0 && this.param.enable_short_term) {
      new_s = this.next_short_term_stability(s, g);
    } else if (g === 1) {
      const s_after_fail = this.next_forget_stability(d, s, r);
      let [w_17, w_18] = [0, 0];
      if (this.param.enable_short_term) {
        w_17 = w[17];
        w_18 = w[18];
      }
      const next_s_min = s / Math.exp(w_17 * w_18);
      new_s = clamp(roundTo(next_s_min, 8), S_MIN, s_after_fail);
    } else {
      new_s = this.next_recall_stability(d, s, r, g);
    }
    const new_d = this.next_difficulty(d, g);
    return { difficulty: new_d, stability: new_s };
  }
};
var BasicScheduler = class extends AbstractScheduler {
  learningStepsStrategy;
  constructor(card, now, algorithm, strategies) {
    super(card, now, algorithm, strategies);
    let learningStepStrategy = BasicLearningStepsStrategy;
    if (this.strategies) {
      const custom_strategy = this.strategies.get(StrategyMode.LEARNING_STEPS);
      if (custom_strategy) {
        learningStepStrategy = custom_strategy;
      }
    }
    this.learningStepsStrategy = learningStepStrategy;
  }
  getLearningInfo(card, grade) {
    const parameters = this.algorithm.parameters;
    card.learning_steps = card.learning_steps || 0;
    const steps_strategy = this.learningStepsStrategy(
      parameters,
      card.state,
      card.learning_steps
    );
    const scheduled_minutes = Math.max(
      0,
      steps_strategy[grade]?.scheduled_minutes ?? 0
    );
    const next_steps = Math.max(0, steps_strategy[grade]?.next_step ?? 0);
    return {
      scheduled_minutes,
      next_steps
    };
  }
  /**
   * @description This function applies the learning steps based on the current card's state and grade.
   */
  applyLearningSteps(nextCard, grade, to_state) {
    const { scheduled_minutes, next_steps } = this.getLearningInfo(
      this.current,
      grade
    );
    if (scheduled_minutes > 0 && scheduled_minutes < 1440) {
      nextCard.learning_steps = next_steps;
      nextCard.scheduled_days = 0;
      nextCard.state = to_state;
      nextCard.due = date_scheduler(
        this.review_time,
        Math.round(scheduled_minutes),
        false
        /** true:days false: minute */
      );
    } else {
      nextCard.state = State.Review;
      if (scheduled_minutes >= 1440) {
        nextCard.learning_steps = next_steps;
        nextCard.due = date_scheduler(
          this.review_time,
          Math.round(scheduled_minutes),
          false
          /** true:days false: minute */
        );
        nextCard.scheduled_days = Math.floor(scheduled_minutes / 1440);
      } else {
        nextCard.learning_steps = 0;
        const interval = this.algorithm.next_interval(
          nextCard.stability,
          this.elapsed_days
        );
        nextCard.scheduled_days = interval;
        nextCard.due = date_scheduler(this.review_time, interval, true);
      }
    }
  }
  newState(grade) {
    const exist = this.next.get(grade);
    if (exist) {
      return exist;
    }
    const next = this.next_ds(this.elapsed_days, grade);
    this.applyLearningSteps(next, grade, State.Learning);
    const item = {
      card: next,
      log: this.buildLog(grade)
    };
    this.next.set(grade, item);
    return item;
  }
  learningState(grade) {
    const exist = this.next.get(grade);
    if (exist) {
      return exist;
    }
    const next = this.next_ds(this.elapsed_days, grade);
    this.applyLearningSteps(
      next,
      grade,
      this.last.state
      /** Learning or Relearning */
    );
    const item = {
      card: next,
      log: this.buildLog(grade)
    };
    this.next.set(grade, item);
    return item;
  }
  reviewState(grade) {
    const exist = this.next.get(grade);
    if (exist) {
      return exist;
    }
    const interval = this.elapsed_days;
    const retrievability = this.algorithm.forgetting_curve(
      interval,
      this.current.stability
    );
    const next_again = this.next_ds(interval, Rating.Again, retrievability);
    const next_hard = this.next_ds(interval, Rating.Hard, retrievability);
    const next_good = this.next_ds(interval, Rating.Good, retrievability);
    const next_easy = this.next_ds(interval, Rating.Easy, retrievability);
    this.next_interval(next_hard, next_good, next_easy, interval);
    this.next_state(next_hard, next_good, next_easy);
    this.applyLearningSteps(next_again, Rating.Again, State.Relearning);
    next_again.lapses += 1;
    const item_again = {
      card: next_again,
      log: this.buildLog(Rating.Again)
    };
    const item_hard = {
      card: next_hard,
      log: super.buildLog(Rating.Hard)
    };
    const item_good = {
      card: next_good,
      log: super.buildLog(Rating.Good)
    };
    const item_easy = {
      card: next_easy,
      log: super.buildLog(Rating.Easy)
    };
    this.next.set(Rating.Again, item_again);
    this.next.set(Rating.Hard, item_hard);
    this.next.set(Rating.Good, item_good);
    this.next.set(Rating.Easy, item_easy);
    return this.next.get(grade);
  }
  /**
   * Review next_ds
   */
  next_ds(t, g, r) {
    const next_state = this.algorithm.next_state(
      {
        difficulty: this.current.difficulty,
        stability: this.current.stability
      },
      t,
      g,
      r
    );
    const card = TypeConvert.card(this.current);
    card.difficulty = next_state.difficulty;
    card.stability = next_state.stability;
    return card;
  }
  /**
   * Review next_interval
   */
  next_interval(next_hard, next_good, next_easy, interval) {
    let hard_interval, good_interval;
    hard_interval = this.algorithm.next_interval(next_hard.stability, interval);
    good_interval = this.algorithm.next_interval(next_good.stability, interval);
    hard_interval = Math.min(hard_interval, good_interval);
    good_interval = Math.max(good_interval, hard_interval + 1);
    const easy_interval = Math.max(
      this.algorithm.next_interval(next_easy.stability, interval),
      good_interval + 1
    );
    next_hard.scheduled_days = hard_interval;
    next_hard.due = date_scheduler(this.review_time, hard_interval, true);
    next_good.scheduled_days = good_interval;
    next_good.due = date_scheduler(this.review_time, good_interval, true);
    next_easy.scheduled_days = easy_interval;
    next_easy.due = date_scheduler(this.review_time, easy_interval, true);
  }
  /**
   * Review next_state
   */
  next_state(next_hard, next_good, next_easy) {
    next_hard.state = State.Review;
    next_hard.learning_steps = 0;
    next_good.state = State.Review;
    next_good.learning_steps = 0;
    next_easy.state = State.Review;
    next_easy.learning_steps = 0;
  }
};
var LongTermScheduler = class extends AbstractScheduler {
  newState(grade) {
    const exist = this.next.get(grade);
    if (exist) {
      return exist;
    }
    this.current.scheduled_days = 0;
    this.current.elapsed_days = 0;
    const first_interval = 0;
    const next_again = this.next_ds(first_interval, Rating.Again);
    const next_hard = this.next_ds(first_interval, Rating.Hard);
    const next_good = this.next_ds(first_interval, Rating.Good);
    const next_easy = this.next_ds(first_interval, Rating.Easy);
    this.next_interval(
      next_again,
      next_hard,
      next_good,
      next_easy,
      first_interval
    );
    this.next_state(next_again, next_hard, next_good, next_easy);
    this.update_next(next_again, next_hard, next_good, next_easy);
    return this.next.get(grade);
  }
  next_ds(t, g, r) {
    const next_state = this.algorithm.next_state(
      {
        difficulty: this.current.difficulty,
        stability: this.current.stability
      },
      t,
      g,
      r
    );
    const card = TypeConvert.card(this.current);
    card.difficulty = next_state.difficulty;
    card.stability = next_state.stability;
    return card;
  }
  /**
   * @see https://github.com/open-spaced-repetition/ts-fsrs/issues/98#issuecomment-2241923194
   */
  learningState(grade) {
    return this.reviewState(grade);
  }
  reviewState(grade) {
    const exist = this.next.get(grade);
    if (exist) {
      return exist;
    }
    const interval = this.elapsed_days;
    const retrievability = this.algorithm.forgetting_curve(
      interval,
      this.current.stability
    );
    const next_again = this.next_ds(interval, Rating.Again, retrievability);
    const next_hard = this.next_ds(interval, Rating.Hard, retrievability);
    const next_good = this.next_ds(interval, Rating.Good, retrievability);
    const next_easy = this.next_ds(interval, Rating.Easy, retrievability);
    this.next_interval(next_again, next_hard, next_good, next_easy, interval);
    this.next_state(next_again, next_hard, next_good, next_easy);
    next_again.lapses += 1;
    this.update_next(next_again, next_hard, next_good, next_easy);
    return this.next.get(grade);
  }
  /**
   * Review/New next_interval
   */
  next_interval(next_again, next_hard, next_good, next_easy, interval) {
    let again_interval, hard_interval, good_interval, easy_interval;
    again_interval = this.algorithm.next_interval(
      next_again.stability,
      interval
    );
    hard_interval = this.algorithm.next_interval(next_hard.stability, interval);
    good_interval = this.algorithm.next_interval(next_good.stability, interval);
    easy_interval = this.algorithm.next_interval(next_easy.stability, interval);
    again_interval = Math.min(again_interval, hard_interval);
    hard_interval = Math.max(hard_interval, again_interval + 1);
    good_interval = Math.max(good_interval, hard_interval + 1);
    easy_interval = Math.max(easy_interval, good_interval + 1);
    next_again.scheduled_days = again_interval;
    next_again.due = date_scheduler(this.review_time, again_interval, true);
    next_hard.scheduled_days = hard_interval;
    next_hard.due = date_scheduler(this.review_time, hard_interval, true);
    next_good.scheduled_days = good_interval;
    next_good.due = date_scheduler(this.review_time, good_interval, true);
    next_easy.scheduled_days = easy_interval;
    next_easy.due = date_scheduler(this.review_time, easy_interval, true);
  }
  /**
   * Review/New next_state
   */
  next_state(next_again, next_hard, next_good, next_easy) {
    next_again.state = State.Review;
    next_again.learning_steps = 0;
    next_hard.state = State.Review;
    next_hard.learning_steps = 0;
    next_good.state = State.Review;
    next_good.learning_steps = 0;
    next_easy.state = State.Review;
    next_easy.learning_steps = 0;
  }
  update_next(next_again, next_hard, next_good, next_easy) {
    const item_again = {
      card: next_again,
      log: this.buildLog(Rating.Again)
    };
    const item_hard = {
      card: next_hard,
      log: super.buildLog(Rating.Hard)
    };
    const item_good = {
      card: next_good,
      log: super.buildLog(Rating.Good)
    };
    const item_easy = {
      card: next_easy,
      log: super.buildLog(Rating.Easy)
    };
    this.next.set(Rating.Again, item_again);
    this.next.set(Rating.Hard, item_hard);
    this.next.set(Rating.Good, item_good);
    this.next.set(Rating.Easy, item_easy);
  }
};
var Reschedule = class {
  fsrs;
  /**
   * Creates an instance of the `Reschedule` class.
   * @param fsrs - An instance of the FSRS class used for scheduling.
   */
  constructor(fsrs2) {
    this.fsrs = fsrs2;
  }
  /**
   * Replays a review for a card and determines the next review date based on the given rating.
   * @param card - The card being reviewed.
   * @param reviewed - The date the card was reviewed.
   * @param rating - The grade given to the card during the review.
   * @returns A `RecordLogItem` containing the updated card and review log.
   */
  replay(card, reviewed, rating) {
    return this.fsrs.next(card, reviewed, rating);
  }
  /**
   * Processes a manual review for a card, allowing for custom state, stability, difficulty, and due date.
   * @param card - The card being reviewed.
   * @param state - The state of the card after the review.
   * @param reviewed - The date the card was reviewed.
   * @param elapsed_days - The number of days since the last review.
   * @param stability - (Optional) The stability of the card.
   * @param difficulty - (Optional) The difficulty of the card.
   * @param due - (Optional) The due date for the next review.
   * @returns A `RecordLogItem` containing the updated card and review log.
   * @throws Will throw an error if the state or due date is not provided when required.
   */
  handleManualRating(card, state, reviewed, elapsed_days, stability, difficulty, due) {
    if (typeof state === "undefined") {
      throw new FSRSValidationError(
        "reschedule: state is required for manual rating"
      );
    }
    let log;
    let next_card;
    if (state === State.New) {
      log = {
        rating: Rating.Manual,
        state,
        due: due ?? reviewed,
        stability: card.stability,
        difficulty: card.difficulty,
        elapsed_days,
        last_elapsed_days: card.elapsed_days,
        scheduled_days: card.scheduled_days,
        learning_steps: card.learning_steps,
        review: reviewed
      };
      next_card = createEmptyCard(reviewed);
      next_card.last_review = reviewed;
    } else {
      if (typeof due === "undefined") {
        throw new FSRSValidationError(
          "reschedule: due is required for manual rating"
        );
      }
      const scheduled_days = date_diff(due, reviewed, "days");
      log = {
        rating: Rating.Manual,
        state: card.state,
        due: card.last_review || card.due,
        stability: card.stability,
        difficulty: card.difficulty,
        elapsed_days,
        last_elapsed_days: card.elapsed_days,
        scheduled_days: card.scheduled_days,
        learning_steps: card.learning_steps,
        review: reviewed
      };
      next_card = {
        ...card,
        state,
        due,
        last_review: reviewed,
        stability: stability || card.stability,
        difficulty: difficulty || card.difficulty,
        elapsed_days,
        scheduled_days,
        reps: card.reps + 1
      };
    }
    return { card: next_card, log };
  }
  /**
   * Reschedules a card based on its review history.
   *
   * @param current_card - The card to be rescheduled.
   * @param reviews - An array of review history objects.
   * @returns An array of record log items representing the rescheduling process.
   */
  reschedule(current_card, reviews) {
    const collections = [];
    let cur_card = createEmptyCard(current_card.due);
    for (const review of reviews) {
      let item;
      review.review = TypeConvert.time(review.review);
      if (review.rating === Rating.Manual) {
        let interval = 0;
        if (cur_card.state !== State.New && cur_card.last_review) {
          interval = date_diff(review.review, cur_card.last_review, "days");
        }
        item = this.handleManualRating(
          cur_card,
          review.state,
          review.review,
          interval,
          review.stability,
          review.difficulty,
          review.due ? TypeConvert.time(review.due) : void 0
        );
      } else {
        item = this.replay(cur_card, review.review, review.rating);
      }
      collections.push(item);
      cur_card = item.card;
    }
    return collections;
  }
  calculateManualRecord(current_card, now, record_log_item, update_memory) {
    if (!record_log_item) {
      return null;
    }
    const { card: reschedule_card, log } = record_log_item;
    const cur_card = TypeConvert.card(current_card);
    if (cur_card.due.getTime() === reschedule_card.due.getTime()) {
      return null;
    }
    cur_card.scheduled_days = date_diff(
      reschedule_card.due,
      cur_card.due,
      "days"
    );
    return this.handleManualRating(
      cur_card,
      reschedule_card.state,
      TypeConvert.time(now),
      log.elapsed_days,
      update_memory ? reschedule_card.stability : void 0,
      update_memory ? reschedule_card.difficulty : void 0,
      reschedule_card.due
    );
  }
};
function applyAfterHandler(value, afterHandler) {
  return typeof afterHandler === "function" ? afterHandler(value) : value;
}
var FSRS = class extends FSRSAlgorithm {
  strategyHandler = /* @__PURE__ */ new Map();
  Scheduler;
  constructor(param) {
    super(param);
    const { enable_short_term } = this.parameters;
    this.Scheduler = enable_short_term ? BasicScheduler : LongTermScheduler;
  }
  params_handler_proxy() {
    const _this = this;
    return {
      set: function(target, prop, value) {
        if (prop === "request_retention" && Number.isFinite(value)) {
          _this.intervalModifier = _this.calculate_interval_modifier(
            Number(value)
          );
        } else if (prop === "enable_short_term") {
          _this.Scheduler = value === true ? BasicScheduler : LongTermScheduler;
        } else if (prop === "w") {
          value = migrateParameters(
            value,
            target.relearning_steps.length,
            target.enable_short_term
          );
          value = clipParameters(
            Array.from(value),
            target.relearning_steps.length,
            target.enable_short_term
          );
          _this.forgetting_curve = forgetting_curve.bind(this, value);
          _this.intervalModifier = _this.calculate_interval_modifier(
            Number(target.request_retention)
          );
        }
        Reflect.set(target, prop, value);
        return true;
      }
    };
  }
  useStrategy(mode, handler) {
    this.strategyHandler.set(mode, handler);
    return this;
  }
  clearStrategy(mode) {
    if (mode) {
      this.strategyHandler.delete(mode);
    } else {
      this.strategyHandler.clear();
    }
    return this;
  }
  getScheduler(card, now) {
    const schedulerStrategy = this.strategyHandler.get(
      StrategyMode.SCHEDULER
    );
    const Scheduler = schedulerStrategy || this.Scheduler;
    const instance = new Scheduler(card, now, this, this.strategyHandler);
    return instance;
  }
  /**
   * Display the collection of cards and logs for the four scenarios after scheduling the card at the current time.
   * @param card Card to be processed
   * @param now Current time or scheduled time
   * @param afterHandler Convert the result to another type. (Optional)
   * @example
   * ```typescript
   * const card: Card = createEmptyCard(new Date());
   * const f = fsrs();
   * const recordLog = f.repeat(card, new Date());
   * ```
   * @example
   * ```typescript
   * interface RevLogUnchecked
   *   extends Omit<ReviewLog, "due" | "review" | "state" | "rating"> {
   *   cid: string;
   *   due: Date | number;
   *   state: StateType;
   *   review: Date | number;
   *   rating: RatingType;
   * }
   *
   * interface RepeatRecordLog {
   *   card: CardUnChecked; //see method: createEmptyCard
   *   log: RevLogUnchecked;
   * }
   *
   * function repeatAfterHandler(recordLog: RecordLog) {
   *     const record: { [key in Grade]: RepeatRecordLog } = {} as {
   *       [key in Grade]: RepeatRecordLog;
   *     };
   *     for (const grade of Grades) {
   *       record[grade] = {
   *         card: {
   *           ...(recordLog[grade].card as Card & { cid: string }),
   *           due: recordLog[grade].card.due.getTime(),
   *           state: State[recordLog[grade].card.state] as StateType,
   *           last_review: recordLog[grade].card.last_review
   *             ? recordLog[grade].card.last_review!.getTime()
   *             : null,
   *         },
   *         log: {
   *           ...recordLog[grade].log,
   *           cid: (recordLog[grade].card as Card & { cid: string }).cid,
   *           due: recordLog[grade].log.due.getTime(),
   *           review: recordLog[grade].log.review.getTime(),
   *           state: State[recordLog[grade].log.state] as StateType,
   *           rating: Rating[recordLog[grade].log.rating] as RatingType,
   *         },
   *       };
   *     }
   *     return record;
   * }
   * const card: Card = createEmptyCard(new Date(), cardAfterHandler); //see method:  createEmptyCard
   * const f = fsrs();
   * const recordLog = f.repeat(card, new Date(), repeatAfterHandler);
   * ```
   */
  repeat(card, now, afterHandler) {
    const instance = this.getScheduler(card, now);
    const recordLog = instance.preview();
    return applyAfterHandler(recordLog, afterHandler);
  }
  /**
   * Display the collection of cards and logs for the card scheduled at the current time, after applying a specific grade rating.
   * @param card Card to be processed
   * @param now Current time or scheduled time
   * @param grade Rating of the review (Again, Hard, Good, Easy)
   * @param afterHandler Convert the result to another type. (Optional)
   * @example
   * ```typescript
   * const card: Card = createEmptyCard(new Date());
   * const f = fsrs();
   * const recordLogItem = f.next(card, new Date(), Rating.Again);
   * ```
   * @example
   * ```typescript
   * interface RevLogUnchecked
   *   extends Omit<ReviewLog, "due" | "review" | "state" | "rating"> {
   *   cid: string;
   *   due: Date | number;
   *   state: StateType;
   *   review: Date | number;
   *   rating: RatingType;
   * }
   *
   * interface NextRecordLog {
   *   card: CardUnChecked; //see method: createEmptyCard
   *   log: RevLogUnchecked;
   * }
   *
  function nextAfterHandler(recordLogItem: RecordLogItem) {
    const recordItem = {
      card: {
        ...(recordLogItem.card as Card & { cid: string }),
        due: recordLogItem.card.due.getTime(),
        state: State[recordLogItem.card.state] as StateType,
        last_review: recordLogItem.card.last_review
          ? recordLogItem.card.last_review!.getTime()
          : null,
      },
      log: {
        ...recordLogItem.log,
        cid: (recordLogItem.card as Card & { cid: string }).cid,
        due: recordLogItem.log.due.getTime(),
        review: recordLogItem.log.review.getTime(),
        state: State[recordLogItem.log.state] as StateType,
        rating: Rating[recordLogItem.log.rating] as RatingType,
      },
    };
    return recordItem
  }
   * const card: Card = createEmptyCard(new Date(), cardAfterHandler); //see method:  createEmptyCard
   * const f = fsrs();
   * const recordLogItem = f.repeat(card, new Date(), Rating.Again, nextAfterHandler);
   * ```
   */
  next(card, now, grade, afterHandler) {
    const instance = this.getScheduler(card, now);
    const g = TypeConvert.rating(grade);
    if (g === Rating.Manual) {
      throw new FSRSValidationError("Cannot review a manual rating");
    }
    const recordLogItem = instance.review(g);
    return applyAfterHandler(recordLogItem, afterHandler);
  }
  /**
   * Get the retrievability of the card
   * @param card  Card to be processed
   * @param now  Current time or scheduled time
   * @param format  default:true , Convert the result to another type. (Optional)
   * @returns  The retrievability of the card,if format is true, the result is a string, otherwise it is a number
   */
  get_retrievability(card, now, format = true) {
    const processedCard = TypeConvert.card(card);
    now = now ? TypeConvert.time(now) : /* @__PURE__ */ new Date();
    const t = processedCard.state !== State.New ? Math.max(date_diff(now, processedCard.last_review, "days"), 0) : 0;
    const r = processedCard.state !== State.New ? this.forgetting_curve(t, +processedCard.stability.toFixed(8)) : 0;
    return format ? `${(r * 100).toFixed(2)}%` : r;
  }
  /**
   *
   * @param card Card to be processed
   * @param log last review log
   * @param afterHandler Convert the result to another type. (Optional)
   * @example
   * ```typescript
   * const now = new Date();
   * const f = fsrs();
   * const emptyCardFormAfterHandler = createEmptyCard(now);
   * const repeatFormAfterHandler = f.repeat(emptyCardFormAfterHandler, now);
   * const { card, log } = repeatFormAfterHandler[Rating.Hard];
   * const rollbackFromAfterHandler = f.rollback(card, log);
   * ```
   *
   * @example
   * ```typescript
   * const now = new Date();
   * const f = fsrs();
   * const emptyCardFormAfterHandler = createEmptyCard(now, cardAfterHandler);  //see method: createEmptyCard
   * const repeatFormAfterHandler = f.repeat(emptyCardFormAfterHandler, now, repeatAfterHandler); //see method: fsrs.repeat()
   * const { card, log } = repeatFormAfterHandler[Rating.Hard];
   * const rollbackFromAfterHandler = f.rollback(card, log, cardAfterHandler);
   * ```
   */
  rollback(card, log, afterHandler) {
    const processedCard = TypeConvert.card(card);
    const processedLog = TypeConvert.review_log(log);
    if (processedLog.rating === Rating.Manual) {
      throw new FSRSValidationError("Cannot rollback a manual rating");
    }
    let last_due;
    let last_review;
    let last_lapses;
    switch (processedLog.state) {
      case State.New:
        last_due = processedLog.due;
        last_review = void 0;
        last_lapses = 0;
        break;
      case State.Learning:
      case State.Relearning:
      case State.Review:
        last_due = processedLog.review;
        last_review = processedLog.due;
        last_lapses = processedCard.lapses - (processedLog.rating === Rating.Again && processedLog.state === State.Review ? 1 : 0);
        break;
    }
    const prevCard = {
      ...processedCard,
      due: last_due,
      stability: processedLog.stability,
      difficulty: processedLog.difficulty,
      elapsed_days: processedLog.last_elapsed_days,
      scheduled_days: processedLog.scheduled_days,
      reps: Math.max(0, processedCard.reps - 1),
      lapses: Math.max(0, last_lapses),
      learning_steps: processedLog.learning_steps,
      state: processedLog.state,
      last_review
    };
    return applyAfterHandler(prevCard, afterHandler);
  }
  /**
   *
   * @param card Card to be processed
   * @param now Current time or scheduled time
   * @param reset_count Should the review count information(reps,lapses) be reset. (Optional)
   * @param afterHandler Convert the result to another type. (Optional)
   * @example
   * ```typescript
   * const now = new Date();
   * const f = fsrs();
   * const emptyCard = createEmptyCard(now);
   * const scheduling_cards = f.repeat(emptyCard, now);
   * const { card, log } = scheduling_cards[Rating.Hard];
   * const forgetCard = f.forget(card, new Date(), true);
   * ```
   *
   * @example
   * ```typescript
   * interface RepeatRecordLog {
   *   card: CardUnChecked; //see method: createEmptyCard
   *   log: RevLogUnchecked; //see method: fsrs.repeat()
   * }
   *
   * function forgetAfterHandler(recordLogItem: RecordLogItem): RepeatRecordLog {
   *     return {
   *       card: {
   *         ...(recordLogItem.card as Card & { cid: string }),
   *         due: recordLogItem.card.due.getTime(),
   *         state: State[recordLogItem.card.state] as StateType,
   *         last_review: recordLogItem.card.last_review
   *           ? recordLogItem.card.last_review!.getTime()
   *           : null,
   *       },
   *       log: {
   *         ...recordLogItem.log,
   *         cid: (recordLogItem.card as Card & { cid: string }).cid,
   *         due: recordLogItem.log.due.getTime(),
   *         review: recordLogItem.log.review.getTime(),
   *         state: State[recordLogItem.log.state] as StateType,
   *         rating: Rating[recordLogItem.log.rating] as RatingType,
   *       },
   *     };
   * }
   * const now = new Date();
   * const f = fsrs();
   * const emptyCardFormAfterHandler = createEmptyCard(now, cardAfterHandler); //see method:  createEmptyCard
   * const repeatFormAfterHandler = f.repeat(emptyCardFormAfterHandler, now, repeatAfterHandler); //see method: fsrs.repeat()
   * const { card } = repeatFormAfterHandler[Rating.Hard];
   * const forgetFromAfterHandler = f.forget(card, date_scheduler(now, 1, true), false, forgetAfterHandler);
   * ```
   */
  forget(card, now, reset_count = false, afterHandler) {
    const processedCard = TypeConvert.card(card);
    now = TypeConvert.time(now);
    const scheduled_days = processedCard.state === State.New ? 0 : date_diff(now, processedCard.due, "days");
    const forget_log = {
      rating: Rating.Manual,
      state: processedCard.state,
      due: processedCard.due,
      stability: processedCard.stability,
      difficulty: processedCard.difficulty,
      elapsed_days: 0,
      last_elapsed_days: processedCard.elapsed_days,
      scheduled_days,
      learning_steps: processedCard.learning_steps,
      review: now
    };
    const forget_card = {
      ...processedCard,
      due: now,
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: reset_count ? 0 : processedCard.reps,
      lapses: reset_count ? 0 : processedCard.lapses,
      learning_steps: 0,
      state: State.New,
      last_review: processedCard.last_review
    };
    const recordLogItem = { card: forget_card, log: forget_log };
    return applyAfterHandler(recordLogItem, afterHandler);
  }
  /**
   * Reschedules the current card and returns the rescheduled collections and reschedule item.
   *
   * @template T - The type of the record log item.
   * @param {CardInput | Card} current_card - The current card to be rescheduled.
   * @param {Array<FSRSHistory>} reviews - The array of FSRSHistory objects representing the reviews.
   * @param {Partial<RescheduleOptions<T>>} options - The optional reschedule options.
   * @returns {IReschedule<T>} - The rescheduled collections and reschedule item.
   *
   * @example
   * ```typescript
   * const f = fsrs()
   * const grades: Grade[] = [Rating.Good, Rating.Good, Rating.Good, Rating.Good]
   * const reviews_at = [
   *   new Date(2024, 8, 13),
   *   new Date(2024, 8, 13),
   *   new Date(2024, 8, 17),
   *   new Date(2024, 8, 28),
   * ]
   *
   * const reviews: FSRSHistory[] = []
   * for (let i = 0; i < grades.length; i++) {
   *   reviews.push({
   *     rating: grades[i],
   *     review: reviews_at[i],
   *   })
   * }
   *
   * const results_short = scheduler.reschedule(
   *   createEmptyCard(),
   *   reviews,
   *   {
   *     skipManual: false,
   *   }
   * )
   * console.log(results_short)
   * ```
   */
  reschedule(current_card, reviews = [], options = {}) {
    const {
      recordLogHandler,
      reviewsOrderBy,
      skipManual = true,
      now = /* @__PURE__ */ new Date(),
      update_memory_state: updateMemoryState = false
    } = options;
    if (reviewsOrderBy && typeof reviewsOrderBy === "function") {
      reviews.sort(reviewsOrderBy);
    }
    if (skipManual) {
      reviews = reviews.filter((review) => review.rating !== Rating.Manual);
    }
    const rescheduleSvc = new Reschedule(this);
    const collections = rescheduleSvc.reschedule(
      options.first_card || createEmptyCard(),
      reviews
    );
    const len = collections.length;
    const cur_card = TypeConvert.card(current_card);
    const manual_item = rescheduleSvc.calculateManualRecord(
      cur_card,
      now,
      len ? collections[len - 1] : void 0,
      updateMemoryState
    );
    return {
      collections: typeof recordLogHandler === "function" ? collections.map(recordLogHandler) : collections,
      reschedule_item: manual_item ? applyAfterHandler(manual_item, recordLogHandler) : null
    };
  }
};
var fsrs = (params) => {
  return new FSRS(params || {});
};

// src/core/ReviewService.ts
var statuses = /* @__PURE__ */ new Set(["ready", "active", "suspended", "archived", "needs_validation"]);
function validateInput(value) {
  const o = object(value);
  const question = text(o.question), objective = text(o.objective);
  if (!Array.isArray(o.rubric) || o.rubric.length < 1 || o.rubric.length > 30)
    throw new Error("Rubric required");
  if (!Array.isArray(o.source_ids) || o.source_ids.length > 50)
    throw new Error("Source list required");
  const seconds = Number(o.estimated_seconds);
  if (!Number.isFinite(seconds) || seconds < 10 || seconds > 3600)
    throw new Error("Invalid task duration");
  const priority = o.priority === void 0 ? 0.5 : Number(o.priority);
  if (!Number.isFinite(priority) || priority < 0 || priority > 1)
    throw new Error("Invalid priority");
  return {
    id: o.id === void 0 ? void 0 : identifier(text(o.id, 120)),
    question,
    objective,
    rubric: o.rubric.map((x) => text(x, 1e4)),
    source_ids: o.source_ids.map((x) => identifier(text(x, 120))),
    estimated_seconds: seconds,
    priority
  };
}
function stateOf(card) {
  return JSON.parse(JSON.stringify(card));
}
function validCard(value) {
  const o = object(value);
  validateInput(o);
  identifier(text(o.id, 120));
  if (!statuses.has(String(o.status))) throw new Error("Invalid lifecycle");
  const state = object(o.state);
  if (!Number.isFinite(Date.parse(String(state.due))) || !Number.isFinite(Number(state.reps)))
    throw new Error("Invalid memory state");
  return value;
}
var ReviewService = class _ReviewService {
  files;
  cards = /* @__PURE__ */ new Map();
  events = [];
  readings = /* @__PURE__ */ new Set();
  errors = [];
  tail = Promise.resolve();
  eventCache = /* @__PURE__ */ new Map();
  checkpoint;
  checkpointLoaded = false;
  checkpointSize = 0;
  retention = 0.9;
  onContent;
  writeGuard = async () => void 0;
  constructor(root, cacheRoot) {
    this.files = new Files(root);
    if (cacheRoot) this.checkpoint = new Files(cacheRoot);
  }
  static async open(root, cacheRoot) {
    const service = new _ReviewService(root, cacheRoot);
    await service.reload();
    return service;
  }
  async reload(audit = false) {
    if (!this.checkpointLoaded) {
      this.checkpointLoaded = true;
      try {
        if (this.checkpoint && await this.checkpoint.exists("Events.json")) {
          const wrapper = object(
            JSON.parse(await this.checkpoint.read("Events.json", 35e7))
          );
          if (typeof wrapper.payload !== "string" || wrapper.checksum !== digest(wrapper.payload))
            throw new Error("Invalid checkpoint");
          const raw = object(JSON.parse(wrapper.payload));
          if (raw.schema_version === 2 && raw.root === this.files.root && Array.isArray(raw.entries) && raw.entries.every(
            (x) => Array.isArray(x) && typeof x[0] === "string" && x[1] && typeof x[1].stamp === "string" && typeof x[1].event?.card_id === "string" && typeof x[1].beforeHash === "string" && typeof x[1].afterHash === "string"
          )) {
            this.eventCache = new Map(raw.entries);
            this.checkpointSize = this.eventCache.size;
          }
        }
      } catch {
        this.eventCache.clear();
      }
    }
    if (audit) this.eventCache.clear();
    this.cards.clear();
    this.events = [];
    this.readings.clear();
    this.errors = [];
    const groups = /* @__PURE__ */ new Map();
    const bad = /* @__PURE__ */ new Set();
    const directory = await this.files.entriesWithStamps("Events");
    const present = new Set(directory.map((x) => x.name));
    for (const name of this.eventCache.keys())
      if (!present.has(name)) this.eventCache.delete(name);
    for (const { name, stamp } of directory) {
      const cached = this.eventCache.get(name);
      let id = cached?.event.card_id ?? "unknown:" + name.slice(0, -5);
      try {
        if (cached?.stamp === stamp) {
          const list2 = groups.get(cached.event.card_id) ?? [];
          list2.push(cached.event);
          groups.set(cached.event.card_id, list2);
          continue;
        }
        this.eventCache.delete(name);
        const raw = object(await this.files.json("Events/" + name));
        id = typeof raw.card_id === "string" ? raw.card_id : id;
        const { checksum, ...rest } = raw;
        if (raw.schema_version !== 1 || raw.id !== name.slice(0, -5) || checksum !== digest(canonical(rest)))
          throw new Error("Event integrity failure");
        identifier(text(raw.id, 120));
        identifier(text(raw.card_id, 120));
        if (raw.previous_id !== null) identifier(text(raw.previous_id, 120));
        if (!Number.isFinite(Date.parse(text(raw.at))))
          throw new Error("Invalid event time");
        if (raw.after !== null) validCard(raw.after);
        const event = raw;
        if (event.after && (event.after.id !== event.card_id || event.after.event_id !== event.id))
          throw new Error("Event/card identity mismatch");
        this.eventCache.set(name, {
          stamp,
          event,
          beforeHash: digest(canonical(event.before)),
          afterHash: digest(canonical(event.after))
        });
        const list = groups.get(id) ?? [];
        list.push(event);
        groups.set(id, list);
      } catch (error) {
        bad.add(id);
        this.errors.push(id + ": " + String(error));
      }
    }
    for (const [id, list] of groups) {
      if (bad.has(id)) continue;
      const ordered = [];
      let previous = null;
      let current = null;
      let stateHash = digest("null");
      const successors = /* @__PURE__ */ new Map();
      for (const event of list) {
        const next = successors.get(event.previous_id) ?? [];
        next.push(event);
        successors.set(event.previous_id, next);
      }
      const visited = /* @__PURE__ */ new Set();
      while (true) {
        const next = successors.get(previous) ?? [];
        if (next.length === 0) break;
        if (next.length !== 1 || visited.has(next[0].id)) {
          bad.add(id);
          break;
        }
        const event = next[0];
        const cachedEvent = this.eventCache.get(event.id + ".json");
        if (cachedEvent.beforeHash !== stateHash) {
          bad.add(id);
          break;
        }
        visited.add(event.id);
        ordered.push(event);
        current = event.after;
        stateHash = cachedEvent.afterHash;
        previous = event.id;
      }
      if (ordered.length !== list.length) bad.add(id);
      if (bad.has(id)) {
        this.errors.push(id + ": broken or forked event chain");
        continue;
      }
      this.events.push(...ordered);
      if (current) this.cards.set(id, current);
      for (const event of ordered)
        if (event.kind === "reading" && event.source_id) this.readings.add(event.source_id);
    }
    if (this.checkpoint && this.eventCache.size >= this.checkpointSize + 100 && !this.errors.length) {
      const base = {
        schema_version: 2,
        root: this.files.root,
        entries: [...this.eventCache.entries()]
      };
      try {
        const payload = JSON.stringify(base);
        await this.checkpoint.write(
          "Events.json",
          JSON.stringify({ payload, checksum: digest(payload) }) + "\n"
        );
        this.checkpointSize = this.eventCache.size;
      } catch {
      }
    }
  }
  transact(fn) {
    const task = this.tail.then(
      () => this.files.lock("Events.lock", async () => {
        await this.writeGuard();
        await this.reload();
        if (this.errors.some((x) => x.startsWith("unknown:")))
          throw new Error("Unreadable event: repair before writing");
        return fn();
      })
    );
    this.tail = task.catch(() => void 0);
    return task;
  }
  async append(kind, id, after, now, extra = {}) {
    if (!Number.isFinite(now.getTime())) throw new Error("Invalid event time");
    const last = this.events.filter((x) => x.card_id === id).at(-1);
    const event_id = (0, import_node_crypto2.randomUUID)();
    if (after) after = { ...after, event_id };
    const base = {
      schema_version: 1,
      id: event_id,
      card_id: id,
      previous_id: last?.id ?? null,
      kind,
      at: now.toISOString(),
      before: this.cards.get(id) ?? null,
      after,
      ...extra
    };
    const event = { ...base, checksum: digest(canonical(base)) };
    await this.files.put("Events/" + event_id + ".json", event);
    this.events.push(event);
    if (after) this.cards.set(id, after);
    if (after && (kind === "create" || kind === "revise") && this.onContent) {
      try {
        await this.onContent(after);
      } catch (error) {
        this.errors.push("\u9898\u5E93 Markdown \u89C6\u56FE\u5F85\u4FEE\u590D\uFF1A" + String(error));
      }
    }
    if (event.source_id) this.readings.add(event.source_id);
    return after;
  }
  async create(input, now = /* @__PURE__ */ new Date()) {
    const data = validateInput(input);
    return this.transact(async () => {
      const id = data.id ?? (0, import_node_crypto2.randomUUID)();
      const existing = this.cards.get(id);
      if (existing) {
        if (existing.revision_id !== digest(canonical({ ...data, id })))
          throw new Error("Existing card differs");
        return existing;
      }
      if (this.errors.some((x) => x.startsWith(id + ":")))
        throw new Error("Card history needs repair");
      const revision_id = digest(canonical({ ...data, id }));
      await this.files.put("Content/" + revision_id + ".json", { ...data, id, revision_id });
      return await this.append(
        "create",
        id,
        {
          ...data,
          id,
          revision_id,
          event_id: "",
          created_at: now.toISOString(),
          status: "ready",
          state: stateOf(createEmptyCard(now))
        },
        now
      );
    });
  }
  async grade(id, rating, attempt, now = /* @__PURE__ */ new Date(), expected, meta = {}) {
    identifier(attempt);
    if (![1, 2, 3, 4].includes(rating)) throw new Error("Rating must be 1..4");
    return this.transact(async () => {
      const duplicate = this.events.find((x) => x.attempt_id === attempt);
      if (duplicate) {
        if (duplicate.card_id !== id || duplicate.kind !== "grade" || !duplicate.after)
          throw new Error("Attempt conflict");
        if (this.events.some(
          (x) => x.card_id === id && x.kind === "undo" && x.previous_id === duplicate.id
        ))
          throw new Error("Attempt was undone");
        return duplicate.after;
      }
      const card = this.require(id);
      if (expected && card.event_id !== expected)
        throw new Error("Question changed while answering");
      if (!["ready", "active"].includes(card.status))
        throw new Error("Card is not available");
      if (card.state.last_review && now.getTime() < Date.parse(card.state.last_review))
        throw new Error("Clock moved backwards");
      const model = fsrs({ request_retention: this.retention, enable_fuzz: false });
      const result = model.next(card.state, now, rating);
      if (!Number.isFinite(meta.duration_ms ?? 0) || Number(meta.duration_ms ?? 0) < 0)
        throw new Error("Invalid duration");
      return await this.append(
        "grade",
        id,
        {
          ...card,
          status: "active",
          state: stateOf(result.card),
          snoozed_until: void 0
        },
        now,
        {
          attempt_id: attempt,
          rating,
          scheduler: JSON.parse(
            JSON.stringify({
              name: "ts-fsrs",
              version: "5.4.2",
              parameters: model.parameters,
              log: result.log
            })
          ),
          duration_ms: Math.max(0, Math.min(meta.duration_ms ?? 0, 36e5)),
          session_id: meta.session_id
        }
      );
    });
  }
  require(id) {
    const card = this.cards.get(id);
    if (!card) throw new Error("Card missing or quarantined");
    return card;
  }
  async undo(id, now = /* @__PURE__ */ new Date()) {
    return this.transact(async () => {
      const last = this.events.filter((x) => x.card_id === id).at(-1);
      if (!last || last.kind !== "grade" || !last.before)
        throw new Error("Only latest rating can be undone");
      return this.append("undo", id, last.before, now);
    });
  }
  async manage(id, action, now = /* @__PURE__ */ new Date(), until) {
    return this.transact(async () => {
      const card = this.require(id);
      if (action === "snooze" && (!until || !Number.isFinite(Date.parse(until))))
        throw new Error("Invalid snooze date");
      const status = action === "suspend" ? "suspended" : action === "archive" ? "archived" : action === "validate" ? "needs_validation" : action === "resume" ? card.state.reps > 0 ? "active" : "ready" : card.status;
      return this.append(
        action,
        id,
        {
          ...card,
          status,
          snoozed_until: action === "snooze" ? until : card.snoozed_until
        },
        now
      );
    });
  }
  async revise(id, input, base, preserve, now = /* @__PURE__ */ new Date()) {
    const data = validateInput(input);
    return this.transact(async () => {
      const card = this.require(id);
      if (card.revision_id !== base) throw new Error("Revision conflict");
      const revision_id = digest(canonical({ ...data, id }));
      await this.files.put("Content/" + revision_id + ".json", { ...data, id, revision_id });
      return this.append(
        "revise",
        id,
        {
          ...card,
          ...data,
          id,
          revision_id,
          status: preserve ? card.state.reps ? "active" : "ready" : "ready",
          state: preserve ? card.state : stateOf(createEmptyCard(now))
        },
        now
      );
    });
  }
  async completeReading(source, now = /* @__PURE__ */ new Date()) {
    identifier(source);
    return this.transact(async () => {
      if (this.readings.has(source)) return;
      await this.append("reading", "reading-" + digest(source).slice(0, 32), null, now, {
        source_id: source
      });
    });
  }
};

// src/core/Time.ts
var formatters = /* @__PURE__ */ new Map();
function parts(date, zone) {
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid time");
  let formatter = formatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    formatters.set(zone, formatter);
  }
  const values = formatter.formatToParts(date);
  const get = (type) => Number(values.find((x) => x.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second")
  };
}
var pad = (n) => String(n).padStart(2, "0");
function dayString(year, month, day) {
  return year + "-" + pad(month) + "-" + pad(day);
}
function previousDay(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day - 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}
function studyDay(now, timezone, startHour) {
  if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23)
    throw new Error("Invalid study day boundary");
  const p = parts(now, timezone), d = p.hour < startHour ? previousDay(p.year, p.month, p.day) : p;
  return dayString(d.year, d.month, d.day);
}
function calendarDay(now, timezone) {
  const p = parts(now, timezone);
  return dayString(p.year, p.month, p.day);
}

// src/core/Queue.ts
function planQueue(cards, events, o) {
  const day = studyDay(o.now, o.timezone, o.study_start);
  const undone = new Set(events.filter((x) => x.kind === "undo").map((x) => x.previous_id));
  const grades = events.filter((x) => x.kind === "grade" && !undone.has(x.id));
  const today = grades.filter(
    (x) => Math.abs(Date.parse(x.at) - o.now.getTime()) <= 1728e5 && studyDay(new Date(x.at), o.timezone, o.study_start) === day
  );
  const spent = today.reduce((n, x) => n + (x.duration_ms ?? 0) / 1e3, 0);
  const remaining = Math.max(0, o.budget_minutes * 60 - spent);
  const usedNew = today.filter((x) => x.before?.state.reps === 0).length;
  const sessions = /* @__PURE__ */ new Map(), recent = /* @__PURE__ */ new Map();
  for (const grade of grades) {
    if (grade.session_id === o.session_id)
      sessions.set(grade.card_id, (sessions.get(grade.card_id) ?? 0) + 1);
    const list = recent.get(grade.card_id) ?? [];
    list.push(grade.rating ?? 0);
    if (list.length > 5) list.shift();
    recent.set(grade.card_id, list);
  }
  const eligible = cards.filter(
    (x) => ["active", "ready"].includes(x.status) && (!x.snoozed_until || Date.parse(x.snoozed_until) <= o.now.getTime()) && (o.unlimited || !o.session_id || (sessions.get(x.id) ?? 0) < 3)
  );
  const due = eligible.filter(
    (x) => x.status === "active" && Date.parse(x.state.due) <= o.now.getTime()
  );
  const oldMinutes = due.reduce((n, x) => n + x.estimated_seconds / 60, 0);
  const backlog = oldMinutes > (o.was_backlog ? 1.5 : 3) * o.budget_minutes;
  const model = fsrs({ enable_fuzz: false });
  const priority = (c) => {
    const risk = 1 - model.get_retrievability(c.state, o.now, false);
    const age = Math.min(
      1,
      Math.max(0, (o.now.getTime() - Date.parse(c.state.due)) / 864e5) / 30
    );
    const failures = (recent.get(c.id) ?? []).filter((x) => x === 1).length / 5;
    return (0.3 * (c.priority ?? 0.5) + 0.3 * risk + 0.2 * age + 0.2 * failures) / Math.sqrt(c.estimated_seconds / 60);
  };
  const scores = new Map(due.map((card) => [card.id, priority(card)]));
  due.sort((a, b) => scores.get(b.id) - scores.get(a.id) || a.id.localeCompare(b.id));
  if (o.budget_minutes >= 10 && due.length > 1) {
    const oldest = due.reduce(
      (a, b) => Date.parse(a.state.due) < Date.parse(b.state.due) ? a : b
    );
    due.splice(due.indexOf(oldest), 1);
    due.unshift(oldest);
  }
  if (o.unlimited)
    return {
      cards: [
        ...due,
        ...eligible.filter((c) => c.status === "ready").sort((a, b) => a.created_at.localeCompare(b.created_at))
      ],
      remaining_seconds: remaining,
      overdue_count: due.length,
      new_count: eligible.filter((c) => c.status === "ready").length,
      backlog,
      spent_seconds: spent
    };
  const selected = [];
  let seconds = remaining;
  for (const card of due) {
    if (card.estimated_seconds <= seconds || selected.length === 0 && remaining > 0) {
      selected.push(card);
      seconds -= card.estimated_seconds;
    }
  }
  let quota = backlog ? 0 : Math.max(0, o.new_card_limit - usedNew);
  let newSeconds = due.length ? Math.min(seconds, o.budget_minutes * 60 * 0.2) : seconds;
  for (const card of eligible.filter((x) => x.status === "ready").sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))) {
    if (quota > 0 && card.estimated_seconds <= newSeconds) {
      selected.push(card);
      quota--;
      newSeconds -= card.estimated_seconds;
    }
  }
  return {
    cards: selected,
    remaining_seconds: remaining,
    overdue_count: due.length,
    new_count: eligible.filter((x) => x.status === "ready").length,
    backlog,
    spent_seconds: spent
  };
}

// src/core/Sections.ts
function sections(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const heads = [];
  const stack = [];
  const seen = /* @__PURE__ */ new Map();
  let fence = "";
  let frontmatter = lines[0] === "---";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (frontmatter) {
      if (i > 0 && /^(---|\.\.\.)\s*$/.test(line)) frontmatter = false;
      continue;
    }
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length && new RegExp("^ {0,3}" + fence[0] + "{3,}\\s*$").test(line))
        fence = "";
      continue;
    }
    if (fence) continue;
    const match = /^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const level = match[1].length;
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    stack.push({ level, name: match[2].trim() });
    const name = stack.map((x) => x.name).join(" \u203A ");
    const n = (seen.get(name) ?? 0) + 1;
    seen.set(name, n);
    heads.push({ line: i + 1, heading: name, key: name + (n > 1 ? " [" + n + "]" : "") });
  }
  if (!heads.length || heads[0].line > 1)
    heads.unshift({ line: 1, heading: "\u6B63\u6587", key: "@preamble" });
  return heads.map((h, i) => {
    const end_line = (heads[i + 1]?.line ?? lines.length + 1) - 1;
    const text2 = lines.slice(h.line - 1, end_line).join("\n");
    return { ...h, end_line, text: text2, hash: digest(text2) };
  }).filter((s) => s.text.trim());
}

// src/core/Protocol.ts
var WORKSPACE = ".obsidian/customDocument/FSRSScheduler";
function sourceId(path, section, hash) {
  return digest(path + "\0" + section + "\0" + hash);
}
function learningPath(path) {
  return (path.startsWith("Learn/") || path.startsWith("Chores/JobInterviews/")) && path.endsWith(".md") && path !== "Learn/Fragments/ReadyToMerge.md" && !/backup|\.bak\./i.test(path);
}
function array(value, max = 5e3) {
  if (!Array.isArray(value) || value.length > max) throw new Error("Expected bounded array");
  return value;
}
function validateMaterials(value, request) {
  const o = object(value);
  if (o.schema_version !== 2 || o.request_id !== request.id)
    throw new Error("\u6750\u6599\u7248\u672C\u6216\u8BF7\u6C42\u4E0D\u5339\u914D");
  if (Object.keys(o).some(
    (k) => ![
      "schema_version",
      "request_id",
      "summary",
      "questions",
      "tasks",
      "skipped",
      "issues"
    ].includes(k)
  ))
    throw new Error("Unsupported materials field");
  const sources = new Set(request.sources.map((s) => s.id));
  const ids = /* @__PURE__ */ new Set();
  const questions = array(o.questions).map((raw) => {
    const q = object(raw);
    if (Object.keys(q).some(
      (k) => ![
        "id",
        "question",
        "objective",
        "rubric",
        "source_ids",
        "estimated_seconds",
        "priority",
        "scenario",
        "kind",
        "why"
      ].includes(k)
    ))
      throw new Error("\u9898\u76EE\u4E0D\u80FD\u6307\u5B9A\u8BC4\u5206\u6216\u8BB0\u5FC6\u72B6\u6001");
    const base = validateInput(q);
    const id = identifier(text(q.id, 120));
    if (ids.has(id)) throw new Error("Duplicate question ID");
    ids.add(id);
    if (!base.source_ids.length || base.source_ids.some((id2) => !sources.has(id2)))
      throw new Error("Question source missing");
    if (base.rubric.length < 2 || ![
      "causality",
      "diagnosis",
      "trace",
      "tradeoff",
      "counterexample",
      "application"
    ].includes(String(q.kind)))
      throw new Error("\u9898\u76EE\u987B\u6709\u660E\u786E\u7C7B\u578B\u548C\u81F3\u5C11\u4E24\u4E2A\u8BC4\u5206\u8981\u70B9");
    return {
      ...base,
      id,
      scenario: text(q.scenario, 1e4),
      kind: String(q.kind),
      why: text(q.why, 1e4)
    };
  });
  const tasks = array(o.tasks).map((raw) => {
    const t = object(raw);
    const id = identifier(text(t.id, 120));
    if (ids.has(id)) throw new Error("Duplicate task ID");
    ids.add(id);
    if (!["reading", "practice"].includes(String(t.kind)) || !/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(String(t.due_at)) || !Number.isFinite(Date.parse(String(t.due_at))))
      throw new Error("Invalid task kind/time");
    const source_ids = array(t.source_ids, 50).map((x) => identifier(text(x, 120)));
    if (!source_ids.length || source_ids.some((id2) => !sources.has(id2)))
      throw new Error("Task source missing");
    const seconds = Number(t.estimated_seconds);
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 86400)
      throw new Error("Invalid task duration");
    return {
      id,
      title: text(t.title),
      kind: t.kind,
      due_at: String(t.due_at),
      source_ids,
      estimated_seconds: seconds
    };
  });
  const skipped = array(o.skipped).map((raw) => {
    const s = object(raw);
    const source_id = identifier(text(s.source_id, 120));
    if (!sources.has(source_id)) throw new Error("Skipped source missing");
    return { source_id, reason: text(s.reason) };
  });
  const covered = /* @__PURE__ */ new Set([
    ...questions.flatMap((q) => q.source_ids),
    ...tasks.flatMap((t) => t.source_ids),
    ...skipped.map((s) => s.source_id)
  ]);
  if (request.sources.some((s) => !covered.has(s.id)))
    throw new Error("\u6BCF\u4E2A\u6765\u6E90\u987B\u6709\u68C0\u9A8C\u9898\u3001\u4EFB\u52A1\u6216\u660E\u786E\u7684\u672A\u51FA\u9898\u539F\u56E0");
  return {
    schema_version: 2,
    request_id: request.id,
    summary: text(o.summary),
    questions,
    tasks,
    skipped,
    issues: array(o.issues, 100).map((x) => text(x, 1e4))
  };
}

// src/core/Store.ts
function cardInput(q) {
  return {
    id: q.id,
    objective: q.objective,
    question: q.scenario + "\n\n" + q.question,
    rubric: q.rubric,
    source_ids: q.source_ids,
    estimated_seconds: q.estimated_seconds,
    priority: q.priority ?? 0.5
  };
}
var Store = class _Store {
  constructor(vault) {
    this.vault = vault;
    this.files = new Files((0, import_node_path2.join)(vault, WORKSPACE));
    this.vaultFiles = new Files(vault);
  }
  vault;
  files;
  vaultFiles;
  review;
  vaultId = "";
  sources = /* @__PURE__ */ new Map();
  revisions = [];
  tasks = [];
  errors = [];
  run;
  policy = {
    timezone: "Asia/Shanghai",
    study_start: 4,
    budget_minutes: 10,
    new_card_limit: 3,
    retention: 0.9,
    expected_hour: 22,
    grace_minutes: 60
  };
  pending = Promise.resolve();
  static async open(vault) {
    const s = new _Store(vault);
    if (await s.files.exists("Data/Vault.json"))
      throw new Error("\u65E7\u63D2\u4EF6\u6570\u636E\u5C1A\u672A\u6E05\u7406\uFF1B\u8BF7\u5148\u5B8C\u6210\u4E34\u65F6\u5E93\u9A8C\u6536\uFF0C\u4E0D\u81EA\u52A8\u8FC1\u79FB");
    if (!await s.files.exists("Identity.json"))
      await s.files.put("Identity.json", { schema_version: 2, vault_id: (0, import_node_crypto3.randomUUID)() });
    const identity = await s.files.json("Identity.json");
    if (identity.schema_version !== 2) throw new Error("Unsupported identity");
    s.vaultId = identifier(identity.vault_id);
    s.review = await ReviewService.open((0, import_node_path2.join)(s.files.root, "Data"));
    return s;
  }
  serial(fn) {
    const task = this.pending.then(fn);
    this.pending = task.catch(() => void 0);
    return task;
  }
  async readPolicy() {
    if (!await this.vaultFiles.exists(".agents/Context.md")) return;
    const raw = await this.vaultFiles.read(".agents/Context.md");
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
    if (!front) return;
    const doc = (0, import_yaml.parseDocument)(front[1]);
    if (doc.errors.length) throw new Error("Context YAML \u65E0\u6548");
    const data = doc.toJS({ maxAliasCount: 10 });
    if (!data || typeof data !== "object") throw new Error("Context frontmatter invalid");
    const hour = String(data.study_day_start ?? "04:00");
    const expected = String(data.expected_update_time ?? "22:00");
    if (!/^(?:[01]\d|2[0-3]):00$/.test(hour) || !/^(?:[01]\d|2[0-3]):00$/.test(expected))
      throw new Error("\u65F6\u95F4\u987B\u4E3A HH:00");
    const p = {
      timezone: String(data.timezone ?? "Asia/Shanghai"),
      study_start: Number(hour.slice(0, 2)),
      expected_hour: Number(expected.slice(0, 2)),
      budget_minutes: Number(data.daily_review_budget_minutes ?? 10),
      new_card_limit: Number(data.new_card_daily_limit ?? 3),
      retention: Number(data.desired_retention ?? 0.9),
      grace_minutes: Number(data.update_grace_minutes ?? 60)
    };
    new Intl.DateTimeFormat("en", { timeZone: p.timezone }).format();
    if (!Number.isFinite(p.budget_minutes) || p.budget_minutes < 0 || p.budget_minutes > 1440 || !Number.isInteger(p.new_card_limit) || p.new_card_limit < 0 || p.new_card_limit > 1e4 || !Number.isFinite(p.retention) || p.retention < 0.5 || p.retention > 0.97 || !Number.isFinite(p.grace_minutes) || p.grace_minutes < 0 || p.grace_minutes > 1440)
      throw new Error("Context \u504F\u597D\u8D8A\u754C");
    this.policy = p;
    this.review.retention = p.retention;
  }
  async current(source) {
    try {
      relativePath(source.path);
      if (!learningPath(source.path) || source.id !== sourceId(source.path, source.section, source.hash) || digest(source.text) !== source.hash)
        return false;
      const text2 = await this.vaultFiles.read(source.path);
      return sections(text2).some((s) => s.key === source.section && s.hash === source.hash);
    } catch {
      return false;
    }
  }
  async refresh() {
    return this.serial(async () => {
      this.errors = [];
      await this.readPolicy();
      await this.review.reload();
      this.sources.clear();
      const bundles = [];
      for (const runId of await this.files.list("Bundles")) {
        try {
          identifier(runId);
          if (!await this.files.exists("Bundles/" + runId + "/Ready.json")) continue;
          const ready = await this.files.json("Bundles/" + runId + "/Ready.json");
          const raw = await this.files.read(
            "Bundles/" + runId + "/Bundle.json",
            5e7
          );
          if (digest(raw) !== ready.sha256) throw new Error("\u6750\u6599\u54C8\u5E0C\u4E0D\u5339\u914D");
          const bundle = JSON.parse(raw);
          if (bundle.schema_version !== 2 || bundle.request.id !== runId || bundle.request.vault_id !== this.vaultId || !Number.isFinite(Date.parse(bundle.completed_at)))
            throw new Error("\u6750\u6599\u8EAB\u4EFD\u6216\u65F6\u95F4\u65E0\u6548");
          bundle.materials = validateMaterials(bundle.materials, bundle.request);
          for (const source of bundle.request.sources) {
            if (source.id !== sourceId(source.path, source.section, source.hash) || digest(source.text) !== source.hash)
              throw new Error("\u6765\u6E90\u5FEB\u7167\u635F\u574F");
            this.sources.set(source.id, source);
          }
          bundles.push(bundle);
        } catch (error) {
          this.errors.push(runId + ": " + String(error));
        }
      }
      bundles.sort((a, b) => a.completed_at.localeCompare(b.completed_at));
      for (const bundle of bundles) {
        const id = bundle.request.id;
        if (await this.files.exists("Receipts/" + id + ".json")) continue;
        try {
          for (const q of bundle.materials.questions) {
            if (!await this.sourcesCurrent(q.source_ids))
              throw new Error("\u6765\u6E90\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u51C6\u5907\uFF1A" + q.id);
            const input = cardInput(q);
            const old = this.review.cards.get(q.id);
            if (!old) await this.review.create(input);
            else if (old.revision_id !== digest(canonical(input))) {
              const sameMeaning = old.question === input.question && old.objective === input.objective && canonical(old.rubric) === canonical(input.rubric);
              if (sameMeaning)
                await this.review.revise(q.id, input, old.revision_id, true);
              else
                await this.files.set("Revisions/" + q.id + ".json", {
                  id: q.id,
                  input,
                  base: old.revision_id,
                  run_id: id
                });
            }
          }
          for (const task of bundle.materials.tasks) {
            if (!await this.sourcesCurrent(task.source_ids))
              throw new Error("\u4EFB\u52A1\u6765\u6E90\u5DF2\u53D8\u5316");
            await this.files.put("Tasks/" + task.id + ".json", task);
          }
          await this.files.put("Receipts/" + id + ".json", {
            run_id: id,
            imported_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        } catch (error) {
          this.errors.push(id + ": " + String(error));
        }
      }
      this.revisions = [];
      for (const name of await this.files.list("Revisions"))
        if (name.endsWith(".json")) {
          const revision = await this.files.json("Revisions/" + name);
          if (!await this.files.exists(
            "RevisionReceipts/" + revision.run_id + "-" + revision.id + ".json"
          ))
            this.revisions.push(revision);
        }
      this.tasks = [];
      for (const name of await this.files.list("Tasks"))
        if (name.endsWith(".json")) {
          const task = await this.files.json("Tasks/" + name);
          if (!await this.files.exists("TaskEvents/" + task.id + ".json"))
            this.tasks.push(task);
        }
      this.run = await this.files.exists("Bridge/State.json") ? await this.files.json("Bridge/State.json") : void 0;
      this.errors.push(...this.review.errors);
    });
  }
  async sourcesCurrent(ids) {
    for (const id of ids) {
      const source = this.sources.get(id);
      if (!source || !await this.current(source)) return false;
    }
    return true;
  }
  async queue(now = /* @__PURE__ */ new Date()) {
    const valid = [];
    for (const c of this.review.cards.values())
      if (await this.sourcesCurrent(c.source_ids)) valid.push(c);
    return planQueue(valid, this.review.events, { now, ...this.policy, unlimited: true });
  }
  async grade(id, rating, attempt, now = /* @__PURE__ */ new Date(), expected) {
    if (!await this.sourcesCurrent(this.review.require(id).source_ids))
      throw new Error("\u4F5C\u7B54\u671F\u95F4\u6765\u6E90\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u51C6\u5907");
    return this.review.grade(id, rating, attempt, now, expected);
  }
  async acceptRevision(revision, preserve, now = /* @__PURE__ */ new Date()) {
    return this.serial(async () => {
      if (!await this.sourcesCurrent(revision.input.source_ids))
        throw new Error("\u4FEE\u8BA2\u6765\u6E90\u5DF2\u53D8\u5316");
      await this.review.revise(revision.id, revision.input, revision.base, preserve, now);
      await this.files.put(
        "RevisionReceipts/" + revision.run_id + "-" + revision.id + ".json",
        { at: now.toISOString(), preserve }
      );
    });
  }
  async completeTask(task, now = /* @__PURE__ */ new Date()) {
    return this.serial(async () => {
      if (!await this.sourcesCurrent(task.source_ids)) throw new Error("\u4EFB\u52A1\u6765\u6E90\u5DF2\u53D8\u5316");
      if (await this.files.exists("TaskEvents/" + task.id + ".json")) return;
      await this.files.put("TaskEvents/" + task.id + ".json", {
        task_id: task.id,
        kind: task.kind,
        completed_at: now.toISOString()
      });
    });
  }
};
function localHour(date, timezone) {
  return Number(
    new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      hour: "2-digit",
      hourCycle: "h23"
    }).format(date)
  );
}
function zonedHour(day, hour, timezone) {
  let t = Date.parse(day + "T" + String(hour).padStart(2, "0") + ":00:00Z");
  const wanted = t;
  for (let i = 0; i < 6; i++) {
    const d = new Date(t);
    const actual = Date.parse(
      calendarDay(d, timezone) + "T" + String(localHour(d, timezone)).padStart(2, "0") + ":" + new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        minute: "2-digit",
        second: "2-digit"
      }).format(d) + "Z"
    );
    const delta = wanted - actual;
    if (!delta) return t;
    t += delta;
  }
  throw new Error("\u65E0\u6CD5\u8BA1\u7B97\u9884\u671F\u66F4\u65B0\u65F6\u95F4");
}
function freshness(state, now = /* @__PURE__ */ new Date(), timezone = "Asia/Shanghai", hour = 22, grace = 60) {
  const eligible = new Date(now.getTime() - grace * 6e4);
  let day = calendarDay(eligible, timezone);
  if (localHour(eligible, timezone) < hour)
    day = new Date(Date.parse(day + "T00:00:00Z") - 864e5).toISOString().slice(0, 10);
  const expected = zonedHour(day, hour, timezone);
  const days = state?.last_content_updated_at ? Math.max(
    0,
    Math.round(
      (Date.parse(calendarDay(now, timezone)) - Date.parse(calendarDay(new Date(state.last_content_updated_at), timezone))) / 864e5
    )
  ) : null;
  return {
    missed: !state?.last_success_at || Date.parse(state.last_success_at) < expected,
    days_since_update: days,
    expected_at: new Date(expected).toISOString()
  };
}

// src/Main.ts
var VIEW = "fsrs-review-v2";
function button(parent, label, action) {
  const b = parent.createEl("button", { text: label });
  b.addEventListener("click", () => {
    if (b.disabled) return;
    b.disabled = true;
    Promise.resolve().then(action).catch((e) => new import_obsidian.Notice(String(e), 1e4)).finally(() => {
      b.disabled = false;
    });
  });
  return b;
}
var ReviewPlugin = class extends import_obsidian.Plugin {
  store;
  refreshing;
  status;
  reminded = "";
  stopped = false;
  reminders = true;
  async onload() {
    const data = await this.loadData();
    this.reminders = data?.reminders !== false;
    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof import_obsidian.FileSystemAdapter))
      throw new Error("FSRS Review \u9700\u8981\u684C\u9762\u6587\u4EF6\u7CFB\u7EDF Vault");
    this.store = await Store.open(adapter.getBasePath());
    this.registerView(VIEW, (leaf) => new ReviewView(leaf, this));
    this.addRibbonIcon(
      "brain",
      "\u4ECA\u65E5\u590D\u4E60",
      () => void this.openView().catch((e) => new import_obsidian.Notice(String(e)))
    );
    this.addSettingTab(new Preferences(this.app, this));
    this.addCommand({
      id: "open-review",
      name: "\u6253\u5F00\u4ECA\u65E5\u590D\u4E60",
      callback: () => void this.openView().catch((e) => new import_obsidian.Notice(String(e)))
    });
    this.addCommand({
      id: "refresh",
      name: "\u5237\u65B0\u5916\u90E8\u6750\u6599\u4E0E\u590D\u4E60\u72B6\u6001",
      callback: () => void this.refresh().catch((e) => new import_obsidian.Notice(String(e)))
    });
    this.status = this.addStatusBarItem();
    await this.refresh();
    this.registerInterval(
      window.setInterval(
        () => void this.refresh().catch((e) => new import_obsidian.Notice(String(e))),
        6e4
      )
    );
    this.registerDomEvent(
      window,
      "focus",
      () => void this.refresh().catch((e) => new import_obsidian.Notice(String(e)))
    );
    this.app.workspace.onLayoutReady(() => {
      void this.openView().catch((e) => new import_obsidian.Notice(String(e)));
    });
  }
  async refresh() {
    if (this.stopped) return;
    if (this.refreshing) return this.refreshing;
    this.refreshing = (async () => {
      const s = this.store;
      await s.refresh();
      const q = await s.queue();
      const f = freshness(
        s.run,
        /* @__PURE__ */ new Date(),
        s.policy.timezone,
        s.policy.expected_hour,
        s.policy.grace_minutes
      );
      this.status?.setText(
        "\u590D\u4E60 " + q.overdue_count + " \xB7 \u65B0\u9898 " + q.new_count + (f.missed ? " \xB7 AI \u66F4\u65B0\u5F85\u5904\u7406" : "")
      );
      for (const leaf of this.app.workspace.getLeavesOfType(VIEW))
        await leaf.view.render();
      const day = calendarDay(/* @__PURE__ */ new Date(), s.policy.timezone);
      if (this.reminders && day !== this.reminded && (q.cards.length || f.missed)) {
        this.reminded = day;
        new import_obsidian.Notice(
          "\u4ECA\u65E5\u5230\u671F " + q.overdue_count + " \u9879\uFF0C\u5F85\u68C0\u9A8C " + q.new_count + " \u9879" + (f.missed ? "\uFF1B\u8BF7\u68C0\u67E5\u6BCF\u65E5 AI \u66F4\u65B0\u4EFB\u52A1" : ""),
          1e4
        );
      }
    })().finally(() => {
      this.refreshing = void 0;
    });
    return this.refreshing;
  }
  async openView() {
    let leaf = this.app.workspace.getLeavesOfType(VIEW)[0];
    if (!leaf) {
      leaf = this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW, active: true });
    }
    await this.app.workspace.revealLeaf(leaf);
  }
  async source(id) {
    const source = this.store.sources.get(id);
    if (source)
      await this.app.workspace.openLinkText(
        source.path + "#" + (source.section === "@preamble" ? "" : source.section.split(" \u203A ").at(-1)),
        "",
        true
      );
  }
  onunload() {
    this.stopped = true;
  }
};
var ReviewView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  plugin;
  getViewType() {
    return VIEW;
  }
  getDisplayText() {
    return "\u4ECA\u65E5\u590D\u4E60";
  }
  getIcon() {
    return "brain";
  }
  async onOpen() {
    await this.render();
  }
  async render() {
    const s = this.plugin.store;
    const q = await s.queue();
    const el = this.contentEl;
    el.empty();
    el.addClass("fsrs-review");
    el.createEl("h2", { text: "\u4ECA\u65E5\u590D\u4E60" });
    el.createEl("p", {
      text: "\u5230\u671F " + q.overdue_count + " \u9879 \xB7 \u5F85\u9996\u6B21\u68C0\u9A8C " + q.new_count + " \u9879 \xB7 \u5EFA\u8BAE\u7EA6 " + s.policy.budget_minutes + " \u5206\u949F\uFF0C\u53EF\u968F\u65F6\u7EE7\u7EED\u6216\u9000\u51FA"
    });
    button(el, "\u5237\u65B0", () => this.plugin.refresh());
    const f = freshness(
      s.run,
      /* @__PURE__ */ new Date(),
      s.policy.timezone,
      s.policy.expected_hour,
      s.policy.grace_minutes
    );
    el.createEl("p", {
      text: "\u6700\u8FD1 AI \u4EFB\u52A1\u6210\u529F\uFF1A" + (s.run?.last_success_at ? new Date(s.run.last_success_at).toLocaleString() : "\u5C1A\u65E0") + "\uFF1B\u5B9E\u9645\u5185\u5BB9\u66F4\u65B0\uFF1A" + (f.days_since_update === null ? "\u5C1A\u65E0" : f.days_since_update + " \u5929\u524D") + (f.missed ? "\uFF1B\u5DF2\u8D85\u8FC7\u9884\u671F\u66F4\u65B0\u65F6\u6BB5\uFF0C\u8BF7\u68C0\u67E5 DSH \u4EFB\u52A1" : "")
    });
    if (s.run?.status && s.run.status !== "success")
      el.createEl("p", {
        text: "\u4E0A\u6B21\u5904\u7406\uFF1A" + s.run.status + "\uFF1B" + s.run.issues.join("\uFF1B")
      });
    for (const card of q.cards) {
      const box = el.createDiv({ cls: "fsrs-card" });
      box.createEl("h3", { text: card.objective });
      box.createEl("p", {
        text: (card.status === "ready" ? "\u9996\u6B21\u68C0\u9A8C" : "\u5230\u671F\u590D\u4E60") + " \xB7 \u9884\u8BA1 " + Math.ceil(card.estimated_seconds / 60) + " \u5206\u949F"
      });
      button(box, "\u5F00\u59CB\u56DE\u5FC6", () => new Recall(this.plugin, card).open());
      button(box, "\u4ECA\u5929\u7A0D\u540E\u505A", async () => {
        await s.review.manage(
          card.id,
          "snooze",
          /* @__PURE__ */ new Date(),
          new Date(Date.now() + 864e5).toISOString()
        );
        await this.plugin.refresh();
      });
      button(box, "\u6682\u505C", async () => {
        await s.review.manage(card.id, "suspend");
        await this.plugin.refresh();
      });
      for (const id of card.source_ids) button(box, "\u6253\u5F00\u6765\u6E90", () => this.plugin.source(id));
    }
    if (!q.cards.length)
      el.createEl("p", { text: "\u76EE\u524D\u6CA1\u6709\u5230\u671F\u4EFB\u52A1\u3002\u6CA1\u6709\u65B0\u9898\u4E0D\u4F1A\u5F71\u54CD\u5DF2\u6709\u77E5\u8BC6\u7684\u540E\u7EED\u590D\u4E60\u3002" });
    const eligible = [...s.review.cards.values()].filter(
      (c) => ["ready", "active"].includes(c.status)
    );
    if (eligible.length > q.cards.length)
      el.createEl("p", {
        text: "\u5C1A\u672A\u5230\u671F\u3001\u5DF2\u7A0D\u540E\u63D0\u9192\u6216\u6765\u6E90\u5F85\u6838\u67E5\uFF1A" + (eligible.length - q.cards.length) + " \u9879\u3002\u6765\u6E90\u53D8\u5316\u540E\u8BF7\u7531\u6BCF\u65E5\u4EFB\u52A1\u91CD\u65B0\u51C6\u5907\u3002"
      });
    for (const card of s.review.cards.values())
      if (card.status === "suspended") {
        const row = el.createDiv();
        row.createEl("span", { text: "\u5DF2\u6682\u505C\uFF1A" + card.objective });
        button(row, "\u6062\u590D", async () => {
          await s.review.manage(card.id, "resume");
          await this.plugin.refresh();
        });
      }
    for (const revision of s.revisions) {
      const box = el.createDiv({ cls: "fsrs-card" });
      box.createEl("h3", { text: "\u9898\u76EE\u4FEE\u8BA2\u5F85\u786E\u8BA4\uFF1A" + revision.input.objective });
      box.createEl("p", { text: revision.input.question });
      button(box, "\u7B49\u4EF7\u4FEE\u8BA2\uFF0C\u4FDD\u7559\u8BB0\u5FC6\u8BB0\u5F55", () => this.confirm(revision, true));
      button(box, "\u65B0\u8BED\u4E49\uFF0C\u91CD\u65B0\u5B66\u4E60", () => this.confirm(revision, false));
    }
    for (const task of s.tasks) {
      if (Date.parse(task.due_at) > Date.now()) continue;
      const box = el.createDiv();
      box.createEl("h3", {
        text: (task.kind === "reading" ? "\u9605\u8BFB\uFF1A" : "\u5B9E\u8DF5\uFF1A") + task.title
      });
      for (const id of task.source_ids)
        button(box, "\u6253\u5F00\u4EFB\u52A1\u6765\u6E90", () => this.plugin.source(id));
      button(box, "\u5DF2\u5B8C\u6210\u4EFB\u52A1", async () => {
        await s.completeTask(task);
        await this.plugin.refresh();
      });
    }
    const archive = el.createEl("details");
    archive.createEl("summary", { text: "\u5386\u53F2\u6750\u6599" });
    for (const day of await s.vaultFiles.list("Chores/reviewDocs"))
      if (/^\d{4}-\d\d-\d\d$/.test(day)) {
        for (const run of await s.vaultFiles.list("Chores/reviewDocs/" + day))
          if (/^[a-f0-9-]{36}$/.test(run))
            button(
              archive,
              day + " " + run.slice(0, 8),
              () => this.plugin.app.workspace.openLinkText(
                "Chores/reviewDocs/" + day + "/" + run + "/Review.md",
                "",
                true
              )
            );
      }
    if (s.errors.length) {
      const errors = el.createEl("details");
      errors.createEl("summary", { text: "\u9700\u8981\u5904\u7406\u7684\u95EE\u9898\uFF08" + s.errors.length + "\uFF09" });
      errors.createEl("pre", { text: s.errors.join("\n") });
    }
  }
  async confirm(revision, preserve) {
    await this.plugin.store.acceptRevision(revision, preserve);
    await this.plugin.refresh();
  }
};
var Recall = class extends import_obsidian.Modal {
  constructor(plugin, card) {
    super(plugin.app);
    this.plugin = plugin;
    this.card = card;
  }
  plugin;
  card;
  attempt = (0, import_node_crypto4.randomUUID)();
  async onOpen() {
    this.contentEl.setAttribute("role", "dialog");
    this.contentEl.createEl("h2", { text: this.card.objective });
    await import_obsidian.MarkdownRenderer.render(
      this.app,
      this.card.question,
      this.contentEl,
      "",
      this.plugin
    );
    button(this.contentEl, "\u53EA\u9605\u8BFB\uFF0C\u4E0D\u8BC4\u5206", async () => {
      await this.plugin.store.review.completeReading("read-" + this.card.id);
      this.close();
      await this.plugin.refresh();
    });
    const answers = this.contentEl.createDiv();
    button(this.contentEl, "\u5DF2\u5C1D\u8BD5\u56DE\u5FC6\uFF0C\u67E5\u770B\u8BC4\u5206\u8981\u70B9", () => {
      answers.empty();
      answers.createEl("h3", { text: "\u8BC4\u5206\u8981\u70B9" });
      for (const item of this.card.rubric) answers.createEl("p", { text: item });
      for (const [rating, label] of [
        [1, "Again\uFF1A\u65E0\u6CD5\u72EC\u7ACB\u7B54\u5BF9"],
        [2, "Hard\uFF1A\u7B54\u5BF9\u4F46\u56F0\u96BE"],
        [3, "Good\uFF1A\u72EC\u7ACB\u7B54\u5BF9"],
        [4, "Easy\uFF1A\u8FC5\u901F\u5B8C\u6574\u7B54\u5BF9"]
      ])
        button(answers, label, async () => {
          await this.plugin.store.grade(
            this.card.id,
            rating,
            this.attempt,
            /* @__PURE__ */ new Date(),
            this.card.event_id
          );
          this.close();
          await this.plugin.refresh();
        });
    });
  }
};
var Preferences = class extends import_obsidian.PluginSettingTab {
  constructor(app, reviewPlugin) {
    super(app, reviewPlugin);
    this.reviewPlugin = reviewPlugin;
  }
  reviewPlugin;
  display() {
    const p = this.reviewPlugin;
    this.containerEl.empty();
    new import_obsidian.Setting(this.containerEl).setName("\u6BCF\u65E5\u4E3B\u52A8\u63D0\u9192").setDesc("\u5230\u671F\u6216\u6BCF\u65E5 AI \u66F4\u65B0\u903E\u671F\u65F6\u63D0\u9192\uFF1B\u9000\u51FA Obsidian \u540E\u63D2\u4EF6\u4E0D\u8FD0\u884C\u3002").addToggle(
      (t) => t.setValue(p.reminders).onChange(async (v) => {
        p.reminders = Boolean(v);
        await p.saveData({ reminders: p.reminders });
      })
    );
    this.containerEl.createEl("p", {
      text: "\u65F6\u95F4\u3001\u4FDD\u6301\u7387\u548C\u5EFA\u8BAE\u9898\u91CF\u8BFB\u53D6 .agents/Context.md\u3002\u6BCF\u5929\u7684\u5916\u90E8\u4EFB\u52A1\u7531 DSH \u914D\u7F6E\uFF1B\u8FD9\u91CC\u4E0D\u542F\u52A8\u6A21\u578B\u3001\u4E0D\u63D0\u4EA4 Git\u3002"
    });
  }
};
/*! Bundled license information:

ts-fsrs/dist/index.mjs:
ts-fsrs/dist/index.mjs:
ts-fsrs/dist/index.mjs:
  (* istanbul ignore next -- @preserve *)
*/
