import kt, { app as ot, ipcMain as At, BrowserWindow as Oo } from "electron";
import Y from "path";
import Tt, { fileURLToPath as Xf } from "url";
import We from "fs";
import Kf from "constants";
import zr from "stream";
import Io from "util";
import $l from "assert";
import Xn from "child_process";
import Rl from "events";
import Xr from "crypto";
import Ol from "tty";
import Kn from "os";
import Il from "zlib";
import Jf from "http";
var $e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Le = {}, Bt = {}, Oe = {};
Oe.fromCallback = function(e) {
  return Object.defineProperty(function(...t) {
    if (typeof t[t.length - 1] == "function") e.apply(this, t);
    else
      return new Promise((r, n) => {
        t.push((i, o) => i != null ? n(i) : r(o)), e.apply(this, t);
      });
  }, "name", { value: e.name });
};
Oe.fromPromise = function(e) {
  return Object.defineProperty(function(...t) {
    const r = t[t.length - 1];
    if (typeof r != "function") return e.apply(this, t);
    t.pop(), e.apply(this, t).then((n) => r(null, n), r);
  }, "name", { value: e.name });
};
var ut = Kf, Qf = process.cwd, Fn = null, Zf = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return Fn || (Fn = Qf.call(process)), Fn;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var Pa = process.chdir;
  process.chdir = function(e) {
    Fn = null, Pa.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, Pa);
}
var ed = td;
function td(e) {
  ut.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && t(e), e.lutimes || r(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = n(e.chmod), e.fchmod = n(e.fchmod), e.lchmod = n(e.lchmod), e.chownSync = a(e.chownSync), e.fchownSync = a(e.fchownSync), e.lchownSync = a(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = s(e.stat), e.fstat = s(e.fstat), e.lstat = s(e.lstat), e.statSync = l(e.statSync), e.fstatSync = l(e.fstatSync), e.lstatSync = l(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(c, f, g) {
    g && process.nextTick(g);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(c, f, g, m) {
    m && process.nextTick(m);
  }, e.lchownSync = function() {
  }), Zf === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(c) {
    function f(g, m, v) {
      var E = Date.now(), A = 0;
      c(g, m, function T(C) {
        if (C && (C.code === "EACCES" || C.code === "EPERM" || C.code === "EBUSY") && Date.now() - E < 6e4) {
          setTimeout(function() {
            e.stat(m, function(D, B) {
              D && D.code === "ENOENT" ? c(g, m, T) : v(C);
            });
          }, A), A < 100 && (A += 10);
          return;
        }
        v && v(C);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, c), f;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(c) {
    function f(g, m, v, E, A, T) {
      var C;
      if (T && typeof T == "function") {
        var D = 0;
        C = function(B, G, Z) {
          if (B && B.code === "EAGAIN" && D < 10)
            return D++, c.call(e, g, m, v, E, A, C);
          T.apply(this, arguments);
        };
      }
      return c.call(e, g, m, v, E, A, C);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, c), f;
  }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(c) {
    return function(f, g, m, v, E) {
      for (var A = 0; ; )
        try {
          return c.call(e, f, g, m, v, E);
        } catch (T) {
          if (T.code === "EAGAIN" && A < 10) {
            A++;
            continue;
          }
          throw T;
        }
    };
  }(e.readSync);
  function t(c) {
    c.lchmod = function(f, g, m) {
      c.open(
        f,
        ut.O_WRONLY | ut.O_SYMLINK,
        g,
        function(v, E) {
          if (v) {
            m && m(v);
            return;
          }
          c.fchmod(E, g, function(A) {
            c.close(E, function(T) {
              m && m(A || T);
            });
          });
        }
      );
    }, c.lchmodSync = function(f, g) {
      var m = c.openSync(f, ut.O_WRONLY | ut.O_SYMLINK, g), v = !0, E;
      try {
        E = c.fchmodSync(m, g), v = !1;
      } finally {
        if (v)
          try {
            c.closeSync(m);
          } catch {
          }
        else
          c.closeSync(m);
      }
      return E;
    };
  }
  function r(c) {
    ut.hasOwnProperty("O_SYMLINK") && c.futimes ? (c.lutimes = function(f, g, m, v) {
      c.open(f, ut.O_SYMLINK, function(E, A) {
        if (E) {
          v && v(E);
          return;
        }
        c.futimes(A, g, m, function(T) {
          c.close(A, function(C) {
            v && v(T || C);
          });
        });
      });
    }, c.lutimesSync = function(f, g, m) {
      var v = c.openSync(f, ut.O_SYMLINK), E, A = !0;
      try {
        E = c.futimesSync(v, g, m), A = !1;
      } finally {
        if (A)
          try {
            c.closeSync(v);
          } catch {
          }
        else
          c.closeSync(v);
      }
      return E;
    }) : c.futimes && (c.lutimes = function(f, g, m, v) {
      v && process.nextTick(v);
    }, c.lutimesSync = function() {
    });
  }
  function n(c) {
    return c && function(f, g, m) {
      return c.call(e, f, g, function(v) {
        h(v) && (v = null), m && m.apply(this, arguments);
      });
    };
  }
  function i(c) {
    return c && function(f, g) {
      try {
        return c.call(e, f, g);
      } catch (m) {
        if (!h(m)) throw m;
      }
    };
  }
  function o(c) {
    return c && function(f, g, m, v) {
      return c.call(e, f, g, m, function(E) {
        h(E) && (E = null), v && v.apply(this, arguments);
      });
    };
  }
  function a(c) {
    return c && function(f, g, m) {
      try {
        return c.call(e, f, g, m);
      } catch (v) {
        if (!h(v)) throw v;
      }
    };
  }
  function s(c) {
    return c && function(f, g, m) {
      typeof g == "function" && (m = g, g = null);
      function v(E, A) {
        A && (A.uid < 0 && (A.uid += 4294967296), A.gid < 0 && (A.gid += 4294967296)), m && m.apply(this, arguments);
      }
      return g ? c.call(e, f, g, v) : c.call(e, f, v);
    };
  }
  function l(c) {
    return c && function(f, g) {
      var m = g ? c.call(e, f, g) : c.call(e, f);
      return m && (m.uid < 0 && (m.uid += 4294967296), m.gid < 0 && (m.gid += 4294967296)), m;
    };
  }
  function h(c) {
    if (!c || c.code === "ENOSYS")
      return !0;
    var f = !process.getuid || process.getuid() !== 0;
    return !!(f && (c.code === "EINVAL" || c.code === "EPERM"));
  }
}
var Na = zr.Stream, rd = nd;
function nd(e) {
  return {
    ReadStream: t,
    WriteStream: r
  };
  function t(n, i) {
    if (!(this instanceof t)) return new t(n, i);
    Na.call(this);
    var o = this;
    this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
    for (var a = Object.keys(i), s = 0, l = a.length; s < l; s++) {
      var h = a[s];
      this[h] = i[h];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        o._read();
      });
      return;
    }
    e.open(this.path, this.flags, this.mode, function(c, f) {
      if (c) {
        o.emit("error", c), o.readable = !1;
        return;
      }
      o.fd = f, o.emit("open", f), o._read();
    });
  }
  function r(n, i) {
    if (!(this instanceof r)) return new r(n, i);
    Na.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
    for (var o = Object.keys(i), a = 0, s = o.length; a < s; a++) {
      var l = o[a];
      this[l] = i[l];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = e.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var id = ad, od = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function ad(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var t = { __proto__: od(e) };
  else
    var t = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(r) {
    Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(e, r));
  }), t;
}
var ie = We, sd = ed, ld = rd, cd = id, En = Io, ye, kn;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (ye = Symbol.for("graceful-fs.queue"), kn = Symbol.for("graceful-fs.previous")) : (ye = "___graceful-fs.queue", kn = "___graceful-fs.previous");
function ud() {
}
function Pl(e, t) {
  Object.defineProperty(e, ye, {
    get: function() {
      return t;
    }
  });
}
var Lt = ud;
En.debuglog ? Lt = En.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Lt = function() {
  var e = En.format.apply(En, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!ie[ye]) {
  var fd = $e[ye] || [];
  Pl(ie, fd), ie.close = function(e) {
    function t(r, n) {
      return e.call(ie, r, function(i) {
        i || Da(), typeof n == "function" && n.apply(this, arguments);
      });
    }
    return Object.defineProperty(t, kn, {
      value: e
    }), t;
  }(ie.close), ie.closeSync = function(e) {
    function t(r) {
      e.apply(ie, arguments), Da();
    }
    return Object.defineProperty(t, kn, {
      value: e
    }), t;
  }(ie.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    Lt(ie[ye]), $l.equal(ie[ye].length, 0);
  });
}
$e[ye] || Pl($e, ie[ye]);
var Ie = Po(cd(ie));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !ie.__patched && (Ie = Po(ie), ie.__patched = !0);
function Po(e) {
  sd(e), e.gracefulify = Po, e.createReadStream = G, e.createWriteStream = Z;
  var t = e.readFile;
  e.readFile = r;
  function r(U, y, H) {
    return typeof y == "function" && (H = y, y = null), X(U, y, H);
    function X(te, O, R, P) {
      return t(te, O, function($) {
        $ && ($.code === "EMFILE" || $.code === "ENFILE") ? Yt([X, [te, O, R], $, P || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  var n = e.writeFile;
  e.writeFile = i;
  function i(U, y, H, X) {
    return typeof H == "function" && (X = H, H = null), te(U, y, H, X);
    function te(O, R, P, $, N) {
      return n(O, R, P, function(I) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? Yt([te, [O, R, P, $], I, N || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var o = e.appendFile;
  o && (e.appendFile = a);
  function a(U, y, H, X) {
    return typeof H == "function" && (X = H, H = null), te(U, y, H, X);
    function te(O, R, P, $, N) {
      return o(O, R, P, function(I) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? Yt([te, [O, R, P, $], I, N || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var s = e.copyFile;
  s && (e.copyFile = l);
  function l(U, y, H, X) {
    return typeof H == "function" && (X = H, H = 0), te(U, y, H, X);
    function te(O, R, P, $, N) {
      return s(O, R, P, function(I) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? Yt([te, [O, R, P, $], I, N || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var h = e.readdir;
  e.readdir = f;
  var c = /^v[0-5]\./;
  function f(U, y, H) {
    typeof y == "function" && (H = y, y = null);
    var X = c.test(process.version) ? function(R, P, $, N) {
      return h(R, te(
        R,
        P,
        $,
        N
      ));
    } : function(R, P, $, N) {
      return h(R, P, te(
        R,
        P,
        $,
        N
      ));
    };
    return X(U, y, H);
    function te(O, R, P, $) {
      return function(N, I) {
        N && (N.code === "EMFILE" || N.code === "ENFILE") ? Yt([
          X,
          [O, R, P],
          N,
          $ || Date.now(),
          Date.now()
        ]) : (I && I.sort && I.sort(), typeof P == "function" && P.call(this, N, I));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var g = ld(e);
    T = g.ReadStream, D = g.WriteStream;
  }
  var m = e.ReadStream;
  m && (T.prototype = Object.create(m.prototype), T.prototype.open = C);
  var v = e.WriteStream;
  v && (D.prototype = Object.create(v.prototype), D.prototype.open = B), Object.defineProperty(e, "ReadStream", {
    get: function() {
      return T;
    },
    set: function(U) {
      T = U;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "WriteStream", {
    get: function() {
      return D;
    },
    set: function(U) {
      D = U;
    },
    enumerable: !0,
    configurable: !0
  });
  var E = T;
  Object.defineProperty(e, "FileReadStream", {
    get: function() {
      return E;
    },
    set: function(U) {
      E = U;
    },
    enumerable: !0,
    configurable: !0
  });
  var A = D;
  Object.defineProperty(e, "FileWriteStream", {
    get: function() {
      return A;
    },
    set: function(U) {
      A = U;
    },
    enumerable: !0,
    configurable: !0
  });
  function T(U, y) {
    return this instanceof T ? (m.apply(this, arguments), this) : T.apply(Object.create(T.prototype), arguments);
  }
  function C() {
    var U = this;
    ae(U.path, U.flags, U.mode, function(y, H) {
      y ? (U.autoClose && U.destroy(), U.emit("error", y)) : (U.fd = H, U.emit("open", H), U.read());
    });
  }
  function D(U, y) {
    return this instanceof D ? (v.apply(this, arguments), this) : D.apply(Object.create(D.prototype), arguments);
  }
  function B() {
    var U = this;
    ae(U.path, U.flags, U.mode, function(y, H) {
      y ? (U.destroy(), U.emit("error", y)) : (U.fd = H, U.emit("open", H));
    });
  }
  function G(U, y) {
    return new e.ReadStream(U, y);
  }
  function Z(U, y) {
    return new e.WriteStream(U, y);
  }
  var ee = e.open;
  e.open = ae;
  function ae(U, y, H, X) {
    return typeof H == "function" && (X = H, H = null), te(U, y, H, X);
    function te(O, R, P, $, N) {
      return ee(O, R, P, function(I, k) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? Yt([te, [O, R, P, $], I, N || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  return e;
}
function Yt(e) {
  Lt("ENQUEUE", e[0].name, e[1]), ie[ye].push(e), No();
}
var yn;
function Da() {
  for (var e = Date.now(), t = 0; t < ie[ye].length; ++t)
    ie[ye][t].length > 2 && (ie[ye][t][3] = e, ie[ye][t][4] = e);
  No();
}
function No() {
  if (clearTimeout(yn), yn = void 0, ie[ye].length !== 0) {
    var e = ie[ye].shift(), t = e[0], r = e[1], n = e[2], i = e[3], o = e[4];
    if (i === void 0)
      Lt("RETRY", t.name, r), t.apply(null, r);
    else if (Date.now() - i >= 6e4) {
      Lt("TIMEOUT", t.name, r);
      var a = r.pop();
      typeof a == "function" && a.call(null, n);
    } else {
      var s = Date.now() - o, l = Math.max(o - i, 1), h = Math.min(l * 1.2, 100);
      s >= h ? (Lt("RETRY", t.name, r), t.apply(null, r.concat([i]))) : ie[ye].push(e);
    }
    yn === void 0 && (yn = setTimeout(No, 0));
  }
}
(function(e) {
  const t = Oe.fromCallback, r = Ie, n = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((i) => typeof r[i] == "function");
  Object.assign(e, r), n.forEach((i) => {
    e[i] = t(r[i]);
  }), e.exists = function(i, o) {
    return typeof o == "function" ? r.exists(i, o) : new Promise((a) => r.exists(i, a));
  }, e.read = function(i, o, a, s, l, h) {
    return typeof h == "function" ? r.read(i, o, a, s, l, h) : new Promise((c, f) => {
      r.read(i, o, a, s, l, (g, m, v) => {
        if (g) return f(g);
        c({ bytesRead: m, buffer: v });
      });
    });
  }, e.write = function(i, o, ...a) {
    return typeof a[a.length - 1] == "function" ? r.write(i, o, ...a) : new Promise((s, l) => {
      r.write(i, o, ...a, (h, c, f) => {
        if (h) return l(h);
        s({ bytesWritten: c, buffer: f });
      });
    });
  }, typeof r.writev == "function" && (e.writev = function(i, o, ...a) {
    return typeof a[a.length - 1] == "function" ? r.writev(i, o, ...a) : new Promise((s, l) => {
      r.writev(i, o, ...a, (h, c, f) => {
        if (h) return l(h);
        s({ bytesWritten: c, buffers: f });
      });
    });
  }), typeof r.realpath.native == "function" ? e.realpath.native = t(r.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(Bt);
var Do = {}, Nl = {};
const dd = Y;
Nl.checkPath = function(t) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(t.replace(dd.parse(t).root, ""))) {
    const n = new Error(`Path contains invalid characters: ${t}`);
    throw n.code = "EINVAL", n;
  }
};
const Dl = Bt, { checkPath: Fl } = Nl, xl = (e) => {
  const t = { mode: 511 };
  return typeof e == "number" ? e : { ...t, ...e }.mode;
};
Do.makeDir = async (e, t) => (Fl(e), Dl.mkdir(e, {
  mode: xl(t),
  recursive: !0
}));
Do.makeDirSync = (e, t) => (Fl(e), Dl.mkdirSync(e, {
  mode: xl(t),
  recursive: !0
}));
const hd = Oe.fromPromise, { makeDir: pd, makeDirSync: Ri } = Do, Oi = hd(pd);
var tt = {
  mkdirs: Oi,
  mkdirsSync: Ri,
  // alias
  mkdirp: Oi,
  mkdirpSync: Ri,
  ensureDir: Oi,
  ensureDirSync: Ri
};
const md = Oe.fromPromise, Ll = Bt;
function gd(e) {
  return Ll.access(e).then(() => !0).catch(() => !1);
}
var jt = {
  pathExists: md(gd),
  pathExistsSync: Ll.existsSync
};
const ar = Ie;
function Ed(e, t, r, n) {
  ar.open(e, "r+", (i, o) => {
    if (i) return n(i);
    ar.futimes(o, t, r, (a) => {
      ar.close(o, (s) => {
        n && n(a || s);
      });
    });
  });
}
function yd(e, t, r) {
  const n = ar.openSync(e, "r+");
  return ar.futimesSync(n, t, r), ar.closeSync(n);
}
var Ul = {
  utimesMillis: Ed,
  utimesMillisSync: yd
};
const lr = Bt, me = Y, vd = Io;
function wd(e, t, r) {
  const n = r.dereference ? (i) => lr.stat(i, { bigint: !0 }) : (i) => lr.lstat(i, { bigint: !0 });
  return Promise.all([
    n(e),
    n(t).catch((i) => {
      if (i.code === "ENOENT") return null;
      throw i;
    })
  ]).then(([i, o]) => ({ srcStat: i, destStat: o }));
}
function _d(e, t, r) {
  let n;
  const i = r.dereference ? (a) => lr.statSync(a, { bigint: !0 }) : (a) => lr.lstatSync(a, { bigint: !0 }), o = i(e);
  try {
    n = i(t);
  } catch (a) {
    if (a.code === "ENOENT") return { srcStat: o, destStat: null };
    throw a;
  }
  return { srcStat: o, destStat: n };
}
function Ad(e, t, r, n, i) {
  vd.callbackify(wd)(e, t, n, (o, a) => {
    if (o) return i(o);
    const { srcStat: s, destStat: l } = a;
    if (l) {
      if (Kr(s, l)) {
        const h = me.basename(e), c = me.basename(t);
        return r === "move" && h !== c && h.toLowerCase() === c.toLowerCase() ? i(null, { srcStat: s, destStat: l, isChangingCase: !0 }) : i(new Error("Source and destination must not be the same."));
      }
      if (s.isDirectory() && !l.isDirectory())
        return i(new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`));
      if (!s.isDirectory() && l.isDirectory())
        return i(new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`));
    }
    return s.isDirectory() && Fo(e, t) ? i(new Error(Jn(e, t, r))) : i(null, { srcStat: s, destStat: l });
  });
}
function Td(e, t, r, n) {
  const { srcStat: i, destStat: o } = _d(e, t, n);
  if (o) {
    if (Kr(i, o)) {
      const a = me.basename(e), s = me.basename(t);
      if (r === "move" && a !== s && a.toLowerCase() === s.toLowerCase())
        return { srcStat: i, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!i.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && Fo(e, t))
    throw new Error(Jn(e, t, r));
  return { srcStat: i, destStat: o };
}
function kl(e, t, r, n, i) {
  const o = me.resolve(me.dirname(e)), a = me.resolve(me.dirname(r));
  if (a === o || a === me.parse(a).root) return i();
  lr.stat(a, { bigint: !0 }, (s, l) => s ? s.code === "ENOENT" ? i() : i(s) : Kr(t, l) ? i(new Error(Jn(e, r, n))) : kl(e, t, a, n, i));
}
function Ml(e, t, r, n) {
  const i = me.resolve(me.dirname(e)), o = me.resolve(me.dirname(r));
  if (o === i || o === me.parse(o).root) return;
  let a;
  try {
    a = lr.statSync(o, { bigint: !0 });
  } catch (s) {
    if (s.code === "ENOENT") return;
    throw s;
  }
  if (Kr(t, a))
    throw new Error(Jn(e, r, n));
  return Ml(e, t, o, n);
}
function Kr(e, t) {
  return t.ino && t.dev && t.ino === e.ino && t.dev === e.dev;
}
function Fo(e, t) {
  const r = me.resolve(e).split(me.sep).filter((i) => i), n = me.resolve(t).split(me.sep).filter((i) => i);
  return r.reduce((i, o, a) => i && n[a] === o, !0);
}
function Jn(e, t, r) {
  return `Cannot ${r} '${e}' to a subdirectory of itself, '${t}'.`;
}
var dr = {
  checkPaths: Ad,
  checkPathsSync: Td,
  checkParentPaths: kl,
  checkParentPathsSync: Ml,
  isSrcSubdir: Fo,
  areIdentical: Kr
};
const De = Ie, Dr = Y, Sd = tt.mkdirs, Cd = jt.pathExists, bd = Ul.utimesMillis, Fr = dr;
function $d(e, t, r, n) {
  typeof r == "function" && !n ? (n = r, r = {}) : typeof r == "function" && (r = { filter: r }), n = n || function() {
  }, r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), Fr.checkPaths(e, t, "copy", r, (i, o) => {
    if (i) return n(i);
    const { srcStat: a, destStat: s } = o;
    Fr.checkParentPaths(e, a, t, "copy", (l) => l ? n(l) : r.filter ? Bl(Fa, s, e, t, r, n) : Fa(s, e, t, r, n));
  });
}
function Fa(e, t, r, n, i) {
  const o = Dr.dirname(r);
  Cd(o, (a, s) => {
    if (a) return i(a);
    if (s) return Mn(e, t, r, n, i);
    Sd(o, (l) => l ? i(l) : Mn(e, t, r, n, i));
  });
}
function Bl(e, t, r, n, i, o) {
  Promise.resolve(i.filter(r, n)).then((a) => a ? e(t, r, n, i, o) : o(), (a) => o(a));
}
function Rd(e, t, r, n, i) {
  return n.filter ? Bl(Mn, e, t, r, n, i) : Mn(e, t, r, n, i);
}
function Mn(e, t, r, n, i) {
  (n.dereference ? De.stat : De.lstat)(t, (a, s) => a ? i(a) : s.isDirectory() ? xd(s, e, t, r, n, i) : s.isFile() || s.isCharacterDevice() || s.isBlockDevice() ? Od(s, e, t, r, n, i) : s.isSymbolicLink() ? kd(e, t, r, n, i) : s.isSocket() ? i(new Error(`Cannot copy a socket file: ${t}`)) : s.isFIFO() ? i(new Error(`Cannot copy a FIFO pipe: ${t}`)) : i(new Error(`Unknown file: ${t}`)));
}
function Od(e, t, r, n, i, o) {
  return t ? Id(e, r, n, i, o) : jl(e, r, n, i, o);
}
function Id(e, t, r, n, i) {
  if (n.overwrite)
    De.unlink(r, (o) => o ? i(o) : jl(e, t, r, n, i));
  else return n.errorOnExist ? i(new Error(`'${r}' already exists`)) : i();
}
function jl(e, t, r, n, i) {
  De.copyFile(t, r, (o) => o ? i(o) : n.preserveTimestamps ? Pd(e.mode, t, r, i) : Qn(r, e.mode, i));
}
function Pd(e, t, r, n) {
  return Nd(e) ? Dd(r, e, (i) => i ? n(i) : xa(e, t, r, n)) : xa(e, t, r, n);
}
function Nd(e) {
  return (e & 128) === 0;
}
function Dd(e, t, r) {
  return Qn(e, t | 128, r);
}
function xa(e, t, r, n) {
  Fd(t, r, (i) => i ? n(i) : Qn(r, e, n));
}
function Qn(e, t, r) {
  return De.chmod(e, t, r);
}
function Fd(e, t, r) {
  De.stat(e, (n, i) => n ? r(n) : bd(t, i.atime, i.mtime, r));
}
function xd(e, t, r, n, i, o) {
  return t ? Hl(r, n, i, o) : Ld(e.mode, r, n, i, o);
}
function Ld(e, t, r, n, i) {
  De.mkdir(r, (o) => {
    if (o) return i(o);
    Hl(t, r, n, (a) => a ? i(a) : Qn(r, e, i));
  });
}
function Hl(e, t, r, n) {
  De.readdir(e, (i, o) => i ? n(i) : ql(o, e, t, r, n));
}
function ql(e, t, r, n, i) {
  const o = e.pop();
  return o ? Ud(e, o, t, r, n, i) : i();
}
function Ud(e, t, r, n, i, o) {
  const a = Dr.join(r, t), s = Dr.join(n, t);
  Fr.checkPaths(a, s, "copy", i, (l, h) => {
    if (l) return o(l);
    const { destStat: c } = h;
    Rd(c, a, s, i, (f) => f ? o(f) : ql(e, r, n, i, o));
  });
}
function kd(e, t, r, n, i) {
  De.readlink(t, (o, a) => {
    if (o) return i(o);
    if (n.dereference && (a = Dr.resolve(process.cwd(), a)), e)
      De.readlink(r, (s, l) => s ? s.code === "EINVAL" || s.code === "UNKNOWN" ? De.symlink(a, r, i) : i(s) : (n.dereference && (l = Dr.resolve(process.cwd(), l)), Fr.isSrcSubdir(a, l) ? i(new Error(`Cannot copy '${a}' to a subdirectory of itself, '${l}'.`)) : e.isDirectory() && Fr.isSrcSubdir(l, a) ? i(new Error(`Cannot overwrite '${l}' with '${a}'.`)) : Md(a, r, i)));
    else
      return De.symlink(a, r, i);
  });
}
function Md(e, t, r) {
  De.unlink(t, (n) => n ? r(n) : De.symlink(e, t, r));
}
var Bd = $d;
const Se = Ie, xr = Y, jd = tt.mkdirsSync, Hd = Ul.utimesMillisSync, Lr = dr;
function qd(e, t, r) {
  typeof r == "function" && (r = { filter: r }), r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: n, destStat: i } = Lr.checkPathsSync(e, t, "copy", r);
  return Lr.checkParentPathsSync(e, n, t, "copy"), Gd(i, e, t, r);
}
function Gd(e, t, r, n) {
  if (n.filter && !n.filter(t, r)) return;
  const i = xr.dirname(r);
  return Se.existsSync(i) || jd(i), Gl(e, t, r, n);
}
function Vd(e, t, r, n) {
  if (!(n.filter && !n.filter(t, r)))
    return Gl(e, t, r, n);
}
function Gl(e, t, r, n) {
  const o = (n.dereference ? Se.statSync : Se.lstatSync)(t);
  if (o.isDirectory()) return Qd(o, e, t, r, n);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return Wd(o, e, t, r, n);
  if (o.isSymbolicLink()) return th(e, t, r, n);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
function Wd(e, t, r, n, i) {
  return t ? Yd(e, r, n, i) : Vl(e, r, n, i);
}
function Yd(e, t, r, n) {
  if (n.overwrite)
    return Se.unlinkSync(r), Vl(e, t, r, n);
  if (n.errorOnExist)
    throw new Error(`'${r}' already exists`);
}
function Vl(e, t, r, n) {
  return Se.copyFileSync(t, r), n.preserveTimestamps && zd(e.mode, t, r), xo(r, e.mode);
}
function zd(e, t, r) {
  return Xd(e) && Kd(r, e), Jd(t, r);
}
function Xd(e) {
  return (e & 128) === 0;
}
function Kd(e, t) {
  return xo(e, t | 128);
}
function xo(e, t) {
  return Se.chmodSync(e, t);
}
function Jd(e, t) {
  const r = Se.statSync(e);
  return Hd(t, r.atime, r.mtime);
}
function Qd(e, t, r, n, i) {
  return t ? Wl(r, n, i) : Zd(e.mode, r, n, i);
}
function Zd(e, t, r, n) {
  return Se.mkdirSync(r), Wl(t, r, n), xo(r, e);
}
function Wl(e, t, r) {
  Se.readdirSync(e).forEach((n) => eh(n, e, t, r));
}
function eh(e, t, r, n) {
  const i = xr.join(t, e), o = xr.join(r, e), { destStat: a } = Lr.checkPathsSync(i, o, "copy", n);
  return Vd(a, i, o, n);
}
function th(e, t, r, n) {
  let i = Se.readlinkSync(t);
  if (n.dereference && (i = xr.resolve(process.cwd(), i)), e) {
    let o;
    try {
      o = Se.readlinkSync(r);
    } catch (a) {
      if (a.code === "EINVAL" || a.code === "UNKNOWN") return Se.symlinkSync(i, r);
      throw a;
    }
    if (n.dereference && (o = xr.resolve(process.cwd(), o)), Lr.isSrcSubdir(i, o))
      throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${o}'.`);
    if (Se.statSync(r).isDirectory() && Lr.isSrcSubdir(o, i))
      throw new Error(`Cannot overwrite '${o}' with '${i}'.`);
    return rh(i, r);
  } else
    return Se.symlinkSync(i, r);
}
function rh(e, t) {
  return Se.unlinkSync(t), Se.symlinkSync(e, t);
}
var nh = qd;
const ih = Oe.fromCallback;
var Lo = {
  copy: ih(Bd),
  copySync: nh
};
const La = Ie, Yl = Y, J = $l, Ur = process.platform === "win32";
function zl(e) {
  [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((r) => {
    e[r] = e[r] || La[r], r = r + "Sync", e[r] = e[r] || La[r];
  }), e.maxBusyTries = e.maxBusyTries || 3;
}
function Uo(e, t, r) {
  let n = 0;
  typeof t == "function" && (r = t, t = {}), J(e, "rimraf: missing path"), J.strictEqual(typeof e, "string", "rimraf: path should be a string"), J.strictEqual(typeof r, "function", "rimraf: callback function required"), J(t, "rimraf: invalid options argument provided"), J.strictEqual(typeof t, "object", "rimraf: options should be object"), zl(t), Ua(e, t, function i(o) {
    if (o) {
      if ((o.code === "EBUSY" || o.code === "ENOTEMPTY" || o.code === "EPERM") && n < t.maxBusyTries) {
        n++;
        const a = n * 100;
        return setTimeout(() => Ua(e, t, i), a);
      }
      o.code === "ENOENT" && (o = null);
    }
    r(o);
  });
}
function Ua(e, t, r) {
  J(e), J(t), J(typeof r == "function"), t.lstat(e, (n, i) => {
    if (n && n.code === "ENOENT")
      return r(null);
    if (n && n.code === "EPERM" && Ur)
      return ka(e, t, n, r);
    if (i && i.isDirectory())
      return xn(e, t, n, r);
    t.unlink(e, (o) => {
      if (o) {
        if (o.code === "ENOENT")
          return r(null);
        if (o.code === "EPERM")
          return Ur ? ka(e, t, o, r) : xn(e, t, o, r);
        if (o.code === "EISDIR")
          return xn(e, t, o, r);
      }
      return r(o);
    });
  });
}
function ka(e, t, r, n) {
  J(e), J(t), J(typeof n == "function"), t.chmod(e, 438, (i) => {
    i ? n(i.code === "ENOENT" ? null : r) : t.stat(e, (o, a) => {
      o ? n(o.code === "ENOENT" ? null : r) : a.isDirectory() ? xn(e, t, r, n) : t.unlink(e, n);
    });
  });
}
function Ma(e, t, r) {
  let n;
  J(e), J(t);
  try {
    t.chmodSync(e, 438);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  try {
    n = t.statSync(e);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  n.isDirectory() ? Ln(e, t, r) : t.unlinkSync(e);
}
function xn(e, t, r, n) {
  J(e), J(t), J(typeof n == "function"), t.rmdir(e, (i) => {
    i && (i.code === "ENOTEMPTY" || i.code === "EEXIST" || i.code === "EPERM") ? oh(e, t, n) : i && i.code === "ENOTDIR" ? n(r) : n(i);
  });
}
function oh(e, t, r) {
  J(e), J(t), J(typeof r == "function"), t.readdir(e, (n, i) => {
    if (n) return r(n);
    let o = i.length, a;
    if (o === 0) return t.rmdir(e, r);
    i.forEach((s) => {
      Uo(Yl.join(e, s), t, (l) => {
        if (!a) {
          if (l) return r(a = l);
          --o === 0 && t.rmdir(e, r);
        }
      });
    });
  });
}
function Xl(e, t) {
  let r;
  t = t || {}, zl(t), J(e, "rimraf: missing path"), J.strictEqual(typeof e, "string", "rimraf: path should be a string"), J(t, "rimraf: missing options"), J.strictEqual(typeof t, "object", "rimraf: options should be object");
  try {
    r = t.lstatSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    n.code === "EPERM" && Ur && Ma(e, t, n);
  }
  try {
    r && r.isDirectory() ? Ln(e, t, null) : t.unlinkSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    if (n.code === "EPERM")
      return Ur ? Ma(e, t, n) : Ln(e, t, n);
    if (n.code !== "EISDIR")
      throw n;
    Ln(e, t, n);
  }
}
function Ln(e, t, r) {
  J(e), J(t);
  try {
    t.rmdirSync(e);
  } catch (n) {
    if (n.code === "ENOTDIR")
      throw r;
    if (n.code === "ENOTEMPTY" || n.code === "EEXIST" || n.code === "EPERM")
      ah(e, t);
    else if (n.code !== "ENOENT")
      throw n;
  }
}
function ah(e, t) {
  if (J(e), J(t), t.readdirSync(e).forEach((r) => Xl(Yl.join(e, r), t)), Ur) {
    const r = Date.now();
    do
      try {
        return t.rmdirSync(e, t);
      } catch {
      }
    while (Date.now() - r < 500);
  } else
    return t.rmdirSync(e, t);
}
var sh = Uo;
Uo.sync = Xl;
const Bn = Ie, lh = Oe.fromCallback, Kl = sh;
function ch(e, t) {
  if (Bn.rm) return Bn.rm(e, { recursive: !0, force: !0 }, t);
  Kl(e, t);
}
function uh(e) {
  if (Bn.rmSync) return Bn.rmSync(e, { recursive: !0, force: !0 });
  Kl.sync(e);
}
var Zn = {
  remove: lh(ch),
  removeSync: uh
};
const fh = Oe.fromPromise, Jl = Bt, Ql = Y, Zl = tt, ec = Zn, Ba = fh(async function(t) {
  let r;
  try {
    r = await Jl.readdir(t);
  } catch {
    return Zl.mkdirs(t);
  }
  return Promise.all(r.map((n) => ec.remove(Ql.join(t, n))));
});
function ja(e) {
  let t;
  try {
    t = Jl.readdirSync(e);
  } catch {
    return Zl.mkdirsSync(e);
  }
  t.forEach((r) => {
    r = Ql.join(e, r), ec.removeSync(r);
  });
}
var dh = {
  emptyDirSync: ja,
  emptydirSync: ja,
  emptyDir: Ba,
  emptydir: Ba
};
const hh = Oe.fromCallback, tc = Y, pt = Ie, rc = tt;
function ph(e, t) {
  function r() {
    pt.writeFile(e, "", (n) => {
      if (n) return t(n);
      t();
    });
  }
  pt.stat(e, (n, i) => {
    if (!n && i.isFile()) return t();
    const o = tc.dirname(e);
    pt.stat(o, (a, s) => {
      if (a)
        return a.code === "ENOENT" ? rc.mkdirs(o, (l) => {
          if (l) return t(l);
          r();
        }) : t(a);
      s.isDirectory() ? r() : pt.readdir(o, (l) => {
        if (l) return t(l);
      });
    });
  });
}
function mh(e) {
  let t;
  try {
    t = pt.statSync(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const r = tc.dirname(e);
  try {
    pt.statSync(r).isDirectory() || pt.readdirSync(r);
  } catch (n) {
    if (n && n.code === "ENOENT") rc.mkdirsSync(r);
    else throw n;
  }
  pt.writeFileSync(e, "");
}
var gh = {
  createFile: hh(ph),
  createFileSync: mh
};
const Eh = Oe.fromCallback, nc = Y, ht = Ie, ic = tt, yh = jt.pathExists, { areIdentical: oc } = dr;
function vh(e, t, r) {
  function n(i, o) {
    ht.link(i, o, (a) => {
      if (a) return r(a);
      r(null);
    });
  }
  ht.lstat(t, (i, o) => {
    ht.lstat(e, (a, s) => {
      if (a)
        return a.message = a.message.replace("lstat", "ensureLink"), r(a);
      if (o && oc(s, o)) return r(null);
      const l = nc.dirname(t);
      yh(l, (h, c) => {
        if (h) return r(h);
        if (c) return n(e, t);
        ic.mkdirs(l, (f) => {
          if (f) return r(f);
          n(e, t);
        });
      });
    });
  });
}
function wh(e, t) {
  let r;
  try {
    r = ht.lstatSync(t);
  } catch {
  }
  try {
    const o = ht.lstatSync(e);
    if (r && oc(o, r)) return;
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  const n = nc.dirname(t);
  return ht.existsSync(n) || ic.mkdirsSync(n), ht.linkSync(e, t);
}
var _h = {
  createLink: Eh(vh),
  createLinkSync: wh
};
const mt = Y, Or = Ie, Ah = jt.pathExists;
function Th(e, t, r) {
  if (mt.isAbsolute(e))
    return Or.lstat(e, (n) => n ? (n.message = n.message.replace("lstat", "ensureSymlink"), r(n)) : r(null, {
      toCwd: e,
      toDst: e
    }));
  {
    const n = mt.dirname(t), i = mt.join(n, e);
    return Ah(i, (o, a) => o ? r(o) : a ? r(null, {
      toCwd: i,
      toDst: e
    }) : Or.lstat(e, (s) => s ? (s.message = s.message.replace("lstat", "ensureSymlink"), r(s)) : r(null, {
      toCwd: e,
      toDst: mt.relative(n, e)
    })));
  }
}
function Sh(e, t) {
  let r;
  if (mt.isAbsolute(e)) {
    if (r = Or.existsSync(e), !r) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  } else {
    const n = mt.dirname(t), i = mt.join(n, e);
    if (r = Or.existsSync(i), r)
      return {
        toCwd: i,
        toDst: e
      };
    if (r = Or.existsSync(e), !r) throw new Error("relative srcpath does not exist");
    return {
      toCwd: e,
      toDst: mt.relative(n, e)
    };
  }
}
var Ch = {
  symlinkPaths: Th,
  symlinkPathsSync: Sh
};
const ac = Ie;
function bh(e, t, r) {
  if (r = typeof t == "function" ? t : r, t = typeof t == "function" ? !1 : t, t) return r(null, t);
  ac.lstat(e, (n, i) => {
    if (n) return r(null, "file");
    t = i && i.isDirectory() ? "dir" : "file", r(null, t);
  });
}
function $h(e, t) {
  let r;
  if (t) return t;
  try {
    r = ac.lstatSync(e);
  } catch {
    return "file";
  }
  return r && r.isDirectory() ? "dir" : "file";
}
var Rh = {
  symlinkType: bh,
  symlinkTypeSync: $h
};
const Oh = Oe.fromCallback, sc = Y, Ve = Bt, lc = tt, Ih = lc.mkdirs, Ph = lc.mkdirsSync, cc = Ch, Nh = cc.symlinkPaths, Dh = cc.symlinkPathsSync, uc = Rh, Fh = uc.symlinkType, xh = uc.symlinkTypeSync, Lh = jt.pathExists, { areIdentical: fc } = dr;
function Uh(e, t, r, n) {
  n = typeof r == "function" ? r : n, r = typeof r == "function" ? !1 : r, Ve.lstat(t, (i, o) => {
    !i && o.isSymbolicLink() ? Promise.all([
      Ve.stat(e),
      Ve.stat(t)
    ]).then(([a, s]) => {
      if (fc(a, s)) return n(null);
      Ha(e, t, r, n);
    }) : Ha(e, t, r, n);
  });
}
function Ha(e, t, r, n) {
  Nh(e, t, (i, o) => {
    if (i) return n(i);
    e = o.toDst, Fh(o.toCwd, r, (a, s) => {
      if (a) return n(a);
      const l = sc.dirname(t);
      Lh(l, (h, c) => {
        if (h) return n(h);
        if (c) return Ve.symlink(e, t, s, n);
        Ih(l, (f) => {
          if (f) return n(f);
          Ve.symlink(e, t, s, n);
        });
      });
    });
  });
}
function kh(e, t, r) {
  let n;
  try {
    n = Ve.lstatSync(t);
  } catch {
  }
  if (n && n.isSymbolicLink()) {
    const s = Ve.statSync(e), l = Ve.statSync(t);
    if (fc(s, l)) return;
  }
  const i = Dh(e, t);
  e = i.toDst, r = xh(i.toCwd, r);
  const o = sc.dirname(t);
  return Ve.existsSync(o) || Ph(o), Ve.symlinkSync(e, t, r);
}
var Mh = {
  createSymlink: Oh(Uh),
  createSymlinkSync: kh
};
const { createFile: qa, createFileSync: Ga } = gh, { createLink: Va, createLinkSync: Wa } = _h, { createSymlink: Ya, createSymlinkSync: za } = Mh;
var Bh = {
  // file
  createFile: qa,
  createFileSync: Ga,
  ensureFile: qa,
  ensureFileSync: Ga,
  // link
  createLink: Va,
  createLinkSync: Wa,
  ensureLink: Va,
  ensureLinkSync: Wa,
  // symlink
  createSymlink: Ya,
  createSymlinkSync: za,
  ensureSymlink: Ya,
  ensureSymlinkSync: za
};
function jh(e, { EOL: t = `
`, finalEOL: r = !0, replacer: n = null, spaces: i } = {}) {
  const o = r ? t : "", a = JSON.stringify(e, n, i);
  if (a === void 0)
    throw new TypeError(`Converting ${typeof e} value to JSON is not supported`);
  return a.replace(/\n/g, t) + o;
}
function Hh(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var ko = { stringify: jh, stripBom: Hh };
let cr;
try {
  cr = Ie;
} catch {
  cr = We;
}
const ei = Oe, { stringify: dc, stripBom: hc } = ko;
async function qh(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || cr, n = "throws" in t ? t.throws : !0;
  let i = await ei.fromCallback(r.readFile)(e, t);
  i = hc(i);
  let o;
  try {
    o = JSON.parse(i, t ? t.reviver : null);
  } catch (a) {
    if (n)
      throw a.message = `${e}: ${a.message}`, a;
    return null;
  }
  return o;
}
const Gh = ei.fromPromise(qh);
function Vh(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || cr, n = "throws" in t ? t.throws : !0;
  try {
    let i = r.readFileSync(e, t);
    return i = hc(i), JSON.parse(i, t.reviver);
  } catch (i) {
    if (n)
      throw i.message = `${e}: ${i.message}`, i;
    return null;
  }
}
async function Wh(e, t, r = {}) {
  const n = r.fs || cr, i = dc(t, r);
  await ei.fromCallback(n.writeFile)(e, i, r);
}
const Yh = ei.fromPromise(Wh);
function zh(e, t, r = {}) {
  const n = r.fs || cr, i = dc(t, r);
  return n.writeFileSync(e, i, r);
}
var Xh = {
  readFile: Gh,
  readFileSync: Vh,
  writeFile: Yh,
  writeFileSync: zh
};
const vn = Xh;
var Kh = {
  // jsonfile exports
  readJson: vn.readFile,
  readJsonSync: vn.readFileSync,
  writeJson: vn.writeFile,
  writeJsonSync: vn.writeFileSync
};
const Jh = Oe.fromCallback, Ir = Ie, pc = Y, mc = tt, Qh = jt.pathExists;
function Zh(e, t, r, n) {
  typeof r == "function" && (n = r, r = "utf8");
  const i = pc.dirname(e);
  Qh(i, (o, a) => {
    if (o) return n(o);
    if (a) return Ir.writeFile(e, t, r, n);
    mc.mkdirs(i, (s) => {
      if (s) return n(s);
      Ir.writeFile(e, t, r, n);
    });
  });
}
function ep(e, ...t) {
  const r = pc.dirname(e);
  if (Ir.existsSync(r))
    return Ir.writeFileSync(e, ...t);
  mc.mkdirsSync(r), Ir.writeFileSync(e, ...t);
}
var Mo = {
  outputFile: Jh(Zh),
  outputFileSync: ep
};
const { stringify: tp } = ko, { outputFile: rp } = Mo;
async function np(e, t, r = {}) {
  const n = tp(t, r);
  await rp(e, n, r);
}
var ip = np;
const { stringify: op } = ko, { outputFileSync: ap } = Mo;
function sp(e, t, r) {
  const n = op(t, r);
  ap(e, n, r);
}
var lp = sp;
const cp = Oe.fromPromise, Re = Kh;
Re.outputJson = cp(ip);
Re.outputJsonSync = lp;
Re.outputJSON = Re.outputJson;
Re.outputJSONSync = Re.outputJsonSync;
Re.writeJSON = Re.writeJson;
Re.writeJSONSync = Re.writeJsonSync;
Re.readJSON = Re.readJson;
Re.readJSONSync = Re.readJsonSync;
var up = Re;
const fp = Ie, uo = Y, dp = Lo.copy, gc = Zn.remove, hp = tt.mkdirp, pp = jt.pathExists, Xa = dr;
function mp(e, t, r, n) {
  typeof r == "function" && (n = r, r = {}), r = r || {};
  const i = r.overwrite || r.clobber || !1;
  Xa.checkPaths(e, t, "move", r, (o, a) => {
    if (o) return n(o);
    const { srcStat: s, isChangingCase: l = !1 } = a;
    Xa.checkParentPaths(e, s, t, "move", (h) => {
      if (h) return n(h);
      if (gp(t)) return Ka(e, t, i, l, n);
      hp(uo.dirname(t), (c) => c ? n(c) : Ka(e, t, i, l, n));
    });
  });
}
function gp(e) {
  const t = uo.dirname(e);
  return uo.parse(t).root === t;
}
function Ka(e, t, r, n, i) {
  if (n) return Ii(e, t, r, i);
  if (r)
    return gc(t, (o) => o ? i(o) : Ii(e, t, r, i));
  pp(t, (o, a) => o ? i(o) : a ? i(new Error("dest already exists.")) : Ii(e, t, r, i));
}
function Ii(e, t, r, n) {
  fp.rename(e, t, (i) => i ? i.code !== "EXDEV" ? n(i) : Ep(e, t, r, n) : n());
}
function Ep(e, t, r, n) {
  dp(e, t, {
    overwrite: r,
    errorOnExist: !0
  }, (o) => o ? n(o) : gc(e, n));
}
var yp = mp;
const Ec = Ie, fo = Y, vp = Lo.copySync, yc = Zn.removeSync, wp = tt.mkdirpSync, Ja = dr;
function _p(e, t, r) {
  r = r || {};
  const n = r.overwrite || r.clobber || !1, { srcStat: i, isChangingCase: o = !1 } = Ja.checkPathsSync(e, t, "move", r);
  return Ja.checkParentPathsSync(e, i, t, "move"), Ap(t) || wp(fo.dirname(t)), Tp(e, t, n, o);
}
function Ap(e) {
  const t = fo.dirname(e);
  return fo.parse(t).root === t;
}
function Tp(e, t, r, n) {
  if (n) return Pi(e, t, r);
  if (r)
    return yc(t), Pi(e, t, r);
  if (Ec.existsSync(t)) throw new Error("dest already exists.");
  return Pi(e, t, r);
}
function Pi(e, t, r) {
  try {
    Ec.renameSync(e, t);
  } catch (n) {
    if (n.code !== "EXDEV") throw n;
    return Sp(e, t, r);
  }
}
function Sp(e, t, r) {
  return vp(e, t, {
    overwrite: r,
    errorOnExist: !0
  }), yc(e);
}
var Cp = _p;
const bp = Oe.fromCallback;
var $p = {
  move: bp(yp),
  moveSync: Cp
}, St = {
  // Export promiseified graceful-fs:
  ...Bt,
  // Export extra methods:
  ...Lo,
  ...dh,
  ...Bh,
  ...up,
  ...tt,
  ...$p,
  ...Mo,
  ...jt,
  ...Zn
}, Ht = {}, Et = {}, he = {}, yt = {};
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.CancellationError = yt.CancellationToken = void 0;
const Rp = Rl;
class Op extends Rp.EventEmitter {
  get cancelled() {
    return this._cancelled || this._parent != null && this._parent.cancelled;
  }
  set parent(t) {
    this.removeParentCancelHandler(), this._parent = t, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
  }
  // babel cannot compile ... correctly for super calls
  constructor(t) {
    super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, t != null && (this.parent = t);
  }
  cancel() {
    this._cancelled = !0, this.emit("cancel");
  }
  onCancel(t) {
    this.cancelled ? t() : this.once("cancel", t);
  }
  createPromise(t) {
    if (this.cancelled)
      return Promise.reject(new ho());
    const r = () => {
      if (n != null)
        try {
          this.removeListener("cancel", n), n = null;
        } catch {
        }
    };
    let n = null;
    return new Promise((i, o) => {
      let a = null;
      if (n = () => {
        try {
          a != null && (a(), a = null);
        } finally {
          o(new ho());
        }
      }, this.cancelled) {
        n();
        return;
      }
      this.onCancel(n), t(i, o, (s) => {
        a = s;
      });
    }).then((i) => (r(), i)).catch((i) => {
      throw r(), i;
    });
  }
  removeParentCancelHandler() {
    const t = this._parent;
    t != null && this.parentCancelHandler != null && (t.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
  }
  dispose() {
    try {
      this.removeParentCancelHandler();
    } finally {
      this.removeAllListeners(), this._parent = null;
    }
  }
}
yt.CancellationToken = Op;
class ho extends Error {
  constructor() {
    super("cancelled");
  }
}
yt.CancellationError = ho;
var hr = {};
Object.defineProperty(hr, "__esModule", { value: !0 });
hr.newError = Ip;
function Ip(e, t) {
  const r = new Error(e);
  return r.code = t, r;
}
var de = {}, po = { exports: {} }, wn = { exports: {} }, Ni, Qa;
function Pp() {
  if (Qa) return Ni;
  Qa = 1;
  var e = 1e3, t = e * 60, r = t * 60, n = r * 24, i = n * 7, o = n * 365.25;
  Ni = function(c, f) {
    f = f || {};
    var g = typeof c;
    if (g === "string" && c.length > 0)
      return a(c);
    if (g === "number" && isFinite(c))
      return f.long ? l(c) : s(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function a(c) {
    if (c = String(c), !(c.length > 100)) {
      var f = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (f) {
        var g = parseFloat(f[1]), m = (f[2] || "ms").toLowerCase();
        switch (m) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return g * o;
          case "weeks":
          case "week":
          case "w":
            return g * i;
          case "days":
          case "day":
          case "d":
            return g * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return g * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return g * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return g * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return g;
          default:
            return;
        }
      }
    }
  }
  function s(c) {
    var f = Math.abs(c);
    return f >= n ? Math.round(c / n) + "d" : f >= r ? Math.round(c / r) + "h" : f >= t ? Math.round(c / t) + "m" : f >= e ? Math.round(c / e) + "s" : c + "ms";
  }
  function l(c) {
    var f = Math.abs(c);
    return f >= n ? h(c, f, n, "day") : f >= r ? h(c, f, r, "hour") : f >= t ? h(c, f, t, "minute") : f >= e ? h(c, f, e, "second") : c + " ms";
  }
  function h(c, f, g, m) {
    var v = f >= g * 1.5;
    return Math.round(c / g) + " " + m + (v ? "s" : "");
  }
  return Ni;
}
var Di, Za;
function vc() {
  if (Za) return Di;
  Za = 1;
  function e(t) {
    n.debug = n, n.default = n, n.coerce = h, n.disable = s, n.enable = o, n.enabled = l, n.humanize = Pp(), n.destroy = c, Object.keys(t).forEach((f) => {
      n[f] = t[f];
    }), n.names = [], n.skips = [], n.formatters = {};
    function r(f) {
      let g = 0;
      for (let m = 0; m < f.length; m++)
        g = (g << 5) - g + f.charCodeAt(m), g |= 0;
      return n.colors[Math.abs(g) % n.colors.length];
    }
    n.selectColor = r;
    function n(f) {
      let g, m = null, v, E;
      function A(...T) {
        if (!A.enabled)
          return;
        const C = A, D = Number(/* @__PURE__ */ new Date()), B = D - (g || D);
        C.diff = B, C.prev = g, C.curr = D, g = D, T[0] = n.coerce(T[0]), typeof T[0] != "string" && T.unshift("%O");
        let G = 0;
        T[0] = T[0].replace(/%([a-zA-Z%])/g, (ee, ae) => {
          if (ee === "%%")
            return "%";
          G++;
          const U = n.formatters[ae];
          if (typeof U == "function") {
            const y = T[G];
            ee = U.call(C, y), T.splice(G, 1), G--;
          }
          return ee;
        }), n.formatArgs.call(C, T), (C.log || n.log).apply(C, T);
      }
      return A.namespace = f, A.useColors = n.useColors(), A.color = n.selectColor(f), A.extend = i, A.destroy = n.destroy, Object.defineProperty(A, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => m !== null ? m : (v !== n.namespaces && (v = n.namespaces, E = n.enabled(f)), E),
        set: (T) => {
          m = T;
        }
      }), typeof n.init == "function" && n.init(A), A;
    }
    function i(f, g) {
      const m = n(this.namespace + (typeof g > "u" ? ":" : g) + f);
      return m.log = this.log, m;
    }
    function o(f) {
      n.save(f), n.namespaces = f, n.names = [], n.skips = [];
      const g = (typeof f == "string" ? f : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const m of g)
        m[0] === "-" ? n.skips.push(m.slice(1)) : n.names.push(m);
    }
    function a(f, g) {
      let m = 0, v = 0, E = -1, A = 0;
      for (; m < f.length; )
        if (v < g.length && (g[v] === f[m] || g[v] === "*"))
          g[v] === "*" ? (E = v, A = m, v++) : (m++, v++);
        else if (E !== -1)
          v = E + 1, A++, m = A;
        else
          return !1;
      for (; v < g.length && g[v] === "*"; )
        v++;
      return v === g.length;
    }
    function s() {
      const f = [
        ...n.names,
        ...n.skips.map((g) => "-" + g)
      ].join(",");
      return n.enable(""), f;
    }
    function l(f) {
      for (const g of n.skips)
        if (a(f, g))
          return !1;
      for (const g of n.names)
        if (a(f, g))
          return !0;
      return !1;
    }
    function h(f) {
      return f instanceof Error ? f.stack || f.message : f;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return n.enable(n.load()), n;
  }
  return Di = e, Di;
}
var es;
function Np() {
  return es || (es = 1, function(e, t) {
    t.formatArgs = n, t.save = i, t.load = o, t.useColors = r, t.storage = a(), t.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function r() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function n(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const h = "color: " + this.color;
      l.splice(1, 0, h, "color: inherit");
      let c = 0, f = 0;
      l[0].replace(/%[a-zA-Z%]/g, (g) => {
        g !== "%%" && (c++, g === "%c" && (f = c));
      }), l.splice(f, 0, h);
    }
    t.log = console.debug || console.log || (() => {
    });
    function i(l) {
      try {
        l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function o() {
      let l;
      try {
        l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function a() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = vc()(t);
    const { formatters: s } = e.exports;
    s.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (h) {
        return "[UnexpectedJSONParseError]: " + h.message;
      }
    };
  }(wn, wn.exports)), wn.exports;
}
var _n = { exports: {} }, Fi, ts;
function Dp() {
  return ts || (ts = 1, Fi = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(r + e), i = t.indexOf("--");
    return n !== -1 && (i === -1 || n < i);
  }), Fi;
}
var xi, rs;
function Fp() {
  if (rs) return xi;
  rs = 1;
  const e = Kn, t = Ol, r = Dp(), { env: n } = process;
  let i;
  r("no-color") || r("no-colors") || r("color=false") || r("color=never") ? i = 0 : (r("color") || r("colors") || r("color=true") || r("color=always")) && (i = 1), "FORCE_COLOR" in n && (n.FORCE_COLOR === "true" ? i = 1 : n.FORCE_COLOR === "false" ? i = 0 : i = n.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(n.FORCE_COLOR, 10), 3));
  function o(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function a(l, h) {
    if (i === 0)
      return 0;
    if (r("color=16m") || r("color=full") || r("color=truecolor"))
      return 3;
    if (r("color=256"))
      return 2;
    if (l && !h && i === void 0)
      return 0;
    const c = i || 0;
    if (n.TERM === "dumb")
      return c;
    if (process.platform === "win32") {
      const f = e.release().split(".");
      return Number(f[0]) >= 10 && Number(f[2]) >= 10586 ? Number(f[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in n)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((f) => f in n) || n.CI_NAME === "codeship" ? 1 : c;
    if ("TEAMCITY_VERSION" in n)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(n.TEAMCITY_VERSION) ? 1 : 0;
    if (n.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in n) {
      const f = parseInt((n.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (n.TERM_PROGRAM) {
        case "iTerm.app":
          return f >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(n.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM) || "COLORTERM" in n ? 1 : c;
  }
  function s(l) {
    const h = a(l, l && l.isTTY);
    return o(h);
  }
  return xi = {
    supportsColor: s,
    stdout: o(a(!0, t.isatty(1))),
    stderr: o(a(!0, t.isatty(2)))
  }, xi;
}
var ns;
function xp() {
  return ns || (ns = 1, function(e, t) {
    const r = Ol, n = Io;
    t.init = c, t.log = s, t.formatArgs = o, t.save = l, t.load = h, t.useColors = i, t.destroy = n.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const g = Fp();
      g && (g.stderr || g).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((g) => /^debug_/i.test(g)).reduce((g, m) => {
      const v = m.substring(6).toLowerCase().replace(/_([a-z])/g, (A, T) => T.toUpperCase());
      let E = process.env[m];
      return /^(yes|on|true|enabled)$/i.test(E) ? E = !0 : /^(no|off|false|disabled)$/i.test(E) ? E = !1 : E === "null" ? E = null : E = Number(E), g[v] = E, g;
    }, {});
    function i() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : r.isatty(process.stderr.fd);
    }
    function o(g) {
      const { namespace: m, useColors: v } = this;
      if (v) {
        const E = this.color, A = "\x1B[3" + (E < 8 ? E : "8;5;" + E), T = `  ${A};1m${m} \x1B[0m`;
        g[0] = T + g[0].split(`
`).join(`
` + T), g.push(A + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        g[0] = a() + m + " " + g[0];
    }
    function a() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function s(...g) {
      return process.stderr.write(n.formatWithOptions(t.inspectOpts, ...g) + `
`);
    }
    function l(g) {
      g ? process.env.DEBUG = g : delete process.env.DEBUG;
    }
    function h() {
      return process.env.DEBUG;
    }
    function c(g) {
      g.inspectOpts = {};
      const m = Object.keys(t.inspectOpts);
      for (let v = 0; v < m.length; v++)
        g.inspectOpts[m[v]] = t.inspectOpts[m[v]];
    }
    e.exports = vc()(t);
    const { formatters: f } = e.exports;
    f.o = function(g) {
      return this.inspectOpts.colors = this.useColors, n.inspect(g, this.inspectOpts).split(`
`).map((m) => m.trim()).join(" ");
    }, f.O = function(g) {
      return this.inspectOpts.colors = this.useColors, n.inspect(g, this.inspectOpts);
    };
  }(_n, _n.exports)), _n.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? po.exports = Np() : po.exports = xp();
var Lp = po.exports, Jr = {};
Object.defineProperty(Jr, "__esModule", { value: !0 });
Jr.ProgressCallbackTransform = void 0;
const Up = zr;
class kp extends Up.Transform {
  constructor(t, r, n) {
    super(), this.total = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.total * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), n(null, t);
  }
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.total,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, t(null);
  }
}
Jr.ProgressCallbackTransform = kp;
Object.defineProperty(de, "__esModule", { value: !0 });
de.DigestTransform = de.HttpExecutor = de.HttpError = void 0;
de.addSensitiveRedirectHeader = Vp;
de.addSensitiveFieldPattern = Wp;
de.createHttpError = go;
de.parseJson = zp;
de.configureRequestOptionsFromUrl = Sc;
de.configureRequestUrl = Ho;
de.safeGetHeader = sr;
de.configureRequestOptions = jn;
de.isSensitiveFieldName = Cc;
de.hashSensitiveValue = bc;
de.safeStringifyJson = tr;
const wc = Xr, Mp = Lp, Bp = We, jp = zr, mo = Tt, Hp = yt, is = hr, qp = Jr, ft = (0, Mp.default)("electron-builder"), Bo = (e) => e.toLowerCase().replace(/[-_]/g, ""), _c = /* @__PURE__ */ new Set(["authorization", "proxyauthorization", "privatetoken", "xapikey", "xauthtoken", "xaccesstoken", "xgitlabtoken", "cookie", "xcsrftoken"]), Ac = ["token", "password", "secret", "authorization", "credential", "apikey", "passphrase", "auth"], Gp = ["key"];
function Vp(e) {
  _c.add(Bo(e));
}
function Wp(e) {
  Ac.push(e.toLowerCase().replace(/[-_]/g, ""));
}
function go(e, t = null) {
  return new jo(e.statusCode || -1, `${e.statusCode} ${e.statusMessage}` + (t == null ? "" : `
` + JSON.stringify(t, null, "  ")) + `
Headers: ` + tr(e.headers), t);
}
const Yp = /* @__PURE__ */ new Map([
  [429, "Too many requests"],
  [400, "Bad request"],
  [403, "Forbidden"],
  [404, "Not found"],
  [405, "Method not allowed"],
  [406, "Not acceptable"],
  [408, "Request timeout"],
  [413, "Request entity too large"],
  [500, "Internal server error"],
  [502, "Bad gateway"],
  [503, "Service unavailable"],
  [504, "Gateway timeout"],
  [505, "HTTP version not supported"]
]);
class jo extends Error {
  constructor(t, r = `HTTP error: ${Yp.get(t) || t}`, n = null) {
    super(r), this.statusCode = t, this.description = n, this.name = "HttpError", this.code = `HTTP_ERROR_${t}`;
  }
  isServerError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
}
de.HttpError = jo;
function zp(e) {
  return e.then((t) => t == null || t.length === 0 ? null : JSON.parse(t));
}
class er {
  constructor() {
    this.maxRedirects = 10;
  }
  request(t, r = new Hp.CancellationToken(), n) {
    jn(t);
    const i = n == null ? void 0 : JSON.stringify(n), o = i ? Buffer.from(i) : void 0;
    if (o != null) {
      ft.enabled && ft(tr(n));
      const { headers: a, ...s } = t;
      t = {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": o.length,
          ...a
        },
        ...s
      };
    }
    return this.doApiRequest(t, r, (a) => a.end(o));
  }
  doApiRequest(t, r, n, i = 0) {
    if (ft.enabled) {
      const { headers: o, auth: a, ...s } = t;
      ft(`Request: ${tr(s)}`);
    }
    return r.createPromise((o, a, s) => {
      const l = this.createRequest(t, (h) => {
        try {
          this.handleResponse(h, t, r, o, a, i, n);
        } catch (c) {
          a(c);
        }
      });
      this.addErrorAndTimeoutHandlers(l, a, t.timeout), this.addRedirectHandlers(l, t, a, i, (h) => {
        this.doApiRequest(h, r, n, i).then(o).catch(a);
      }), n(l, a), s(() => l.abort());
    });
  }
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line
  addRedirectHandlers(t, r, n, i, o) {
  }
  addErrorAndTimeoutHandlers(t, r, n = 60 * 1e3) {
    this.addTimeOutHandler(t, r, n), t.on("error", r), t.on("aborted", () => {
      r(new Error("Request has been aborted by the server"));
    });
  }
  handleResponse(t, r, n, i, o, a, s) {
    var l;
    if (ft.enabled) {
      const { headers: m, auth: v, ...E } = r;
      ft(`Response: ${t.statusCode} ${t.statusMessage}, request options: ${tr(E)}`);
    }
    if (t.statusCode === 404) {
      o(go(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
      return;
    } else if (t.statusCode === 204) {
      i();
      return;
    }
    const h = (l = t.statusCode) !== null && l !== void 0 ? l : 0, c = h >= 300 && h < 400, f = sr(t, "location");
    if (c && f != null) {
      if (a > this.maxRedirects) {
        o(this.createMaxRedirectError());
        return;
      }
      this.doApiRequest(er.prepareRedirectUrlOptions(f, r), n, s, a).then(i).catch(o);
      return;
    }
    t.setEncoding("utf8");
    let g = "";
    t.on("error", o), t.on("data", (m) => g += m), t.on("end", () => {
      try {
        if (t.statusCode != null && t.statusCode >= 400) {
          const m = sr(t, "content-type"), v = m != null && (Array.isArray(m) ? m.find((E) => E.includes("json")) != null : m.includes("json"));
          o(go(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

          Data:
          ${v ? tr(JSON.parse(g)) : g}
          `));
        } else
          i(g.length === 0 ? null : g);
      } catch (m) {
        o(m);
      }
    });
  }
  async downloadToBuffer(t, r) {
    return await r.cancellationToken.createPromise((n, i, o) => {
      const a = [], s = {
        headers: r.headers || void 0,
        // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
        redirect: "manual"
      };
      Ho(t, s), jn(s), this.doDownload(s, {
        destination: null,
        options: r,
        onCancel: o,
        callback: (l) => {
          l == null ? n(Buffer.concat(a)) : i(l);
        },
        responseHandler: (l, h) => {
          let c = 0;
          l.on("data", (f) => {
            if (c += f.length, c > 524288e3) {
              h(new Error("Maximum allowed size is 500 MB"));
              return;
            }
            a.push(f);
          }), l.on("end", () => {
            h(null);
          });
        }
      }, 0);
    });
  }
  doDownload(t, r, n) {
    const i = this.createRequest(t, (o) => {
      if (o.statusCode >= 400) {
        r.callback(new Error(`Cannot download "${t.protocol || "https:"}//${t.hostname}${t.path}", status ${o.statusCode}: ${o.statusMessage}`));
        return;
      }
      o.on("error", r.callback);
      const a = sr(o, "location");
      if (a != null) {
        n < this.maxRedirects ? this.doDownload(er.prepareRedirectUrlOptions(a, t), r, n++) : r.callback(this.createMaxRedirectError());
        return;
      }
      r.responseHandler == null ? Kp(r, o) : r.responseHandler(o, r.callback);
    });
    this.addErrorAndTimeoutHandlers(i, r.callback, t.timeout), this.addRedirectHandlers(i, t, r.callback, n, (o) => {
      this.doDownload(o, r, n++);
    }), i.end();
  }
  createMaxRedirectError() {
    return new Error(`Too many redirects (> ${this.maxRedirects})`);
  }
  addTimeOutHandler(t, r, n) {
    t.on("socket", (i) => {
      i.setTimeout(n, () => {
        t.abort(), r(new Error("Request timed out"));
      });
    });
  }
  static prepareRedirectUrlOptions(t, r) {
    const n = Sc(t, { ...r }), i = n.headers;
    if (i == null)
      return n;
    const o = er.reconstructOriginalUrl(r), a = Tc(t, r);
    if (er.isCrossOriginRedirect(o, a)) {
      ft.enabled && ft(`Cross-origin redirect (${o.host} → ${a.host}): stripping sensitive headers`);
      for (const s of Object.keys(i))
        _c.has(Bo(s)) && delete i[s];
    }
    return n;
  }
  static reconstructOriginalUrl(t) {
    const r = t.protocol || "https:";
    if (!t.hostname)
      throw new Error("Missing hostname in request options");
    const n = t.hostname, i = t.port ? `:${t.port}` : "", o = t.path || "/";
    return new mo.URL(`${r}//${n}${i}${o}`);
  }
  static isCrossOriginRedirect(t, r) {
    if (t.hostname.toLowerCase() !== r.hostname.toLowerCase())
      return !0;
    if (t.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
    ["80", ""].includes(t.port) && r.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
    ["443", ""].includes(r.port))
      return !1;
    if (t.protocol !== r.protocol)
      return !0;
    const n = t.port, i = r.port;
    return n !== i;
  }
  static async retryOnServerError(t, r = 3) {
    for (let n = 0; ; n++)
      try {
        return await t();
      } catch (i) {
        if (n < r && (i instanceof jo && i.isServerError() || i.code === "EPIPE")) {
          await new Promise((o) => setTimeout(o, 1e3 * (n + 1)));
          continue;
        }
        throw i;
      }
  }
}
de.HttpExecutor = er;
function Tc(e, t) {
  try {
    return new mo.URL(e);
  } catch {
    const r = t.hostname, n = t.protocol || "https:", i = t.port ? `:${t.port}` : "", o = `${n}//${r}${i}`;
    return new mo.URL(e, o);
  }
}
function Sc(e, t) {
  const r = jn(t), n = Tc(e, t);
  return Ho(n, r), r;
}
function Ho(e, t) {
  t.protocol = e.protocol, t.hostname = e.hostname, e.port ? t.port = e.port : t.port && delete t.port, t.path = e.pathname + e.search;
}
class Eo extends jp.Transform {
  // noinspection JSUnusedGlobalSymbols
  get actual() {
    return this._actual;
  }
  constructor(t, r = "sha512", n = "base64") {
    super(), this.expected = t, this.algorithm = r, this.encoding = n, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, wc.createHash)(r);
  }
  // noinspection JSUnusedGlobalSymbols
  _transform(t, r, n) {
    this.digester.update(t), n(null, t);
  }
  // noinspection JSUnusedGlobalSymbols
  _flush(t) {
    if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
      try {
        this.validate();
      } catch (r) {
        t(r);
        return;
      }
    t(null);
  }
  validate() {
    if (this._actual == null)
      throw (0, is.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
    if (this._actual !== this.expected)
      throw (0, is.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
    return null;
  }
}
de.DigestTransform = Eo;
function Xp(e, t, r) {
  return e != null && t != null && e !== t ? (r(new Error(`checksum mismatch: expected ${t} but got ${e} (X-Checksum-Sha2 header)`)), !1) : !0;
}
function sr(e, t) {
  const r = e.headers[t];
  return r == null ? null : Array.isArray(r) ? r.length === 0 ? null : r[r.length - 1] : r;
}
function Kp(e, t) {
  if (!Xp(sr(t, "X-Checksum-Sha2"), e.options.sha2, e.callback))
    return;
  const r = [];
  if (e.options.onProgress != null) {
    const a = sr(t, "content-length");
    a != null && r.push(new qp.ProgressCallbackTransform(parseInt(a, 10), e.options.cancellationToken, e.options.onProgress));
  }
  const n = e.options.sha512;
  n != null ? r.push(new Eo(n, "sha512", n.length === 128 && !n.includes("+") && !n.includes("Z") && !n.includes("=") ? "hex" : "base64")) : e.options.sha2 != null && r.push(new Eo(e.options.sha2, "sha256", "hex"));
  const i = (0, Bp.createWriteStream)(e.destination);
  r.push(i);
  let o = t;
  for (const a of r)
    a.on("error", (s) => {
      i.close(), e.options.cancellationToken.cancelled || e.callback(s);
    }), o = o.pipe(a);
  i.on("finish", () => {
    i.close(e.callback);
  });
}
function jn(e, t, r) {
  r != null && (e.method = r), e.headers = { ...e.headers };
  const n = e.headers;
  return t != null && (n.authorization = t.startsWith("Basic") || t.startsWith("Bearer") ? t : `token ${t}`), n["User-Agent"] == null && (n["User-Agent"] = "electron-builder"), (r == null || r === "GET" || n["Cache-Control"] == null) && (n["Cache-Control"] = "no-cache"), e.protocol == null && process.versions.electron != null && (e.protocol = "https:"), e;
}
function Cc(e) {
  const t = Bo(e);
  return Ac.some((r) => t.includes(r)) || Gp.some((r) => t.endsWith(r));
}
function bc(e) {
  return `${(0, wc.createHash)("sha256").update(e).digest("hex")} (sha256 hash)`;
}
function tr(e, t) {
  return JSON.stringify(e, (r, n) => Cc(r) || t != null && t.has(r) ? typeof n == "string" ? bc(n) : "<stripped sensitive data>" : n, 2);
}
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
ti.MemoLazy = void 0;
class Jp {
  constructor(t, r) {
    this.selector = t, this.creator = r, this.selected = void 0, this._value = void 0;
  }
  get hasValue() {
    return this._value !== void 0;
  }
  get value() {
    const t = this.selector();
    if (this._value !== void 0 && $c(this.selected, t))
      return this._value;
    this.selected = t;
    const r = this.creator(t);
    return this.value = r, r;
  }
  set value(t) {
    this._value = t;
  }
}
ti.MemoLazy = Jp;
function $c(e, t) {
  if (typeof e == "object" && e !== null && (typeof t == "object" && t !== null)) {
    const i = Object.keys(e), o = Object.keys(t);
    return i.length === o.length && i.every((a) => $c(e[a], t[a]));
  }
  return e === t;
}
var Qr = {};
Object.defineProperty(Qr, "__esModule", { value: !0 });
Qr.githubUrl = Qp;
Qr.githubTagPrefix = Zp;
Qr.getS3LikeProviderBaseUrl = em;
function Qp(e, t = "github.com") {
  return `${e.protocol || "https"}://${e.host || t}`;
}
function Zp(e) {
  var t;
  return e.tagNamePrefix ? e.tagNamePrefix : !((t = e.vPrefixedTagName) !== null && t !== void 0) || t ? "v" : "";
}
function em(e) {
  const t = e.provider;
  if (t === "s3")
    return tm(e);
  if (t === "spaces")
    return rm(e);
  throw new Error(`Not supported provider: ${t}`);
}
function tm(e) {
  let t;
  if (e.accelerate == !0)
    t = `https://${e.bucket}.s3-accelerate.amazonaws.com`;
  else if (e.endpoint != null)
    t = `${e.endpoint}/${e.bucket}`;
  else if (e.bucket.includes(".")) {
    if (e.region == null)
      throw new Error(`Bucket name "${e.bucket}" includes a dot, but S3 region is missing`);
    e.region === "us-east-1" ? t = `https://s3.amazonaws.com/${e.bucket}` : t = `https://s3-${e.region}.amazonaws.com/${e.bucket}`;
  } else e.region === "cn-north-1" ? t = `https://${e.bucket}.s3.${e.region}.amazonaws.com.cn` : t = `https://${e.bucket}.s3.amazonaws.com`;
  return Rc(t, e.path);
}
function Rc(e, t) {
  return t != null && t.length > 0 && (t.startsWith("/") || (e += "/"), e += t), e;
}
function rm(e) {
  if (e.name == null)
    throw new Error("name is missing");
  if (e.region == null)
    throw new Error("region is missing");
  return Rc(`https://${e.name}.${e.region}.digitaloceanspaces.com`, e.path);
}
var qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
qo.retry = Oc;
const nm = yt;
async function Oc(e, t) {
  var r;
  const { retries: n, interval: i, backoff: o = 0, attempt: a = 0, shouldRetry: s, cancellationToken: l = new nm.CancellationToken() } = t;
  try {
    return await e();
  } catch (h) {
    if (await Promise.resolve((r = s == null ? void 0 : s(h)) !== null && r !== void 0 ? r : !0) && n > 0 && !l.cancelled)
      return await new Promise((c) => setTimeout(c, i + o * a)), await Oc(e, { ...t, retries: n - 1, attempt: a + 1 });
    throw h;
  }
}
var Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
Go.parseDn = im;
function im(e) {
  let t = !1, r = null, n = "", i = 0;
  e = e.trim();
  const o = /* @__PURE__ */ new Map();
  for (let a = 0; a <= e.length; a++) {
    if (a === e.length) {
      r !== null && o.set(r, n);
      break;
    }
    const s = e[a];
    if (t) {
      if (s === '"') {
        t = !1;
        continue;
      }
    } else {
      if (s === '"') {
        t = !0;
        continue;
      }
      if (s === "\\") {
        a++;
        const l = parseInt(e.slice(a, a + 2), 16);
        Number.isNaN(l) ? n += e[a] : (a++, n += String.fromCharCode(l));
        continue;
      }
      if (r === null && s === "=") {
        r = n, n = "";
        continue;
      }
      if (s === "," || s === ";" || s === "+") {
        r !== null && o.set(r, n), r = null, n = "";
        continue;
      }
    }
    if (s === " " && !t) {
      if (n.length === 0)
        continue;
      if (a > i) {
        let l = a;
        for (; e[l] === " "; )
          l++;
        i = l;
      }
      if (i >= e.length || e[i] === "," || e[i] === ";" || r === null && e[i] === "=" || r !== null && e[i] === "+") {
        a = i - 1;
        continue;
      }
    }
    n += s;
  }
  return o;
}
var ur = {};
Object.defineProperty(ur, "__esModule", { value: !0 });
ur.nil = ur.UUID = void 0;
const Ic = Xr, Pc = hr, om = "options.name must be either a string or a Buffer", os = (0, Ic.randomBytes)(16);
os[0] = os[0] | 1;
const Un = {}, W = [];
for (let e = 0; e < 256; e++) {
  const t = (e + 256).toString(16).substr(1);
  Un[t] = e, W[e] = t;
}
class Mt {
  constructor(t) {
    this.ascii = null, this.binary = null;
    const r = Mt.check(t);
    if (!r)
      throw new Error("not a UUID");
    this.version = r.version, r.format === "ascii" ? this.ascii = t : this.binary = t;
  }
  static v5(t, r) {
    return am(t, "sha1", 80, r);
  }
  toString() {
    return this.ascii == null && (this.ascii = sm(this.binary)), this.ascii;
  }
  inspect() {
    return `UUID v${this.version} ${this.toString()}`;
  }
  static check(t, r = 0) {
    if (typeof t == "string")
      return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
        version: (Un[t[14] + t[15]] & 240) >> 4,
        variant: as((Un[t[19] + t[20]] & 224) >> 5),
        format: "ascii"
      } : !1;
    if (Buffer.isBuffer(t)) {
      if (t.length < r + 16)
        return !1;
      let n = 0;
      for (; n < 16 && t[r + n] === 0; n++)
        ;
      return n === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
        version: (t[r + 6] & 240) >> 4,
        variant: as((t[r + 8] & 224) >> 5),
        format: "binary"
      };
    }
    throw (0, Pc.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
  }
  // read stringified uuid into a Buffer
  static parse(t) {
    const r = Buffer.allocUnsafe(16);
    let n = 0;
    for (let i = 0; i < 16; i++)
      r[i] = Un[t[n++] + t[n++]], (i === 3 || i === 5 || i === 7 || i === 9) && (n += 1);
    return r;
  }
}
ur.UUID = Mt;
Mt.OID = Mt.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
function as(e) {
  switch (e) {
    case 0:
    case 1:
    case 3:
      return "ncs";
    case 4:
    case 5:
      return "rfc4122";
    case 6:
      return "microsoft";
    default:
      return "future";
  }
}
var Pr;
(function(e) {
  e[e.ASCII = 0] = "ASCII", e[e.BINARY = 1] = "BINARY", e[e.OBJECT = 2] = "OBJECT";
})(Pr || (Pr = {}));
function am(e, t, r, n, i = Pr.ASCII) {
  const o = (0, Ic.createHash)(t);
  if (typeof e != "string" && !Buffer.isBuffer(e))
    throw (0, Pc.newError)(om, "ERR_INVALID_UUID_NAME");
  o.update(n), o.update(e);
  const s = o.digest();
  let l;
  switch (i) {
    case Pr.BINARY:
      s[6] = s[6] & 15 | r, s[8] = s[8] & 63 | 128, l = s;
      break;
    case Pr.OBJECT:
      s[6] = s[6] & 15 | r, s[8] = s[8] & 63 | 128, l = new Mt(s);
      break;
    default:
      l = W[s[0]] + W[s[1]] + W[s[2]] + W[s[3]] + "-" + W[s[4]] + W[s[5]] + "-" + W[s[6] & 15 | r] + W[s[7]] + "-" + W[s[8] & 63 | 128] + W[s[9]] + "-" + W[s[10]] + W[s[11]] + W[s[12]] + W[s[13]] + W[s[14]] + W[s[15]];
      break;
  }
  return l;
}
function sm(e) {
  return W[e[0]] + W[e[1]] + W[e[2]] + W[e[3]] + "-" + W[e[4]] + W[e[5]] + "-" + W[e[6]] + W[e[7]] + "-" + W[e[8]] + W[e[9]] + "-" + W[e[10]] + W[e[11]] + W[e[12]] + W[e[13]] + W[e[14]] + W[e[15]];
}
ur.nil = new Mt("00000000-0000-0000-0000-000000000000");
var Zr = {}, Nc = {};
(function(e) {
  (function(t) {
    t.parser = function(d, u) {
      return new n(d, u);
    }, t.SAXParser = n, t.SAXStream = f, t.createStream = h, t.MAX_BUFFER_LENGTH = 64 * 1024;
    var r = [
      "comment",
      "sgmlDecl",
      "textNode",
      "tagName",
      "doctype",
      "procInstName",
      "procInstBody",
      "entity",
      "attribName",
      "attribValue",
      "cdata",
      "script"
    ];
    t.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace"
    ];
    function n(d, u) {
      if (!(this instanceof n))
        return new n(d, u);
      var S = this;
      o(S), S.q = S.c = "", S.bufferCheckPosition = t.MAX_BUFFER_LENGTH, S.encoding = null, S.opt = u || {}, S.opt.lowercase = S.opt.lowercase || S.opt.lowercasetags, S.looseCase = S.opt.lowercase ? "toLowerCase" : "toUpperCase", S.opt.maxEntityCount = S.opt.maxEntityCount || 512, S.opt.maxEntityDepth = S.opt.maxEntityDepth || 4, S.entityCount = S.entityDepth = 0, S.tags = [], S.closed = S.closedRoot = S.sawRoot = !1, S.tag = S.error = null, S.strict = !!d, S.noscript = !!(d || S.opt.noscript), S.state = y.BEGIN, S.strictEntities = S.opt.strictEntities, S.ENTITIES = S.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), S.attribList = [], S.opt.xmlns && (S.ns = Object.create(A)), S.opt.unquotedAttributeValues === void 0 && (S.opt.unquotedAttributeValues = !d), S.trackPosition = S.opt.position !== !1, S.trackPosition && (S.position = S.line = S.column = 0), X(S, "onready");
    }
    Object.create || (Object.create = function(d) {
      function u() {
      }
      u.prototype = d;
      var S = new u();
      return S;
    }), Object.keys || (Object.keys = function(d) {
      var u = [];
      for (var S in d) d.hasOwnProperty(S) && u.push(S);
      return u;
    });
    function i(d) {
      for (var u = Math.max(t.MAX_BUFFER_LENGTH, 10), S = 0, w = 0, z = r.length; w < z; w++) {
        var re = d[r[w]].length;
        if (re > u)
          switch (r[w]) {
            case "textNode":
              N(d);
              break;
            case "cdata":
              $(d, "oncdata", d.cdata), d.cdata = "";
              break;
            case "script":
              $(d, "onscript", d.script), d.script = "";
              break;
            default:
              k(d, "Max buffer length exceeded: " + r[w]);
          }
        S = Math.max(S, re);
      }
      var se = t.MAX_BUFFER_LENGTH - S;
      d.bufferCheckPosition = se + d.position;
    }
    function o(d) {
      for (var u = 0, S = r.length; u < S; u++)
        d[r[u]] = "";
    }
    function a(d) {
      N(d), d.cdata !== "" && ($(d, "oncdata", d.cdata), d.cdata = ""), d.script !== "" && ($(d, "onscript", d.script), d.script = "");
    }
    n.prototype = {
      end: function() {
        V(this);
      },
      write: ln,
      resume: function() {
        return this.error = null, this;
      },
      close: function() {
        return this.write(null);
      },
      flush: function() {
        a(this);
      }
    };
    var s;
    try {
      s = require("stream").Stream;
    } catch {
      s = function() {
      };
    }
    s || (s = function() {
    });
    var l = t.EVENTS.filter(function(d) {
      return d !== "error" && d !== "end";
    });
    function h(d, u) {
      return new f(d, u);
    }
    function c(d, u) {
      if (d.length >= 2) {
        if (d[0] === 255 && d[1] === 254)
          return "utf-16le";
        if (d[0] === 254 && d[1] === 255)
          return "utf-16be";
      }
      return d.length >= 3 && d[0] === 239 && d[1] === 187 && d[2] === 191 ? "utf8" : d.length >= 4 ? d[0] === 60 && d[1] === 0 && d[2] === 63 && d[3] === 0 ? "utf-16le" : d[0] === 0 && d[1] === 60 && d[2] === 0 && d[3] === 63 ? "utf-16be" : "utf8" : u ? "utf8" : null;
    }
    function f(d, u) {
      if (!(this instanceof f))
        return new f(d, u);
      s.apply(this), this._parser = new n(d, u), this.writable = !0, this.readable = !0;
      var S = this;
      this._parser.onend = function() {
        S.emit("end");
      }, this._parser.onerror = function(w) {
        S.emit("error", w), S._parser.error = null;
      }, this._decoder = null, this._decoderBuffer = null, l.forEach(function(w) {
        Object.defineProperty(S, "on" + w, {
          get: function() {
            return S._parser["on" + w];
          },
          set: function(z) {
            if (!z)
              return S.removeAllListeners(w), S._parser["on" + w] = z, z;
            S.on(w, z);
          },
          enumerable: !0,
          configurable: !1
        });
      });
    }
    f.prototype = Object.create(s.prototype, {
      constructor: {
        value: f
      }
    }), f.prototype._decodeBuffer = function(d, u) {
      if (this._decoderBuffer && (d = Buffer.concat([this._decoderBuffer, d]), this._decoderBuffer = null), !this._decoder) {
        var S = c(d, u);
        if (!S)
          return this._decoderBuffer = d, "";
        this._parser.encoding = S, this._decoder = new TextDecoder(S);
      }
      return this._decoder.decode(d, { stream: !u });
    }, f.prototype.write = function(d) {
      if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(d))
        d = this._decodeBuffer(d, !1);
      else if (this._decoderBuffer) {
        var u = this._decodeBuffer(Buffer.alloc(0), !0);
        u && (this._parser.write(u), this.emit("data", u));
      }
      return this._parser.write(d.toString()), this.emit("data", d), !0;
    }, f.prototype.end = function(d) {
      if (d && d.length && this.write(d), this._decoderBuffer) {
        var u = this._decodeBuffer(Buffer.alloc(0), !0);
        u && (this._parser.write(u), this.emit("data", u));
      } else if (this._decoder) {
        var S = this._decoder.decode();
        S && (this._parser.write(S), this.emit("data", S));
      }
      return this._parser.end(), !0;
    }, f.prototype.on = function(d, u) {
      var S = this;
      return !S._parser["on" + d] && l.indexOf(d) !== -1 && (S._parser["on" + d] = function() {
        var w = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        w.splice(0, 0, d), S.emit.apply(S, w);
      }), s.prototype.on.call(S, d, u);
    };
    var g = "[CDATA[", m = "DOCTYPE", v = "http://www.w3.org/XML/1998/namespace", E = "http://www.w3.org/2000/xmlns/", A = { xml: v, xmlns: E }, T = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, C = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, D = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, B = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function G(d) {
      return d === " " || d === `
` || d === "\r" || d === "	";
    }
    function Z(d) {
      return d === '"' || d === "'";
    }
    function ee(d) {
      return d === ">" || G(d);
    }
    function ae(d, u) {
      return d.test(u);
    }
    function U(d, u) {
      return !ae(d, u);
    }
    var y = 0;
    t.STATE = {
      BEGIN: y++,
      // leading byte order mark or whitespace
      BEGIN_WHITESPACE: y++,
      // leading whitespace
      TEXT: y++,
      // general stuff
      TEXT_ENTITY: y++,
      // &amp and such.
      OPEN_WAKA: y++,
      // <
      SGML_DECL: y++,
      // <!BLARG
      SGML_DECL_QUOTED: y++,
      // <!BLARG foo "bar
      DOCTYPE: y++,
      // <!DOCTYPE
      DOCTYPE_QUOTED: y++,
      // <!DOCTYPE "//blah
      DOCTYPE_DTD: y++,
      // <!DOCTYPE "//blah" [ ...
      DOCTYPE_DTD_QUOTED: y++,
      // <!DOCTYPE "//blah" [ "foo
      COMMENT_STARTING: y++,
      // <!-
      COMMENT: y++,
      // <!--
      COMMENT_ENDING: y++,
      // <!-- blah -
      COMMENT_ENDED: y++,
      // <!-- blah --
      CDATA: y++,
      // <![CDATA[ something
      CDATA_ENDING: y++,
      // ]
      CDATA_ENDING_2: y++,
      // ]]
      PROC_INST: y++,
      // <?hi
      PROC_INST_BODY: y++,
      // <?hi there
      PROC_INST_ENDING: y++,
      // <?hi "there" ?
      OPEN_TAG: y++,
      // <strong
      OPEN_TAG_SLASH: y++,
      // <strong /
      ATTRIB: y++,
      // <a
      ATTRIB_NAME: y++,
      // <a foo
      ATTRIB_NAME_SAW_WHITE: y++,
      // <a foo _
      ATTRIB_VALUE: y++,
      // <a foo=
      ATTRIB_VALUE_QUOTED: y++,
      // <a foo="bar
      ATTRIB_VALUE_CLOSED: y++,
      // <a foo="bar"
      ATTRIB_VALUE_UNQUOTED: y++,
      // <a foo=bar
      ATTRIB_VALUE_ENTITY_Q: y++,
      // <foo bar="&quot;"
      ATTRIB_VALUE_ENTITY_U: y++,
      // <foo bar=&quot
      CLOSE_TAG: y++,
      // </a
      CLOSE_TAG_SAW_WHITE: y++,
      // </a   >
      SCRIPT: y++,
      // <script> ...
      SCRIPT_ENDING: y++
      // <script> ... <
    }, t.XML_ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'"
    }, t.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830
    }, Object.keys(t.ENTITIES).forEach(function(d) {
      var u = t.ENTITIES[d], S = typeof u == "number" ? String.fromCharCode(u) : u;
      t.ENTITIES[d] = S;
    });
    for (var H in t.STATE)
      t.STATE[t.STATE[H]] = H;
    y = t.STATE;
    function X(d, u, S) {
      d[u] && d[u](S);
    }
    function te(d) {
      var u = d && d.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
      return u ? u[2] : null;
    }
    function O(d) {
      return d ? d.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
    }
    function R(d, u) {
      const S = O(d), w = O(u);
      return !S || !w ? !0 : w === "utf16" ? S === "utf16le" || S === "utf16be" : S === w;
    }
    function P(d, u) {
      if (!(!d.strict || !d.encoding || !u || u.name !== "xml")) {
        var S = te(u.body);
        S && !R(d.encoding, S) && F(
          d,
          "XML declaration encoding " + S + " does not match detected stream encoding " + d.encoding.toUpperCase()
        );
      }
    }
    function $(d, u, S) {
      d.textNode && N(d), X(d, u, S);
    }
    function N(d) {
      d.textNode = I(d.opt, d.textNode), d.textNode && X(d, "ontext", d.textNode), d.textNode = "";
    }
    function I(d, u) {
      return d.trim && (u = u.trim()), d.normalize && (u = u.replace(/\s+/g, " ")), u;
    }
    function k(d, u) {
      return N(d), d.trackPosition && (u += `
Line: ` + d.line + `
Column: ` + d.column + `
Char: ` + d.c), u = new Error(u), d.error = u, X(d, "onerror", u), d;
    }
    function V(d) {
      return d.sawRoot && !d.closedRoot && F(d, "Unclosed root tag"), d.state !== y.BEGIN && d.state !== y.BEGIN_WHITESPACE && d.state !== y.TEXT && k(d, "Unexpected end"), N(d), d.c = "", d.closed = !0, X(d, "onend"), n.call(d, d.strict, d.opt), d;
    }
    function F(d, u) {
      if (typeof d != "object" || !(d instanceof n))
        throw new Error("bad call to strictFail");
      d.strict && k(d, u);
    }
    function K(d) {
      d.strict || (d.tagName = d.tagName[d.looseCase]());
      var u = d.tags[d.tags.length - 1] || d, S = d.tag = { name: d.tagName, attributes: {} };
      d.opt.xmlns && (S.ns = u.ns), d.attribList.length = 0, $(d, "onopentagstart", S);
    }
    function ue(d, u) {
      var S = d.indexOf(":"), w = S < 0 ? ["", d] : d.split(":"), z = w[0], re = w[1];
      return u && d === "xmlns" && (z = "xmlns", re = ""), { prefix: z, local: re };
    }
    function M(d) {
      if (d.strict || (d.attribName = d.attribName[d.looseCase]()), d.attribList.indexOf(d.attribName) !== -1 || d.tag.attributes.hasOwnProperty(d.attribName)) {
        d.attribName = d.attribValue = "";
        return;
      }
      if (d.opt.xmlns) {
        var u = ue(d.attribName, !0), S = u.prefix, w = u.local;
        if (S === "xmlns")
          if (w === "xml" && d.attribValue !== v)
            F(
              d,
              "xml: prefix must be bound to " + v + `
Actual: ` + d.attribValue
            );
          else if (w === "xmlns" && d.attribValue !== E)
            F(
              d,
              "xmlns: prefix must be bound to " + E + `
Actual: ` + d.attribValue
            );
          else {
            var z = d.tag, re = d.tags[d.tags.length - 1] || d;
            z.ns === re.ns && (z.ns = Object.create(re.ns)), z.ns[w] = d.attribValue;
          }
        d.attribList.push([d.attribName, d.attribValue]);
      } else
        d.tag.attributes[d.attribName] = d.attribValue, $(d, "onattribute", {
          name: d.attribName,
          value: d.attribValue
        });
      d.attribName = d.attribValue = "";
    }
    function we(d, u) {
      if (d.opt.xmlns) {
        var S = d.tag, w = ue(d.tagName);
        S.prefix = w.prefix, S.local = w.local, S.uri = S.ns[w.prefix] || "", S.prefix && !S.uri && (F(
          d,
          "Unbound namespace prefix: " + JSON.stringify(d.tagName)
        ), S.uri = w.prefix);
        var z = d.tags[d.tags.length - 1] || d;
        S.ns && z.ns !== S.ns && Object.keys(S.ns).forEach(function(bt) {
          $(d, "onopennamespace", {
            prefix: bt,
            uri: S.ns[bt]
          });
        });
        for (var re = 0, se = d.attribList.length; re < se; re++) {
          var _e = d.attribList[re], Ae = _e[0], je = _e[1], fe = ue(Ae, !0), He = fe.prefix, wi = fe.local, cn = He === "" ? "" : S.ns[He] || "", vr = {
            name: Ae,
            value: je,
            prefix: He,
            local: wi,
            uri: cn
          };
          He && He !== "xmlns" && !cn && (F(
            d,
            "Unbound namespace prefix: " + JSON.stringify(He)
          ), vr.uri = He), d.tag.attributes[Ae] = vr, $(d, "onattribute", vr);
        }
        d.attribList.length = 0;
      }
      d.tag.isSelfClosing = !!u, d.sawRoot = !0, d.tags.push(d.tag), $(d, "onopentag", d.tag), u || (!d.noscript && d.tagName.toLowerCase() === "script" ? d.state = y.SCRIPT : d.state = y.TEXT, d.tag = null, d.tagName = ""), d.attribName = d.attribValue = "", d.attribList.length = 0;
    }
    function Er(d) {
      if (!d.tagName) {
        F(d, "Weird empty close tag."), d.textNode += "</>", d.state = y.TEXT;
        return;
      }
      if (d.script) {
        if (d.tagName !== "script") {
          d.script += "</" + d.tagName + ">", d.tagName = "", d.state = y.SCRIPT;
          return;
        }
        $(d, "onscript", d.script), d.script = "";
      }
      var u = d.tags.length, S = d.tagName;
      d.strict || (S = S[d.looseCase]());
      for (var w = S; u--; ) {
        var z = d.tags[u];
        if (z.name !== w)
          F(d, "Unexpected close tag");
        else
          break;
      }
      if (u < 0) {
        F(d, "Unmatched closing tag: " + d.tagName), d.textNode += "</" + d.tagName + ">", d.state = y.TEXT;
        return;
      }
      d.tagName = S;
      for (var re = d.tags.length; re-- > u; ) {
        var se = d.tag = d.tags.pop();
        d.tagName = d.tag.name, $(d, "onclosetag", d.tagName);
        var _e = {};
        for (var Ae in se.ns)
          _e[Ae] = se.ns[Ae];
        var je = d.tags[d.tags.length - 1] || d;
        d.opt.xmlns && se.ns !== je.ns && Object.keys(se.ns).forEach(function(fe) {
          var He = se.ns[fe];
          $(d, "onclosenamespace", { prefix: fe, uri: He });
        });
      }
      u === 0 && (d.closedRoot = !0), d.tagName = d.attribValue = d.attribName = "", d.attribList.length = 0, d.state = y.TEXT;
    }
    function Be(d) {
      var u = d.entity, S = u.toLowerCase(), w, z = "";
      return d.ENTITIES[u] ? d.ENTITIES[u] : d.ENTITIES[S] ? d.ENTITIES[S] : (u = S, u.charAt(0) === "#" && (u.charAt(1) === "x" ? (u = u.slice(2), w = parseInt(u, 16), z = w.toString(16)) : (u = u.slice(1), w = parseInt(u, 10), z = w.toString(10))), u = u.replace(/^0+/, ""), isNaN(w) || z.toLowerCase() !== u || w < 0 || w > 1114111 ? (F(d, "Invalid character entity"), "&" + d.entity + ";") : String.fromCodePoint(w));
    }
    function yr(d, u) {
      u === "<" ? (d.state = y.OPEN_WAKA, d.startTagPosition = d.position) : G(u) || (F(d, "Non-whitespace before first tag."), d.textNode = u, d.state = y.TEXT);
    }
    function Vt(d, u) {
      var S = "";
      return u < d.length && (S = d.charAt(u)), S;
    }
    function ln(d) {
      var u = this;
      if (this.error)
        throw this.error;
      if (u.closed)
        return k(
          u,
          "Cannot write after close. Assign an onready handler."
        );
      if (d === null)
        return V(u);
      typeof d == "object" && (d = d.toString());
      for (var S = 0, w = ""; w = Vt(d, S++), u.c = w, !!w; )
        switch (u.trackPosition && (u.position++, w === `
` ? (u.line++, u.column = 0) : u.column++), u.state) {
          case y.BEGIN:
            if (u.state = y.BEGIN_WHITESPACE, w === "\uFEFF")
              continue;
            yr(u, w);
            continue;
          case y.BEGIN_WHITESPACE:
            yr(u, w);
            continue;
          case y.TEXT:
            if (u.sawRoot && !u.closedRoot) {
              for (var re = S - 1; w && w !== "<" && w !== "&"; )
                w = Vt(d, S++), w && u.trackPosition && (u.position++, w === `
` ? (u.line++, u.column = 0) : u.column++);
              u.textNode += d.substring(re, S - 1);
            }
            w === "<" && !(u.sawRoot && u.closedRoot && !u.strict) ? (u.state = y.OPEN_WAKA, u.startTagPosition = u.position) : (!G(w) && (!u.sawRoot || u.closedRoot) && F(u, "Text data outside of root node."), w === "&" ? u.state = y.TEXT_ENTITY : u.textNode += w);
            continue;
          case y.SCRIPT:
            w === "<" ? u.state = y.SCRIPT_ENDING : u.script += w;
            continue;
          case y.SCRIPT_ENDING:
            w === "/" ? u.state = y.CLOSE_TAG : (u.script += "<" + w, u.state = y.SCRIPT);
            continue;
          case y.OPEN_WAKA:
            if (w === "!")
              u.state = y.SGML_DECL, u.sgmlDecl = "";
            else if (!G(w)) if (ae(T, w))
              u.state = y.OPEN_TAG, u.tagName = w;
            else if (w === "/")
              u.state = y.CLOSE_TAG, u.tagName = "";
            else if (w === "?")
              u.state = y.PROC_INST, u.procInstName = u.procInstBody = "";
            else {
              if (F(u, "Unencoded <"), u.startTagPosition + 1 < u.position) {
                var z = u.position - u.startTagPosition;
                w = new Array(z).join(" ") + w;
              }
              u.textNode += "<" + w, u.state = y.TEXT;
            }
            continue;
          case y.SGML_DECL:
            if (u.sgmlDecl + w === "--") {
              u.state = y.COMMENT, u.comment = "", u.sgmlDecl = "";
              continue;
            }
            u.doctype && u.doctype !== !0 && u.sgmlDecl ? (u.state = y.DOCTYPE_DTD, u.doctype += "<!" + u.sgmlDecl + w, u.sgmlDecl = "") : (u.sgmlDecl + w).toUpperCase() === g ? ($(u, "onopencdata"), u.state = y.CDATA, u.sgmlDecl = "", u.cdata = "") : (u.sgmlDecl + w).toUpperCase() === m ? (u.state = y.DOCTYPE, (u.doctype || u.sawRoot) && F(
              u,
              "Inappropriately located doctype declaration"
            ), u.doctype = "", u.sgmlDecl = "") : w === ">" ? ($(u, "onsgmldeclaration", u.sgmlDecl), u.sgmlDecl = "", u.state = y.TEXT) : (Z(w) && (u.state = y.SGML_DECL_QUOTED), u.sgmlDecl += w);
            continue;
          case y.SGML_DECL_QUOTED:
            w === u.q && (u.state = y.SGML_DECL, u.q = ""), u.sgmlDecl += w;
            continue;
          case y.DOCTYPE:
            w === ">" ? (u.state = y.TEXT, $(u, "ondoctype", u.doctype), u.doctype = !0) : (u.doctype += w, w === "[" ? u.state = y.DOCTYPE_DTD : Z(w) && (u.state = y.DOCTYPE_QUOTED, u.q = w));
            continue;
          case y.DOCTYPE_QUOTED:
            u.doctype += w, w === u.q && (u.q = "", u.state = y.DOCTYPE);
            continue;
          case y.DOCTYPE_DTD:
            w === "]" ? (u.doctype += w, u.state = y.DOCTYPE) : w === "<" ? (u.state = y.OPEN_WAKA, u.startTagPosition = u.position) : Z(w) ? (u.doctype += w, u.state = y.DOCTYPE_DTD_QUOTED, u.q = w) : u.doctype += w;
            continue;
          case y.DOCTYPE_DTD_QUOTED:
            u.doctype += w, w === u.q && (u.state = y.DOCTYPE_DTD, u.q = "");
            continue;
          case y.COMMENT:
            w === "-" ? u.state = y.COMMENT_ENDING : u.comment += w;
            continue;
          case y.COMMENT_ENDING:
            w === "-" ? (u.state = y.COMMENT_ENDED, u.comment = I(u.opt, u.comment), u.comment && $(u, "oncomment", u.comment), u.comment = "") : (u.comment += "-" + w, u.state = y.COMMENT);
            continue;
          case y.COMMENT_ENDED:
            w !== ">" ? (F(u, "Malformed comment"), u.comment += "--" + w, u.state = y.COMMENT) : u.doctype && u.doctype !== !0 ? u.state = y.DOCTYPE_DTD : u.state = y.TEXT;
            continue;
          case y.CDATA:
            for (var re = S - 1; w && w !== "]"; )
              w = Vt(d, S++), w && u.trackPosition && (u.position++, w === `
` ? (u.line++, u.column = 0) : u.column++);
            u.cdata += d.substring(re, S - 1), w === "]" && (u.state = y.CDATA_ENDING);
            continue;
          case y.CDATA_ENDING:
            w === "]" ? u.state = y.CDATA_ENDING_2 : (u.cdata += "]" + w, u.state = y.CDATA);
            continue;
          case y.CDATA_ENDING_2:
            w === ">" ? (u.cdata && $(u, "oncdata", u.cdata), $(u, "onclosecdata"), u.cdata = "", u.state = y.TEXT) : w === "]" ? u.cdata += "]" : (u.cdata += "]]" + w, u.state = y.CDATA);
            continue;
          case y.PROC_INST:
            w === "?" ? u.state = y.PROC_INST_ENDING : G(w) ? u.state = y.PROC_INST_BODY : u.procInstName += w;
            continue;
          case y.PROC_INST_BODY:
            if (!u.procInstBody && G(w))
              continue;
            w === "?" ? u.state = y.PROC_INST_ENDING : u.procInstBody += w;
            continue;
          case y.PROC_INST_ENDING:
            if (w === ">") {
              const je = {
                name: u.procInstName,
                body: u.procInstBody
              };
              P(u, je), $(u, "onprocessinginstruction", je), u.procInstName = u.procInstBody = "", u.state = y.TEXT;
            } else
              u.procInstBody += "?" + w, u.state = y.PROC_INST_BODY;
            continue;
          case y.OPEN_TAG:
            ae(C, w) ? u.tagName += w : (K(u), w === ">" ? we(u) : w === "/" ? u.state = y.OPEN_TAG_SLASH : (G(w) || F(u, "Invalid character in tag name"), u.state = y.ATTRIB));
            continue;
          case y.OPEN_TAG_SLASH:
            w === ">" ? (we(u, !0), Er(u)) : (F(
              u,
              "Forward-slash in opening tag not followed by >"
            ), u.state = y.ATTRIB);
            continue;
          case y.ATTRIB:
            if (G(w))
              continue;
            w === ">" ? we(u) : w === "/" ? u.state = y.OPEN_TAG_SLASH : ae(T, w) ? (u.attribName = w, u.attribValue = "", u.state = y.ATTRIB_NAME) : F(u, "Invalid attribute name");
            continue;
          case y.ATTRIB_NAME:
            w === "=" ? u.state = y.ATTRIB_VALUE : w === ">" ? (F(u, "Attribute without value"), u.attribValue = u.attribName, M(u), we(u)) : G(w) ? u.state = y.ATTRIB_NAME_SAW_WHITE : ae(C, w) ? u.attribName += w : F(u, "Invalid attribute name");
            continue;
          case y.ATTRIB_NAME_SAW_WHITE:
            if (w === "=")
              u.state = y.ATTRIB_VALUE;
            else {
              if (G(w))
                continue;
              F(u, "Attribute without value"), u.tag.attributes[u.attribName] = "", u.attribValue = "", $(u, "onattribute", {
                name: u.attribName,
                value: ""
              }), u.attribName = "", w === ">" ? we(u) : ae(T, w) ? (u.attribName = w, u.state = y.ATTRIB_NAME) : (F(u, "Invalid attribute name"), u.state = y.ATTRIB);
            }
            continue;
          case y.ATTRIB_VALUE:
            if (G(w))
              continue;
            Z(w) ? (u.q = w, u.state = y.ATTRIB_VALUE_QUOTED) : (u.opt.unquotedAttributeValues || k(u, "Unquoted attribute value"), u.state = y.ATTRIB_VALUE_UNQUOTED, u.attribValue = w);
            continue;
          case y.ATTRIB_VALUE_QUOTED:
            if (w !== u.q) {
              w === "&" ? u.state = y.ATTRIB_VALUE_ENTITY_Q : u.attribValue += w;
              continue;
            }
            M(u), u.q = "", u.state = y.ATTRIB_VALUE_CLOSED;
            continue;
          case y.ATTRIB_VALUE_CLOSED:
            G(w) ? u.state = y.ATTRIB : w === ">" ? we(u) : w === "/" ? u.state = y.OPEN_TAG_SLASH : ae(T, w) ? (F(u, "No whitespace between attributes"), u.attribName = w, u.attribValue = "", u.state = y.ATTRIB_NAME) : F(u, "Invalid attribute name");
            continue;
          case y.ATTRIB_VALUE_UNQUOTED:
            if (!ee(w)) {
              w === "&" ? u.state = y.ATTRIB_VALUE_ENTITY_U : u.attribValue += w;
              continue;
            }
            M(u), w === ">" ? we(u) : u.state = y.ATTRIB;
            continue;
          case y.CLOSE_TAG:
            if (u.tagName)
              w === ">" ? Er(u) : ae(C, w) ? u.tagName += w : u.script ? (u.script += "</" + u.tagName + w, u.tagName = "", u.state = y.SCRIPT) : (G(w) || F(u, "Invalid tagname in closing tag"), u.state = y.CLOSE_TAG_SAW_WHITE);
            else {
              if (G(w))
                continue;
              U(T, w) ? u.script ? (u.script += "</" + w, u.state = y.SCRIPT) : F(u, "Invalid tagname in closing tag.") : u.tagName = w;
            }
            continue;
          case y.CLOSE_TAG_SAW_WHITE:
            if (G(w))
              continue;
            w === ">" ? Er(u) : F(u, "Invalid characters in closing tag");
            continue;
          case y.TEXT_ENTITY:
          case y.ATTRIB_VALUE_ENTITY_Q:
          case y.ATTRIB_VALUE_ENTITY_U:
            var se, _e;
            switch (u.state) {
              case y.TEXT_ENTITY:
                se = y.TEXT, _e = "textNode";
                break;
              case y.ATTRIB_VALUE_ENTITY_Q:
                se = y.ATTRIB_VALUE_QUOTED, _e = "attribValue";
                break;
              case y.ATTRIB_VALUE_ENTITY_U:
                se = y.ATTRIB_VALUE_UNQUOTED, _e = "attribValue";
                break;
            }
            if (w === ";") {
              var Ae = Be(u);
              u.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(Ae) ? ((u.entityCount += 1) > u.opt.maxEntityCount && k(
                u,
                "Parsed entity count exceeds max entity count"
              ), (u.entityDepth += 1) > u.opt.maxEntityDepth && k(
                u,
                "Parsed entity depth exceeds max entity depth"
              ), u.entity = "", u.state = se, u.write(Ae), u.entityDepth -= 1) : (u[_e] += Ae, u.entity = "", u.state = se);
            } else ae(u.entity.length ? B : D, w) ? u.entity += w : (F(u, "Invalid character in entity name"), u[_e] += "&" + u.entity + w, u.entity = "", u.state = se);
            continue;
          default:
            throw new Error(u, "Unknown state: " + u.state);
        }
      return u.position >= u.bufferCheckPosition && i(u), u;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    String.fromCodePoint || function() {
      var d = String.fromCharCode, u = Math.floor, S = function() {
        var w = 16384, z = [], re, se, _e = -1, Ae = arguments.length;
        if (!Ae)
          return "";
        for (var je = ""; ++_e < Ae; ) {
          var fe = Number(arguments[_e]);
          if (!isFinite(fe) || // `NaN`, `+Infinity`, or `-Infinity`
          fe < 0 || // not a valid Unicode code point
          fe > 1114111 || // not a valid Unicode code point
          u(fe) !== fe)
            throw RangeError("Invalid code point: " + fe);
          fe <= 65535 ? z.push(fe) : (fe -= 65536, re = (fe >> 10) + 55296, se = fe % 1024 + 56320, z.push(re, se)), (_e + 1 === Ae || z.length > w) && (je += d.apply(null, z), z.length = 0);
        }
        return je;
      };
      Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
        value: S,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = S;
    }();
  })(e);
})(Nc);
Object.defineProperty(Zr, "__esModule", { value: !0 });
Zr.XElement = void 0;
Zr.parseXml = fm;
const lm = Nc, An = hr;
class Dc {
  constructor(t) {
    if (this.name = t, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !t)
      throw (0, An.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
    if (!um(t))
      throw (0, An.newError)(`Invalid element name: ${t}`, "ERR_XML_ELEMENT_INVALID_NAME");
  }
  attribute(t) {
    const r = this.attributes === null ? null : this.attributes[t];
    if (r == null)
      throw (0, An.newError)(`No attribute "${t}"`, "ERR_XML_MISSED_ATTRIBUTE");
    return r;
  }
  removeAttribute(t) {
    this.attributes !== null && delete this.attributes[t];
  }
  element(t, r = !1, n = null) {
    const i = this.elementOrNull(t, r);
    if (i === null)
      throw (0, An.newError)(n || `No element "${t}"`, "ERR_XML_MISSED_ELEMENT");
    return i;
  }
  elementOrNull(t, r = !1) {
    if (this.elements === null)
      return null;
    for (const n of this.elements)
      if (ss(n, t, r))
        return n;
    return null;
  }
  getElements(t, r = !1) {
    return this.elements === null ? [] : this.elements.filter((n) => ss(n, t, r));
  }
  elementValueOrEmpty(t, r = !1) {
    const n = this.elementOrNull(t, r);
    return n === null ? "" : n.value;
  }
}
Zr.XElement = Dc;
const cm = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
function um(e) {
  return cm.test(e);
}
function ss(e, t, r) {
  const n = e.name;
  return n === t || r === !0 && n.length === t.length && n.toLowerCase() === t.toLowerCase();
}
function fm(e) {
  let t = null;
  const r = lm.parser(!0, {}), n = [];
  return r.onopentag = (i) => {
    const o = new Dc(i.name);
    if (o.attributes = i.attributes, t === null)
      t = o;
    else {
      const a = n[n.length - 1];
      a.elements == null && (a.elements = []), a.elements.push(o);
    }
    n.push(o);
  }, r.onclosetag = () => {
    n.pop();
  }, r.ontext = (i) => {
    n.length > 0 && (n[n.length - 1].value = i);
  }, r.oncdata = (i) => {
    const o = n[n.length - 1];
    o.value = i, o.isCData = !0;
  }, r.onerror = (i) => {
    throw i;
  }, r.write(e), t;
}
var qt = {};
Object.defineProperty(qt, "__esModule", { value: !0 });
qt.mapToObject = Fc;
qt.isValidKey = ri;
qt.asArray = dm;
qt.deepAssign = pm;
qt.objectToArgs = Em;
function Fc(e) {
  const t = {};
  for (const [r, n] of e)
    ri(r) && (n instanceof Map ? t[r] = Fc(n) : t[r] = n);
  return t;
}
function ri(e) {
  return ["__proto__", "prototype", "constructor"].includes(e) ? !1 : ["string", "number", "symbol", "boolean"].includes(typeof e) || e === null;
}
function dm(e) {
  return e == null ? [] : Array.isArray(e) ? e : [e];
}
function ls(e) {
  if (Array.isArray(e))
    return !1;
  const t = typeof e;
  return t === "object" || t === "function";
}
function hm(e, t, r) {
  const n = t[r];
  if (n === void 0)
    return;
  const i = e[r];
  i == null || n == null || !ls(i) || !ls(n) ? Array.isArray(i) && Array.isArray(n) ? e[r] = Array.from(new Set(i.concat(n))) : e[r] = n : e[r] = xc(i, n);
}
function xc(e, t) {
  if (e !== t)
    for (const r of Object.getOwnPropertyNames(t))
      ri(r) && hm(e, t, r);
  return e;
}
function pm(e, ...t) {
  for (const r of t)
    r != null && xc(e, r);
  return e;
}
const mm = /^[a-zA-Z][a-zA-Z0-9-]*$/, gm = /[\0\r\n]/;
function Em(e) {
  const t = Object.entries(e).reduce((r, [n, i]) => {
    if (!ri(n) || i == null)
      return r;
    if (!mm.test(n))
      throw new Error(`objectToArgs: unsafe flag name rejected: ${JSON.stringify(n)}`);
    if (gm.test(i))
      throw new Error(`objectToArgs: value for --${n} contains a null byte or newline`);
    return r.concat([`--${n}`, i]);
  }, []);
  return Object.freeze(t);
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.objectToArgs = e.deepAssign = e.asArray = e.mapToObject = e.isValidKey = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.isSensitiveFieldName = e.HttpExecutor = e.hashSensitiveValue = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0;
  var t = yt;
  Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
    return t.CancellationError;
  } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } });
  var r = hr;
  Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
    return r.newError;
  } });
  var n = de;
  Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
    return n.configureRequestOptions;
  } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
    return n.configureRequestOptionsFromUrl;
  } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
    return n.configureRequestUrl;
  } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
    return n.createHttpError;
  } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
    return n.DigestTransform;
  } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
    return n.HttpError;
  } }), Object.defineProperty(e, "hashSensitiveValue", { enumerable: !0, get: function() {
    return n.hashSensitiveValue;
  } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
    return n.HttpExecutor;
  } }), Object.defineProperty(e, "isSensitiveFieldName", { enumerable: !0, get: function() {
    return n.isSensitiveFieldName;
  } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
    return n.parseJson;
  } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
    return n.safeGetHeader;
  } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
    return n.safeStringifyJson;
  } });
  var i = ti;
  Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
    return i.MemoLazy;
  } });
  var o = Jr;
  Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
    return o.ProgressCallbackTransform;
  } });
  var a = Qr;
  Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
    return a.getS3LikeProviderBaseUrl;
  } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
    return a.githubUrl;
  } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
    return a.githubTagPrefix;
  } });
  var s = qo;
  Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
    return s.retry;
  } });
  var l = Go;
  Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
    return l.parseDn;
  } });
  var h = ur;
  Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
    return h.UUID;
  } });
  var c = Zr;
  Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
    return c.parseXml;
  } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
    return c.XElement;
  } });
  var f = qt;
  Object.defineProperty(e, "isValidKey", { enumerable: !0, get: function() {
    return f.isValidKey;
  } }), Object.defineProperty(e, "mapToObject", { enumerable: !0, get: function() {
    return f.mapToObject;
  } }), Object.defineProperty(e, "asArray", { enumerable: !0, get: function() {
    return f.asArray;
  } }), Object.defineProperty(e, "deepAssign", { enumerable: !0, get: function() {
    return f.deepAssign;
  } }), Object.defineProperty(e, "objectToArgs", { enumerable: !0, get: function() {
    return f.objectToArgs;
  } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
})(he);
var ve = {}, Vo = {}, Ye = {};
function Lc(e) {
  return typeof e > "u" || e === null;
}
function ym(e) {
  return typeof e == "object" && e !== null;
}
function vm(e) {
  return Array.isArray(e) ? e : Lc(e) ? [] : [e];
}
function wm(e, t) {
  var r, n, i, o;
  if (t)
    for (o = Object.keys(t), r = 0, n = o.length; r < n; r += 1)
      i = o[r], e[i] = t[i];
  return e;
}
function _m(e, t) {
  var r = "", n;
  for (n = 0; n < t; n += 1)
    r += e;
  return r;
}
function Am(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
Ye.isNothing = Lc;
Ye.isObject = ym;
Ye.toArray = vm;
Ye.repeat = _m;
Ye.isNegativeZero = Am;
Ye.extend = wm;
function Uc(e, t) {
  var r = "", n = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (r += 'in "' + e.mark.name + '" '), r += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (r += `

` + e.mark.snippet), n + " " + r) : n;
}
function kr(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Uc(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
kr.prototype = Object.create(Error.prototype);
kr.prototype.constructor = kr;
kr.prototype.toString = function(t) {
  return this.name + ": " + Uc(this, t);
};
var en = kr, $r = Ye;
function Li(e, t, r, n, i) {
  var o = "", a = "", s = Math.floor(i / 2) - 1;
  return n - t > s && (o = " ... ", t = n - s + o.length), r - n > s && (a = " ...", r = n + s - a.length), {
    str: o + e.slice(t, r).replace(/\t/g, "→") + a,
    pos: n - t + o.length
    // relative position
  };
}
function Ui(e, t) {
  return $r.repeat(" ", t - e.length) + e;
}
function Tm(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var r = /\r?\n|\r|\0/g, n = [0], i = [], o, a = -1; o = r.exec(e.buffer); )
    i.push(o.index), n.push(o.index + o[0].length), e.position <= o.index && a < 0 && (a = n.length - 2);
  a < 0 && (a = n.length - 1);
  var s = "", l, h, c = Math.min(e.line + t.linesAfter, i.length).toString().length, f = t.maxLength - (t.indent + c + 3);
  for (l = 1; l <= t.linesBefore && !(a - l < 0); l++)
    h = Li(
      e.buffer,
      n[a - l],
      i[a - l],
      e.position - (n[a] - n[a - l]),
      f
    ), s = $r.repeat(" ", t.indent) + Ui((e.line - l + 1).toString(), c) + " | " + h.str + `
` + s;
  for (h = Li(e.buffer, n[a], i[a], e.position, f), s += $r.repeat(" ", t.indent) + Ui((e.line + 1).toString(), c) + " | " + h.str + `
`, s += $r.repeat("-", t.indent + c + 3 + h.pos) + `^
`, l = 1; l <= t.linesAfter && !(a + l >= i.length); l++)
    h = Li(
      e.buffer,
      n[a + l],
      i[a + l],
      e.position - (n[a] - n[a + l]),
      f
    ), s += $r.repeat(" ", t.indent) + Ui((e.line + l + 1).toString(), c) + " | " + h.str + `
`;
  return s.replace(/\n$/, "");
}
var Sm = Tm, cs = en, Cm = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
], bm = [
  "scalar",
  "sequence",
  "mapping"
];
function $m(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(r) {
    e[r].forEach(function(n) {
      t[String(n)] = r;
    });
  }), t;
}
function Rm(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(r) {
    if (Cm.indexOf(r) === -1)
      throw new cs('Unknown option "' + r + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(r) {
    return r;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = $m(t.styleAliases || null), bm.indexOf(this.kind) === -1)
    throw new cs('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var Pe = Rm, Sr = en, ki = Pe;
function us(e, t) {
  var r = [];
  return e[t].forEach(function(n) {
    var i = r.length;
    r.forEach(function(o, a) {
      o.tag === n.tag && o.kind === n.kind && o.multi === n.multi && (i = a);
    }), r[i] = n;
  }), r;
}
function Om() {
  var e = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, t, r;
  function n(i) {
    i.multi ? (e.multi[i.kind].push(i), e.multi.fallback.push(i)) : e[i.kind][i.tag] = e.fallback[i.tag] = i;
  }
  for (t = 0, r = arguments.length; t < r; t += 1)
    arguments[t].forEach(n);
  return e;
}
function yo(e) {
  return this.extend(e);
}
yo.prototype.extend = function(t) {
  var r = [], n = [];
  if (t instanceof ki)
    n.push(t);
  else if (Array.isArray(t))
    n = n.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (r = r.concat(t.implicit)), t.explicit && (n = n.concat(t.explicit));
  else
    throw new Sr("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  r.forEach(function(o) {
    if (!(o instanceof ki))
      throw new Sr("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new Sr("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new Sr("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), n.forEach(function(o) {
    if (!(o instanceof ki))
      throw new Sr("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var i = Object.create(yo.prototype);
  return i.implicit = (this.implicit || []).concat(r), i.explicit = (this.explicit || []).concat(n), i.compiledImplicit = us(i, "implicit"), i.compiledExplicit = us(i, "explicit"), i.compiledTypeMap = Om(i.compiledImplicit, i.compiledExplicit), i;
};
var kc = yo, Im = Pe, Mc = new Im("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), Pm = Pe, Bc = new Pm("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), Nm = Pe, jc = new Nm("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), Dm = kc, Hc = new Dm({
  explicit: [
    Mc,
    Bc,
    jc
  ]
}), Fm = Pe;
function xm(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Lm() {
  return null;
}
function Um(e) {
  return e === null;
}
var qc = new Fm("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: xm,
  construct: Lm,
  predicate: Um,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
}), km = Pe;
function Mm(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function Bm(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function jm(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Gc = new km("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: Mm,
  construct: Bm,
  predicate: jm,
  represent: {
    lowercase: function(e) {
      return e ? "true" : "false";
    },
    uppercase: function(e) {
      return e ? "TRUE" : "FALSE";
    },
    camelcase: function(e) {
      return e ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
}), Hm = Ye, qm = Pe;
function Gm(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Vm(e) {
  return 48 <= e && e <= 55;
}
function Wm(e) {
  return 48 <= e && e <= 57;
}
function Ym(e) {
  if (e === null) return !1;
  var t = e.length, r = 0, n = !1, i;
  if (!t) return !1;
  if (i = e[r], (i === "-" || i === "+") && (i = e[++r]), i === "0") {
    if (r + 1 === t) return !0;
    if (i = e[++r], i === "b") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (i !== "0" && i !== "1") return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "x") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Gm(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "o") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Vm(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
  }
  if (i === "_") return !1;
  for (; r < t; r++)
    if (i = e[r], i !== "_") {
      if (!Wm(e.charCodeAt(r)))
        return !1;
      n = !0;
    }
  return !(!n || i === "_");
}
function zm(e) {
  var t = e, r = 1, n;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), n = t[0], (n === "-" || n === "+") && (n === "-" && (r = -1), t = t.slice(1), n = t[0]), t === "0") return 0;
  if (n === "0") {
    if (t[1] === "b") return r * parseInt(t.slice(2), 2);
    if (t[1] === "x") return r * parseInt(t.slice(2), 16);
    if (t[1] === "o") return r * parseInt(t.slice(2), 8);
  }
  return r * parseInt(t, 10);
}
function Xm(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !Hm.isNegativeZero(e);
}
var Vc = new qm("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: Ym,
  construct: zm,
  predicate: Xm,
  represent: {
    binary: function(e) {
      return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
    },
    octal: function(e) {
      return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
    },
    decimal: function(e) {
      return e.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(e) {
      return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
}), Wc = Ye, Km = Pe, Jm = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Qm(e) {
  return !(e === null || !Jm.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function Zm(e) {
  var t, r;
  return t = e.replace(/_/g, "").toLowerCase(), r = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? r === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : r * parseFloat(t, 10);
}
var eg = /^[-+]?[0-9]+e/;
function tg(e, t) {
  var r;
  if (isNaN(e))
    switch (t) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  else if (Number.POSITIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  else if (Number.NEGATIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  else if (Wc.isNegativeZero(e))
    return "-0.0";
  return r = e.toString(10), eg.test(r) ? r.replace("e", ".e") : r;
}
function rg(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || Wc.isNegativeZero(e));
}
var Yc = new Km("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Qm,
  construct: Zm,
  predicate: rg,
  represent: tg,
  defaultStyle: "lowercase"
}), zc = Hc.extend({
  implicit: [
    qc,
    Gc,
    Vc,
    Yc
  ]
}), Xc = zc, ng = Pe, Kc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Jc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function ig(e) {
  return e === null ? !1 : Kc.exec(e) !== null || Jc.exec(e) !== null;
}
function og(e) {
  var t, r, n, i, o, a, s, l = 0, h = null, c, f, g;
  if (t = Kc.exec(e), t === null && (t = Jc.exec(e)), t === null) throw new Error("Date resolve error");
  if (r = +t[1], n = +t[2] - 1, i = +t[3], !t[4])
    return new Date(Date.UTC(r, n, i));
  if (o = +t[4], a = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (c = +t[10], f = +(t[11] || 0), h = (c * 60 + f) * 6e4, t[9] === "-" && (h = -h)), g = new Date(Date.UTC(r, n, i, o, a, s, l)), h && g.setTime(g.getTime() - h), g;
}
function ag(e) {
  return e.toISOString();
}
var Qc = new ng("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: ig,
  construct: og,
  instanceOf: Date,
  represent: ag
}), sg = Pe;
function lg(e) {
  return e === "<<" || e === null;
}
var Zc = new sg("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: lg
}), cg = Pe, Wo = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function ug(e) {
  if (e === null) return !1;
  var t, r, n = 0, i = e.length, o = Wo;
  for (r = 0; r < i; r++)
    if (t = o.indexOf(e.charAt(r)), !(t > 64)) {
      if (t < 0) return !1;
      n += 6;
    }
  return n % 8 === 0;
}
function fg(e) {
  var t, r, n = e.replace(/[\r\n=]/g, ""), i = n.length, o = Wo, a = 0, s = [];
  for (t = 0; t < i; t++)
    t % 4 === 0 && t && (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)), a = a << 6 | o.indexOf(n.charAt(t));
  return r = i % 4 * 6, r === 0 ? (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)) : r === 18 ? (s.push(a >> 10 & 255), s.push(a >> 2 & 255)) : r === 12 && s.push(a >> 4 & 255), new Uint8Array(s);
}
function dg(e) {
  var t = "", r = 0, n, i, o = e.length, a = Wo;
  for (n = 0; n < o; n++)
    n % 3 === 0 && n && (t += a[r >> 18 & 63], t += a[r >> 12 & 63], t += a[r >> 6 & 63], t += a[r & 63]), r = (r << 8) + e[n];
  return i = o % 3, i === 0 ? (t += a[r >> 18 & 63], t += a[r >> 12 & 63], t += a[r >> 6 & 63], t += a[r & 63]) : i === 2 ? (t += a[r >> 10 & 63], t += a[r >> 4 & 63], t += a[r << 2 & 63], t += a[64]) : i === 1 && (t += a[r >> 2 & 63], t += a[r << 4 & 63], t += a[64], t += a[64]), t;
}
function hg(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var eu = new cg("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: ug,
  construct: fg,
  predicate: hg,
  represent: dg
}), pg = Pe, mg = Object.prototype.hasOwnProperty, gg = Object.prototype.toString;
function Eg(e) {
  if (e === null) return !0;
  var t = [], r, n, i, o, a, s = e;
  for (r = 0, n = s.length; r < n; r += 1) {
    if (i = s[r], a = !1, gg.call(i) !== "[object Object]") return !1;
    for (o in i)
      if (mg.call(i, o))
        if (!a) a = !0;
        else return !1;
    if (!a) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function yg(e) {
  return e !== null ? e : [];
}
var tu = new pg("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Eg,
  construct: yg
}), vg = Pe, wg = Object.prototype.toString;
function _g(e) {
  if (e === null) return !0;
  var t, r, n, i, o, a = e;
  for (o = new Array(a.length), t = 0, r = a.length; t < r; t += 1) {
    if (n = a[t], wg.call(n) !== "[object Object]" || (i = Object.keys(n), i.length !== 1)) return !1;
    o[t] = [i[0], n[i[0]]];
  }
  return !0;
}
function Ag(e) {
  if (e === null) return [];
  var t, r, n, i, o, a = e;
  for (o = new Array(a.length), t = 0, r = a.length; t < r; t += 1)
    n = a[t], i = Object.keys(n), o[t] = [i[0], n[i[0]]];
  return o;
}
var ru = new vg("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: _g,
  construct: Ag
}), Tg = Pe, Sg = Object.prototype.hasOwnProperty;
function Cg(e) {
  if (e === null) return !0;
  var t, r = e;
  for (t in r)
    if (Sg.call(r, t) && r[t] !== null)
      return !1;
  return !0;
}
function bg(e) {
  return e !== null ? e : {};
}
var nu = new Tg("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: Cg,
  construct: bg
}), Yo = Xc.extend({
  implicit: [
    Qc,
    Zc
  ],
  explicit: [
    eu,
    tu,
    ru,
    nu
  ]
}), Ft = Ye, iu = en, $g = Sm, Rg = Yo, vt = Object.prototype.hasOwnProperty, Hn = 1, ou = 2, au = 3, qn = 4, Mi = 1, Og = 2, fs = 3, Ig = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Pg = /[\x85\u2028\u2029]/, Ng = /[,\[\]\{\}]/, su = /^(?:!|!!|![a-z\-]+!)$/i, lu = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function ds(e) {
  return Object.prototype.toString.call(e);
}
function et(e) {
  return e === 10 || e === 13;
}
function Ut(e) {
  return e === 9 || e === 32;
}
function Fe(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function rr(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Dg(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function Fg(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function xg(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function hs(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function Lg(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function cu(e, t, r) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: r
  }) : e[t] = r;
}
var uu = new Array(256), fu = new Array(256);
for (var zt = 0; zt < 256; zt++)
  uu[zt] = hs(zt) ? 1 : 0, fu[zt] = hs(zt);
function Ug(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || Rg, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function du(e, t) {
  var r = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return r.snippet = $g(r), new iu(t, r);
}
function L(e, t) {
  throw du(e, t);
}
function Gn(e, t) {
  e.onWarning && e.onWarning.call(null, du(e, t));
}
var ps = {
  YAML: function(t, r, n) {
    var i, o, a;
    t.version !== null && L(t, "duplication of %YAML directive"), n.length !== 1 && L(t, "YAML directive accepts exactly one argument"), i = /^([0-9]+)\.([0-9]+)$/.exec(n[0]), i === null && L(t, "ill-formed argument of the YAML directive"), o = parseInt(i[1], 10), a = parseInt(i[2], 10), o !== 1 && L(t, "unacceptable YAML version of the document"), t.version = n[0], t.checkLineBreaks = a < 2, a !== 1 && a !== 2 && Gn(t, "unsupported YAML version of the document");
  },
  TAG: function(t, r, n) {
    var i, o;
    n.length !== 2 && L(t, "TAG directive accepts exactly two arguments"), i = n[0], o = n[1], su.test(i) || L(t, "ill-formed tag handle (first argument) of the TAG directive"), vt.call(t.tagMap, i) && L(t, 'there is a previously declared suffix for "' + i + '" tag handle'), lu.test(o) || L(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      o = decodeURIComponent(o);
    } catch {
      L(t, "tag prefix is malformed: " + o);
    }
    t.tagMap[i] = o;
  }
};
function gt(e, t, r, n) {
  var i, o, a, s;
  if (t < r) {
    if (s = e.input.slice(t, r), n)
      for (i = 0, o = s.length; i < o; i += 1)
        a = s.charCodeAt(i), a === 9 || 32 <= a && a <= 1114111 || L(e, "expected valid JSON character");
    else Ig.test(s) && L(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function ms(e, t, r, n) {
  var i, o, a, s;
  for (Ft.isObject(r) || L(e, "cannot merge mappings; the provided source object is unacceptable"), i = Object.keys(r), a = 0, s = i.length; a < s; a += 1)
    o = i[a], vt.call(t, o) || (cu(t, o, r[o]), n[o] = !0);
}
function nr(e, t, r, n, i, o, a, s, l) {
  var h, c;
  if (Array.isArray(i))
    for (i = Array.prototype.slice.call(i), h = 0, c = i.length; h < c; h += 1)
      Array.isArray(i[h]) && L(e, "nested arrays are not supported inside keys"), typeof i == "object" && ds(i[h]) === "[object Object]" && (i[h] = "[object Object]");
  if (typeof i == "object" && ds(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), n === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (h = 0, c = o.length; h < c; h += 1)
        ms(e, t, o[h], r);
    else
      ms(e, t, o, r);
  else
    !e.json && !vt.call(r, i) && vt.call(t, i) && (e.line = a || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, L(e, "duplicated mapping key")), cu(t, i, o), delete r[i];
  return t;
}
function zo(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : L(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function le(e, t, r) {
  for (var n = 0, i = e.input.charCodeAt(e.position); i !== 0; ) {
    for (; Ut(i); )
      i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
    if (t && i === 35)
      do
        i = e.input.charCodeAt(++e.position);
      while (i !== 10 && i !== 13 && i !== 0);
    if (et(i))
      for (zo(e), i = e.input.charCodeAt(e.position), n++, e.lineIndent = 0; i === 32; )
        e.lineIndent++, i = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return r !== -1 && n !== 0 && e.lineIndent < r && Gn(e, "deficient indentation"), n;
}
function ni(e) {
  var t = e.position, r;
  return r = e.input.charCodeAt(t), !!((r === 45 || r === 46) && r === e.input.charCodeAt(t + 1) && r === e.input.charCodeAt(t + 2) && (t += 3, r = e.input.charCodeAt(t), r === 0 || Fe(r)));
}
function Xo(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += Ft.repeat(`
`, t - 1));
}
function kg(e, t, r) {
  var n, i, o, a, s, l, h, c, f = e.kind, g = e.result, m;
  if (m = e.input.charCodeAt(e.position), Fe(m) || rr(m) || m === 35 || m === 38 || m === 42 || m === 33 || m === 124 || m === 62 || m === 39 || m === 34 || m === 37 || m === 64 || m === 96 || (m === 63 || m === 45) && (i = e.input.charCodeAt(e.position + 1), Fe(i) || r && rr(i)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = a = e.position, s = !1; m !== 0; ) {
    if (m === 58) {
      if (i = e.input.charCodeAt(e.position + 1), Fe(i) || r && rr(i))
        break;
    } else if (m === 35) {
      if (n = e.input.charCodeAt(e.position - 1), Fe(n))
        break;
    } else {
      if (e.position === e.lineStart && ni(e) || r && rr(m))
        break;
      if (et(m))
        if (l = e.line, h = e.lineStart, c = e.lineIndent, le(e, !1, -1), e.lineIndent >= t) {
          s = !0, m = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = a, e.line = l, e.lineStart = h, e.lineIndent = c;
          break;
        }
    }
    s && (gt(e, o, a, !1), Xo(e, e.line - l), o = a = e.position, s = !1), Ut(m) || (a = e.position + 1), m = e.input.charCodeAt(++e.position);
  }
  return gt(e, o, a, !1), e.result ? !0 : (e.kind = f, e.result = g, !1);
}
function Mg(e, t) {
  var r, n, i;
  if (r = e.input.charCodeAt(e.position), r !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (r = e.input.charCodeAt(e.position)) !== 0; )
    if (r === 39)
      if (gt(e, n, e.position, !0), r = e.input.charCodeAt(++e.position), r === 39)
        n = e.position, e.position++, i = e.position;
      else
        return !0;
    else et(r) ? (gt(e, n, i, !0), Xo(e, le(e, !1, t)), n = i = e.position) : e.position === e.lineStart && ni(e) ? L(e, "unexpected end of the document within a single quoted scalar") : (e.position++, i = e.position);
  L(e, "unexpected end of the stream within a single quoted scalar");
}
function Bg(e, t) {
  var r, n, i, o, a, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, r = n = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return gt(e, r, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (gt(e, r, e.position, !0), s = e.input.charCodeAt(++e.position), et(s))
        le(e, !1, t);
      else if (s < 256 && uu[s])
        e.result += fu[s], e.position++;
      else if ((a = Fg(s)) > 0) {
        for (i = a, o = 0; i > 0; i--)
          s = e.input.charCodeAt(++e.position), (a = Dg(s)) >= 0 ? o = (o << 4) + a : L(e, "expected hexadecimal character");
        e.result += Lg(o), e.position++;
      } else
        L(e, "unknown escape sequence");
      r = n = e.position;
    } else et(s) ? (gt(e, r, n, !0), Xo(e, le(e, !1, t)), r = n = e.position) : e.position === e.lineStart && ni(e) ? L(e, "unexpected end of the document within a double quoted scalar") : (e.position++, n = e.position);
  }
  L(e, "unexpected end of the stream within a double quoted scalar");
}
function jg(e, t) {
  var r = !0, n, i, o, a = e.tag, s, l = e.anchor, h, c, f, g, m, v = /* @__PURE__ */ Object.create(null), E, A, T, C;
  if (C = e.input.charCodeAt(e.position), C === 91)
    c = 93, m = !1, s = [];
  else if (C === 123)
    c = 125, m = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), C = e.input.charCodeAt(++e.position); C !== 0; ) {
    if (le(e, !0, t), C = e.input.charCodeAt(e.position), C === c)
      return e.position++, e.tag = a, e.anchor = l, e.kind = m ? "mapping" : "sequence", e.result = s, !0;
    r ? C === 44 && L(e, "expected the node content, but found ','") : L(e, "missed comma between flow collection entries"), A = E = T = null, f = g = !1, C === 63 && (h = e.input.charCodeAt(e.position + 1), Fe(h) && (f = g = !0, e.position++, le(e, !0, t))), n = e.line, i = e.lineStart, o = e.position, fr(e, t, Hn, !1, !0), A = e.tag, E = e.result, le(e, !0, t), C = e.input.charCodeAt(e.position), (g || e.line === n) && C === 58 && (f = !0, C = e.input.charCodeAt(++e.position), le(e, !0, t), fr(e, t, Hn, !1, !0), T = e.result), m ? nr(e, s, v, A, E, T, n, i, o) : f ? s.push(nr(e, null, v, A, E, T, n, i, o)) : s.push(E), le(e, !0, t), C = e.input.charCodeAt(e.position), C === 44 ? (r = !0, C = e.input.charCodeAt(++e.position)) : r = !1;
  }
  L(e, "unexpected end of the stream within a flow collection");
}
function Hg(e, t) {
  var r, n, i = Mi, o = !1, a = !1, s = t, l = 0, h = !1, c, f;
  if (f = e.input.charCodeAt(e.position), f === 124)
    n = !1;
  else if (f === 62)
    n = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; f !== 0; )
    if (f = e.input.charCodeAt(++e.position), f === 43 || f === 45)
      Mi === i ? i = f === 43 ? fs : Og : L(e, "repeat of a chomping mode identifier");
    else if ((c = xg(f)) >= 0)
      c === 0 ? L(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : a ? L(e, "repeat of an indentation width identifier") : (s = t + c - 1, a = !0);
    else
      break;
  if (Ut(f)) {
    do
      f = e.input.charCodeAt(++e.position);
    while (Ut(f));
    if (f === 35)
      do
        f = e.input.charCodeAt(++e.position);
      while (!et(f) && f !== 0);
  }
  for (; f !== 0; ) {
    for (zo(e), e.lineIndent = 0, f = e.input.charCodeAt(e.position); (!a || e.lineIndent < s) && f === 32; )
      e.lineIndent++, f = e.input.charCodeAt(++e.position);
    if (!a && e.lineIndent > s && (s = e.lineIndent), et(f)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      i === fs ? e.result += Ft.repeat(`
`, o ? 1 + l : l) : i === Mi && o && (e.result += `
`);
      break;
    }
    for (n ? Ut(f) ? (h = !0, e.result += Ft.repeat(`
`, o ? 1 + l : l)) : h ? (h = !1, e.result += Ft.repeat(`
`, l + 1)) : l === 0 ? o && (e.result += " ") : e.result += Ft.repeat(`
`, l) : e.result += Ft.repeat(`
`, o ? 1 + l : l), o = !0, a = !0, l = 0, r = e.position; !et(f) && f !== 0; )
      f = e.input.charCodeAt(++e.position);
    gt(e, r, e.position, !1);
  }
  return !0;
}
function gs(e, t) {
  var r, n = e.tag, i = e.anchor, o = [], a, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, L(e, "tab characters must not be used in indentation")), !(l !== 45 || (a = e.input.charCodeAt(e.position + 1), !Fe(a)))); ) {
    if (s = !0, e.position++, le(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (r = e.line, fr(e, t, au, !1, !0), o.push(e.result), le(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === r || e.lineIndent > t) && l !== 0)
      L(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = n, e.anchor = i, e.kind = "sequence", e.result = o, !0) : !1;
}
function qg(e, t, r) {
  var n, i, o, a, s, l, h = e.tag, c = e.anchor, f = {}, g = /* @__PURE__ */ Object.create(null), m = null, v = null, E = null, A = !1, T = !1, C;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = f), C = e.input.charCodeAt(e.position); C !== 0; ) {
    if (!A && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, L(e, "tab characters must not be used in indentation")), n = e.input.charCodeAt(e.position + 1), o = e.line, (C === 63 || C === 58) && Fe(n))
      C === 63 ? (A && (nr(e, f, g, m, v, null, a, s, l), m = v = E = null), T = !0, A = !0, i = !0) : A ? (A = !1, i = !0) : L(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, C = n;
    else {
      if (a = e.line, s = e.lineStart, l = e.position, !fr(e, r, ou, !1, !0))
        break;
      if (e.line === o) {
        for (C = e.input.charCodeAt(e.position); Ut(C); )
          C = e.input.charCodeAt(++e.position);
        if (C === 58)
          C = e.input.charCodeAt(++e.position), Fe(C) || L(e, "a whitespace character is expected after the key-value separator within a block mapping"), A && (nr(e, f, g, m, v, null, a, s, l), m = v = E = null), T = !0, A = !1, i = !1, m = e.tag, v = e.result;
        else if (T)
          L(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = h, e.anchor = c, !0;
      } else if (T)
        L(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = h, e.anchor = c, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (A && (a = e.line, s = e.lineStart, l = e.position), fr(e, t, qn, !0, i) && (A ? v = e.result : E = e.result), A || (nr(e, f, g, m, v, E, a, s, l), m = v = E = null), le(e, !0, -1), C = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && C !== 0)
      L(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return A && nr(e, f, g, m, v, null, a, s, l), T && (e.tag = h, e.anchor = c, e.kind = "mapping", e.result = f), T;
}
function Gg(e) {
  var t, r = !1, n = !1, i, o, a;
  if (a = e.input.charCodeAt(e.position), a !== 33) return !1;
  if (e.tag !== null && L(e, "duplication of a tag property"), a = e.input.charCodeAt(++e.position), a === 60 ? (r = !0, a = e.input.charCodeAt(++e.position)) : a === 33 ? (n = !0, i = "!!", a = e.input.charCodeAt(++e.position)) : i = "!", t = e.position, r) {
    do
      a = e.input.charCodeAt(++e.position);
    while (a !== 0 && a !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), a = e.input.charCodeAt(++e.position)) : L(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; a !== 0 && !Fe(a); )
      a === 33 && (n ? L(e, "tag suffix cannot contain exclamation marks") : (i = e.input.slice(t - 1, e.position + 1), su.test(i) || L(e, "named tag handle cannot contain such characters"), n = !0, t = e.position + 1)), a = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), Ng.test(o) && L(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !lu.test(o) && L(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    L(e, "tag name is malformed: " + o);
  }
  return r ? e.tag = o : vt.call(e.tagMap, i) ? e.tag = e.tagMap[i] + o : i === "!" ? e.tag = "!" + o : i === "!!" ? e.tag = "tag:yaml.org,2002:" + o : L(e, 'undeclared tag handle "' + i + '"'), !0;
}
function Vg(e) {
  var t, r;
  if (r = e.input.charCodeAt(e.position), r !== 38) return !1;
  for (e.anchor !== null && L(e, "duplication of an anchor property"), r = e.input.charCodeAt(++e.position), t = e.position; r !== 0 && !Fe(r) && !rr(r); )
    r = e.input.charCodeAt(++e.position);
  return e.position === t && L(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function Wg(e) {
  var t, r, n;
  if (n = e.input.charCodeAt(e.position), n !== 42) return !1;
  for (n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !Fe(n) && !rr(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && L(e, "name of an alias node must contain at least one character"), r = e.input.slice(t, e.position), vt.call(e.anchorMap, r) || L(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], le(e, !0, -1), !0;
}
function fr(e, t, r, n, i) {
  var o, a, s, l = 1, h = !1, c = !1, f, g, m, v, E, A;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = a = s = qn === r || au === r, n && le(e, !0, -1) && (h = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; Gg(e) || Vg(e); )
      le(e, !0, -1) ? (h = !0, s = o, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = h || i), (l === 1 || qn === r) && (Hn === r || ou === r ? E = t : E = t + 1, A = e.position - e.lineStart, l === 1 ? s && (gs(e, A) || qg(e, A, E)) || jg(e, E) ? c = !0 : (a && Hg(e, E) || Mg(e, E) || Bg(e, E) ? c = !0 : Wg(e) ? (c = !0, (e.tag !== null || e.anchor !== null) && L(e, "alias node should not have any properties")) : kg(e, E, Hn === r) && (c = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (c = s && gs(e, A))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && L(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), f = 0, g = e.implicitTypes.length; f < g; f += 1)
      if (v = e.implicitTypes[f], v.resolve(e.result)) {
        e.result = v.construct(e.result), e.tag = v.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (vt.call(e.typeMap[e.kind || "fallback"], e.tag))
      v = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (v = null, m = e.typeMap.multi[e.kind || "fallback"], f = 0, g = m.length; f < g; f += 1)
        if (e.tag.slice(0, m[f].tag.length) === m[f].tag) {
          v = m[f];
          break;
        }
    v || L(e, "unknown tag !<" + e.tag + ">"), e.result !== null && v.kind !== e.kind && L(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + v.kind + '", not "' + e.kind + '"'), v.resolve(e.result, e.tag) ? (e.result = v.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : L(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || c;
}
function Yg(e) {
  var t = e.position, r, n, i, o = !1, a;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (a = e.input.charCodeAt(e.position)) !== 0 && (le(e, !0, -1), a = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || a !== 37)); ) {
    for (o = !0, a = e.input.charCodeAt(++e.position), r = e.position; a !== 0 && !Fe(a); )
      a = e.input.charCodeAt(++e.position);
    for (n = e.input.slice(r, e.position), i = [], n.length < 1 && L(e, "directive name must not be less than one character in length"); a !== 0; ) {
      for (; Ut(a); )
        a = e.input.charCodeAt(++e.position);
      if (a === 35) {
        do
          a = e.input.charCodeAt(++e.position);
        while (a !== 0 && !et(a));
        break;
      }
      if (et(a)) break;
      for (r = e.position; a !== 0 && !Fe(a); )
        a = e.input.charCodeAt(++e.position);
      i.push(e.input.slice(r, e.position));
    }
    a !== 0 && zo(e), vt.call(ps, n) ? ps[n](e, n, i) : Gn(e, 'unknown document directive "' + n + '"');
  }
  if (le(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, le(e, !0, -1)) : o && L(e, "directives end mark is expected"), fr(e, e.lineIndent - 1, qn, !1, !0), le(e, !0, -1), e.checkLineBreaks && Pg.test(e.input.slice(t, e.position)) && Gn(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && ni(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, le(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    L(e, "end of the stream or a document separator is expected");
  else
    return;
}
function hu(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var r = new Ug(e, t), n = e.indexOf("\0");
  for (n !== -1 && (r.position = n, L(r, "null byte is not allowed in input")), r.input += "\0"; r.input.charCodeAt(r.position) === 32; )
    r.lineIndent += 1, r.position += 1;
  for (; r.position < r.length - 1; )
    Yg(r);
  return r.documents;
}
function zg(e, t, r) {
  t !== null && typeof t == "object" && typeof r > "u" && (r = t, t = null);
  var n = hu(e, r);
  if (typeof t != "function")
    return n;
  for (var i = 0, o = n.length; i < o; i += 1)
    t(n[i]);
}
function Xg(e, t) {
  var r = hu(e, t);
  if (r.length !== 0) {
    if (r.length === 1)
      return r[0];
    throw new iu("expected a single document in the stream, but found more");
  }
}
Vo.loadAll = zg;
Vo.load = Xg;
var pu = {}, ii = Ye, tn = en, Kg = Yo, mu = Object.prototype.toString, gu = Object.prototype.hasOwnProperty, Ko = 65279, Jg = 9, Mr = 10, Qg = 13, Zg = 32, e0 = 33, t0 = 34, vo = 35, r0 = 37, n0 = 38, i0 = 39, o0 = 42, Eu = 44, a0 = 45, Vn = 58, s0 = 61, l0 = 62, c0 = 63, u0 = 64, yu = 91, vu = 93, f0 = 96, wu = 123, d0 = 124, _u = 125, Ce = {};
Ce[0] = "\\0";
Ce[7] = "\\a";
Ce[8] = "\\b";
Ce[9] = "\\t";
Ce[10] = "\\n";
Ce[11] = "\\v";
Ce[12] = "\\f";
Ce[13] = "\\r";
Ce[27] = "\\e";
Ce[34] = '\\"';
Ce[92] = "\\\\";
Ce[133] = "\\N";
Ce[160] = "\\_";
Ce[8232] = "\\L";
Ce[8233] = "\\P";
var h0 = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
], p0 = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function m0(e, t) {
  var r, n, i, o, a, s, l;
  if (t === null) return {};
  for (r = {}, n = Object.keys(t), i = 0, o = n.length; i < o; i += 1)
    a = n[i], s = String(t[a]), a.slice(0, 2) === "!!" && (a = "tag:yaml.org,2002:" + a.slice(2)), l = e.compiledTypeMap.fallback[a], l && gu.call(l.styleAliases, s) && (s = l.styleAliases[s]), r[a] = s;
  return r;
}
function g0(e) {
  var t, r, n;
  if (t = e.toString(16).toUpperCase(), e <= 255)
    r = "x", n = 2;
  else if (e <= 65535)
    r = "u", n = 4;
  else if (e <= 4294967295)
    r = "U", n = 8;
  else
    throw new tn("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + r + ii.repeat("0", n - t.length) + t;
}
var E0 = 1, Br = 2;
function y0(e) {
  this.schema = e.schema || Kg, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = ii.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = m0(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? Br : E0, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
function Es(e, t) {
  for (var r = ii.repeat(" ", t), n = 0, i = -1, o = "", a, s = e.length; n < s; )
    i = e.indexOf(`
`, n), i === -1 ? (a = e.slice(n), n = s) : (a = e.slice(n, i + 1), n = i + 1), a.length && a !== `
` && (o += r), o += a;
  return o;
}
function wo(e, t) {
  return `
` + ii.repeat(" ", e.indent * t);
}
function v0(e, t) {
  var r, n, i;
  for (r = 0, n = e.implicitTypes.length; r < n; r += 1)
    if (i = e.implicitTypes[r], i.resolve(t))
      return !0;
  return !1;
}
function Wn(e) {
  return e === Zg || e === Jg;
}
function jr(e) {
  return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && e !== 8232 && e !== 8233 || 57344 <= e && e <= 65533 && e !== Ko || 65536 <= e && e <= 1114111;
}
function ys(e) {
  return jr(e) && e !== Ko && e !== Qg && e !== Mr;
}
function vs(e, t, r) {
  var n = ys(e), i = n && !Wn(e);
  return (
    // ns-plain-safe
    (r ? (
      // c = flow-in
      n
    ) : n && e !== Eu && e !== yu && e !== vu && e !== wu && e !== _u) && e !== vo && !(t === Vn && !i) || ys(t) && !Wn(t) && e === vo || t === Vn && i
  );
}
function w0(e) {
  return jr(e) && e !== Ko && !Wn(e) && e !== a0 && e !== c0 && e !== Vn && e !== Eu && e !== yu && e !== vu && e !== wu && e !== _u && e !== vo && e !== n0 && e !== o0 && e !== e0 && e !== d0 && e !== s0 && e !== l0 && e !== i0 && e !== t0 && e !== r0 && e !== u0 && e !== f0;
}
function _0(e) {
  return !Wn(e) && e !== Vn;
}
function Rr(e, t) {
  var r = e.charCodeAt(t), n;
  return r >= 55296 && r <= 56319 && t + 1 < e.length && (n = e.charCodeAt(t + 1), n >= 56320 && n <= 57343) ? (r - 55296) * 1024 + n - 56320 + 65536 : r;
}
function Au(e) {
  var t = /^\n* /;
  return t.test(e);
}
var Tu = 1, _o = 2, Su = 3, Cu = 4, Zt = 5;
function A0(e, t, r, n, i, o, a, s) {
  var l, h = 0, c = null, f = !1, g = !1, m = n !== -1, v = -1, E = w0(Rr(e, 0)) && _0(Rr(e, e.length - 1));
  if (t || a)
    for (l = 0; l < e.length; h >= 65536 ? l += 2 : l++) {
      if (h = Rr(e, l), !jr(h))
        return Zt;
      E = E && vs(h, c, s), c = h;
    }
  else {
    for (l = 0; l < e.length; h >= 65536 ? l += 2 : l++) {
      if (h = Rr(e, l), h === Mr)
        f = !0, m && (g = g || // Foldable line = too long, and not more-indented.
        l - v - 1 > n && e[v + 1] !== " ", v = l);
      else if (!jr(h))
        return Zt;
      E = E && vs(h, c, s), c = h;
    }
    g = g || m && l - v - 1 > n && e[v + 1] !== " ";
  }
  return !f && !g ? E && !a && !i(e) ? Tu : o === Br ? Zt : _o : r > 9 && Au(e) ? Zt : a ? o === Br ? Zt : _o : g ? Cu : Su;
}
function T0(e, t, r, n, i) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === Br ? '""' : "''";
    if (!e.noCompatMode && (h0.indexOf(t) !== -1 || p0.test(t)))
      return e.quotingType === Br ? '"' + t + '"' : "'" + t + "'";
    var o = e.indent * Math.max(1, r), a = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o), s = n || e.flowLevel > -1 && r >= e.flowLevel;
    function l(h) {
      return v0(e, h);
    }
    switch (A0(
      t,
      s,
      e.indent,
      a,
      l,
      e.quotingType,
      e.forceQuotes && !n,
      i
    )) {
      case Tu:
        return t;
      case _o:
        return "'" + t.replace(/'/g, "''") + "'";
      case Su:
        return "|" + ws(t, e.indent) + _s(Es(t, o));
      case Cu:
        return ">" + ws(t, e.indent) + _s(Es(S0(t, a), o));
      case Zt:
        return '"' + C0(t) + '"';
      default:
        throw new tn("impossible error: invalid scalar style");
    }
  }();
}
function ws(e, t) {
  var r = Au(e) ? String(t) : "", n = e[e.length - 1] === `
`, i = n && (e[e.length - 2] === `
` || e === `
`), o = i ? "+" : n ? "" : "-";
  return r + o + `
`;
}
function _s(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
function S0(e, t) {
  for (var r = /(\n+)([^\n]*)/g, n = function() {
    var h = e.indexOf(`
`);
    return h = h !== -1 ? h : e.length, r.lastIndex = h, As(e.slice(0, h), t);
  }(), i = e[0] === `
` || e[0] === " ", o, a; a = r.exec(e); ) {
    var s = a[1], l = a[2];
    o = l[0] === " ", n += s + (!i && !o && l !== "" ? `
` : "") + As(l, t), i = o;
  }
  return n;
}
function As(e, t) {
  if (e === "" || e[0] === " ") return e;
  for (var r = / [^ ]/g, n, i = 0, o, a = 0, s = 0, l = ""; n = r.exec(e); )
    s = n.index, s - i > t && (o = a > i ? a : s, l += `
` + e.slice(i, o), i = o + 1), a = s;
  return l += `
`, e.length - i > t && a > i ? l += e.slice(i, a) + `
` + e.slice(a + 1) : l += e.slice(i), l.slice(1);
}
function C0(e) {
  for (var t = "", r = 0, n, i = 0; i < e.length; r >= 65536 ? i += 2 : i++)
    r = Rr(e, i), n = Ce[r], !n && jr(r) ? (t += e[i], r >= 65536 && (t += e[i + 1])) : t += n || g0(r);
  return t;
}
function b0(e, t, r) {
  var n = "", i = e.tag, o, a, s;
  for (o = 0, a = r.length; o < a; o += 1)
    s = r[o], e.replacer && (s = e.replacer.call(r, String(o), s)), (at(e, t, s, !1, !1) || typeof s > "u" && at(e, t, null, !1, !1)) && (n !== "" && (n += "," + (e.condenseFlow ? "" : " ")), n += e.dump);
  e.tag = i, e.dump = "[" + n + "]";
}
function Ts(e, t, r, n) {
  var i = "", o = e.tag, a, s, l;
  for (a = 0, s = r.length; a < s; a += 1)
    l = r[a], e.replacer && (l = e.replacer.call(r, String(a), l)), (at(e, t + 1, l, !0, !0, !1, !0) || typeof l > "u" && at(e, t + 1, null, !0, !0, !1, !0)) && ((!n || i !== "") && (i += wo(e, t)), e.dump && Mr === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
  e.tag = o, e.dump = i || "[]";
}
function $0(e, t, r) {
  var n = "", i = e.tag, o = Object.keys(r), a, s, l, h, c;
  for (a = 0, s = o.length; a < s; a += 1)
    c = "", n !== "" && (c += ", "), e.condenseFlow && (c += '"'), l = o[a], h = r[l], e.replacer && (h = e.replacer.call(r, l, h)), at(e, t, l, !1, !1) && (e.dump.length > 1024 && (c += "? "), c += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), at(e, t, h, !1, !1) && (c += e.dump, n += c));
  e.tag = i, e.dump = "{" + n + "}";
}
function R0(e, t, r, n) {
  var i = "", o = e.tag, a = Object.keys(r), s, l, h, c, f, g;
  if (e.sortKeys === !0)
    a.sort();
  else if (typeof e.sortKeys == "function")
    a.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new tn("sortKeys must be a boolean or a function");
  for (s = 0, l = a.length; s < l; s += 1)
    g = "", (!n || i !== "") && (g += wo(e, t)), h = a[s], c = r[h], e.replacer && (c = e.replacer.call(r, h, c)), at(e, t + 1, h, !0, !0, !0) && (f = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024, f && (e.dump && Mr === e.dump.charCodeAt(0) ? g += "?" : g += "? "), g += e.dump, f && (g += wo(e, t)), at(e, t + 1, c, !0, f) && (e.dump && Mr === e.dump.charCodeAt(0) ? g += ":" : g += ": ", g += e.dump, i += g));
  e.tag = o, e.dump = i || "{}";
}
function Ss(e, t, r) {
  var n, i, o, a, s, l;
  for (i = r ? e.explicitTypes : e.implicitTypes, o = 0, a = i.length; o < a; o += 1)
    if (s = i[o], (s.instanceOf || s.predicate) && (!s.instanceOf || typeof t == "object" && t instanceof s.instanceOf) && (!s.predicate || s.predicate(t))) {
      if (r ? s.multi && s.representName ? e.tag = s.representName(t) : e.tag = s.tag : e.tag = "?", s.represent) {
        if (l = e.styleMap[s.tag] || s.defaultStyle, mu.call(s.represent) === "[object Function]")
          n = s.represent(t, l);
        else if (gu.call(s.represent, l))
          n = s.represent[l](t, l);
        else
          throw new tn("!<" + s.tag + '> tag resolver accepts not "' + l + '" style');
        e.dump = n;
      }
      return !0;
    }
  return !1;
}
function at(e, t, r, n, i, o, a) {
  e.tag = null, e.dump = r, Ss(e, r, !1) || Ss(e, r, !0);
  var s = mu.call(e.dump), l = n, h;
  n && (n = e.flowLevel < 0 || e.flowLevel > t);
  var c = s === "[object Object]" || s === "[object Array]", f, g;
  if (c && (f = e.duplicates.indexOf(r), g = f !== -1), (e.tag !== null && e.tag !== "?" || g || e.indent !== 2 && t > 0) && (i = !1), g && e.usedDuplicates[f])
    e.dump = "*ref_" + f;
  else {
    if (c && g && !e.usedDuplicates[f] && (e.usedDuplicates[f] = !0), s === "[object Object]")
      n && Object.keys(e.dump).length !== 0 ? (R0(e, t, e.dump, i), g && (e.dump = "&ref_" + f + e.dump)) : ($0(e, t, e.dump), g && (e.dump = "&ref_" + f + " " + e.dump));
    else if (s === "[object Array]")
      n && e.dump.length !== 0 ? (e.noArrayIndent && !a && t > 0 ? Ts(e, t - 1, e.dump, i) : Ts(e, t, e.dump, i), g && (e.dump = "&ref_" + f + e.dump)) : (b0(e, t, e.dump), g && (e.dump = "&ref_" + f + " " + e.dump));
    else if (s === "[object String]")
      e.tag !== "?" && T0(e, e.dump, t, o, l);
    else {
      if (s === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new tn("unacceptable kind of an object to dump " + s);
    }
    e.tag !== null && e.tag !== "?" && (h = encodeURI(
      e.tag[0] === "!" ? e.tag.slice(1) : e.tag
    ).replace(/!/g, "%21"), e.tag[0] === "!" ? h = "!" + h : h.slice(0, 18) === "tag:yaml.org,2002:" ? h = "!!" + h.slice(18) : h = "!<" + h + ">", e.dump = h + " " + e.dump);
  }
  return !0;
}
function O0(e, t) {
  var r = [], n = [], i, o;
  for (Ao(e, r, n), i = 0, o = n.length; i < o; i += 1)
    t.duplicates.push(r[n[i]]);
  t.usedDuplicates = new Array(o);
}
function Ao(e, t, r) {
  var n, i, o;
  if (e !== null && typeof e == "object")
    if (i = t.indexOf(e), i !== -1)
      r.indexOf(i) === -1 && r.push(i);
    else if (t.push(e), Array.isArray(e))
      for (i = 0, o = e.length; i < o; i += 1)
        Ao(e[i], t, r);
    else
      for (n = Object.keys(e), i = 0, o = n.length; i < o; i += 1)
        Ao(e[n[i]], t, r);
}
function I0(e, t) {
  t = t || {};
  var r = new y0(t);
  r.noRefs || O0(e, r);
  var n = e;
  return r.replacer && (n = r.replacer.call({ "": n }, "", n)), at(r, 0, n, !0, !0) ? r.dump + `
` : "";
}
pu.dump = I0;
var bu = Vo, P0 = pu;
function Jo(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
ve.Type = Pe;
ve.Schema = kc;
ve.FAILSAFE_SCHEMA = Hc;
ve.JSON_SCHEMA = zc;
ve.CORE_SCHEMA = Xc;
ve.DEFAULT_SCHEMA = Yo;
ve.load = bu.load;
ve.loadAll = bu.loadAll;
ve.dump = P0.dump;
ve.YAMLException = en;
ve.types = {
  binary: eu,
  float: Yc,
  map: jc,
  null: qc,
  pairs: ru,
  set: nu,
  timestamp: Qc,
  bool: Gc,
  int: Vc,
  merge: Zc,
  omap: tu,
  seq: Bc,
  str: Mc
};
ve.safeLoad = Jo("safeLoad", "load");
ve.safeLoadAll = Jo("safeLoadAll", "loadAll");
ve.safeDump = Jo("safeDump", "dump");
var oi = {};
Object.defineProperty(oi, "__esModule", { value: !0 });
oi.Lazy = void 0;
class N0 {
  constructor(t) {
    this._value = null, this.creator = t;
  }
  get hasValue() {
    return this.creator == null;
  }
  get value() {
    if (this.creator == null)
      return this._value;
    const t = this.creator();
    return this.value = t, t;
  }
  set value(t) {
    this._value = t, this.creator = null;
  }
}
oi.Lazy = N0;
var To = { exports: {} };
const D0 = "2.0.0", $u = 256, F0 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, x0 = 16, L0 = $u - 6, U0 = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ai = {
  MAX_LENGTH: $u,
  MAX_SAFE_COMPONENT_LENGTH: x0,
  MAX_SAFE_BUILD_LENGTH: L0,
  MAX_SAFE_INTEGER: F0,
  RELEASE_TYPES: U0,
  SEMVER_SPEC_VERSION: D0,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const k0 = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var si = k0;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: i
  } = ai, o = si;
  t = e.exports = {};
  const a = t.re = [], s = t.safeRe = [], l = t.src = [], h = t.safeSrc = [], c = t.t = {};
  let f = 0;
  const g = "[a-zA-Z0-9-]", m = [
    ["\\s", 1],
    ["\\d", i],
    [g, n]
  ], v = (A) => {
    for (const [T, C] of m)
      A = A.split(`${T}*`).join(`${T}{0,${C}}`).split(`${T}+`).join(`${T}{1,${C}}`);
    return A;
  }, E = (A, T, C) => {
    const D = v(T), B = f++;
    o(A, B, T), c[A] = B, l[B] = T, h[B] = D, a[B] = new RegExp(T, C ? "g" : void 0), s[B] = new RegExp(D, C ? "g" : void 0);
  };
  E("NUMERICIDENTIFIER", "0|[1-9]\\d*"), E("NUMERICIDENTIFIERLOOSE", "\\d+"), E("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${g}*`), E("MAINVERSION", `(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})`), E("MAINVERSIONLOOSE", `(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASEIDENTIFIER", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIER]})`), E("PRERELEASEIDENTIFIERLOOSE", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASE", `(?:-(${l[c.PRERELEASEIDENTIFIER]}(?:\\.${l[c.PRERELEASEIDENTIFIER]})*))`), E("PRERELEASELOOSE", `(?:-?(${l[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[c.PRERELEASEIDENTIFIERLOOSE]})*))`), E("BUILDIDENTIFIER", `${g}+`), E("BUILD", `(?:\\+(${l[c.BUILDIDENTIFIER]}(?:\\.${l[c.BUILDIDENTIFIER]})*))`), E("FULLPLAIN", `v?${l[c.MAINVERSION]}${l[c.PRERELEASE]}?${l[c.BUILD]}?`), E("FULL", `^${l[c.FULLPLAIN]}$`), E("LOOSEPLAIN", `[v=\\s]*${l[c.MAINVERSIONLOOSE]}${l[c.PRERELEASELOOSE]}?${l[c.BUILD]}?`), E("LOOSE", `^${l[c.LOOSEPLAIN]}$`), E("GTLT", "((?:<|>)?=?)"), E("XRANGEIDENTIFIERLOOSE", `${l[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), E("XRANGEIDENTIFIER", `${l[c.NUMERICIDENTIFIER]}|x|X|\\*`), E("XRANGEPLAIN", `[v=\\s]*(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:${l[c.PRERELEASE]})?${l[c.BUILD]}?)?)?`), E("XRANGEPLAINLOOSE", `[v=\\s]*(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:${l[c.PRERELEASELOOSE]})?${l[c.BUILD]}?)?)?`), E("XRANGE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAIN]}$`), E("XRANGELOOSE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAINLOOSE]}$`), E("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), E("COERCE", `${l[c.COERCEPLAIN]}(?:$|[^\\d])`), E("COERCEFULL", l[c.COERCEPLAIN] + `(?:${l[c.PRERELEASE]})?(?:${l[c.BUILD]})?(?:$|[^\\d])`), E("COERCERTL", l[c.COERCE], !0), E("COERCERTLFULL", l[c.COERCEFULL], !0), E("LONETILDE", "(?:~>?)"), E("TILDETRIM", `(\\s*)${l[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", E("TILDE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAIN]}$`), E("TILDELOOSE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAINLOOSE]}$`), E("LONECARET", "(?:\\^)"), E("CARETTRIM", `(\\s*)${l[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", E("CARET", `^${l[c.LONECARET]}${l[c.XRANGEPLAIN]}$`), E("CARETLOOSE", `^${l[c.LONECARET]}${l[c.XRANGEPLAINLOOSE]}$`), E("COMPARATORLOOSE", `^${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]})$|^$`), E("COMPARATOR", `^${l[c.GTLT]}\\s*(${l[c.FULLPLAIN]})$|^$`), E("COMPARATORTRIM", `(\\s*)${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]}|${l[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", E("HYPHENRANGE", `^\\s*(${l[c.XRANGEPLAIN]})\\s+-\\s+(${l[c.XRANGEPLAIN]})\\s*$`), E("HYPHENRANGELOOSE", `^\\s*(${l[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[c.XRANGEPLAINLOOSE]})\\s*$`), E("STAR", "(<|>)?=?\\s*\\*"), E("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), E("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(To, To.exports);
var rn = To.exports;
const M0 = Object.freeze({ loose: !0 }), B0 = Object.freeze({}), j0 = (e) => e ? typeof e != "object" ? M0 : e : B0;
var Qo = j0;
const Cs = /^[0-9]+$/, Ru = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const r = Cs.test(e), n = Cs.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, H0 = (e, t) => Ru(t, e);
var Ou = {
  compareIdentifiers: Ru,
  rcompareIdentifiers: H0
};
const Tn = si, { MAX_LENGTH: bs, MAX_SAFE_INTEGER: Sn } = ai, { safeRe: Cn, t: bn } = rn, q0 = Qo, { compareIdentifiers: Bi } = Ou;
let G0 = class Qe {
  constructor(t, r) {
    if (r = q0(r), t instanceof Qe) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > bs)
      throw new TypeError(
        `version is longer than ${bs} characters`
      );
    Tn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? Cn[bn.LOOSE] : Cn[bn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > Sn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Sn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Sn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const o = +i;
        if (o >= 0 && o < Sn)
          return o;
      }
      return i;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (Tn("SemVer.compare", this.version, this.options, t), !(t instanceof Qe)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new Qe(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof Qe || (t = new Qe(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof Qe || (t = new Qe(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], i = t.prerelease[r];
      if (Tn("prerelease compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Bi(n, i);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof Qe || (t = new Qe(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], i = t.build[r];
      if (Tn("build compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Bi(n, i);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const i = `-${r}`.match(this.options.loose ? Cn[bn.PRERELEASELOOSE] : Cn[bn.PRERELEASE]);
        if (!i || i[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const i = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [i];
        else {
          let o = this.prerelease.length;
          for (; --o >= 0; )
            typeof this.prerelease[o] == "number" && (this.prerelease[o]++, o = -2);
          if (o === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(i);
          }
        }
        if (r) {
          let o = [r, i];
          n === !1 && (o = [r]), Bi(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = o) : this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ne = G0;
const $s = Ne, V0 = (e, t, r = !1) => {
  if (e instanceof $s)
    return e;
  try {
    return new $s(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var pr = V0;
const W0 = pr, Y0 = (e, t) => {
  const r = W0(e, t);
  return r ? r.version : null;
};
var z0 = Y0;
const X0 = pr, K0 = (e, t) => {
  const r = X0(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var J0 = K0;
const Rs = Ne, Q0 = (e, t, r, n, i) => {
  typeof r == "string" && (i = n, n = r, r = void 0);
  try {
    return new Rs(
      e instanceof Rs ? e.version : e,
      r
    ).inc(t, n, i).version;
  } catch {
    return null;
  }
};
var Z0 = Q0;
const Os = pr, eE = (e, t) => {
  const r = Os(e, null, !0), n = Os(t, null, !0), i = r.compare(n);
  if (i === 0)
    return null;
  const o = i > 0, a = o ? r : n, s = o ? n : r, l = !!a.prerelease.length;
  if (!!s.prerelease.length && !l) {
    if (!s.patch && !s.minor)
      return "major";
    if (s.compareMain(a) === 0)
      return s.minor && !s.patch ? "minor" : "patch";
  }
  const c = l ? "pre" : "";
  return r.major !== n.major ? c + "major" : r.minor !== n.minor ? c + "minor" : r.patch !== n.patch ? c + "patch" : "prerelease";
};
var tE = eE;
const rE = Ne, nE = (e, t) => new rE(e, t).major;
var iE = nE;
const oE = Ne, aE = (e, t) => new oE(e, t).minor;
var sE = aE;
const lE = Ne, cE = (e, t) => new lE(e, t).patch;
var uE = cE;
const fE = pr, dE = (e, t) => {
  const r = fE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var hE = dE;
const Is = Ne, pE = (e, t, r) => new Is(e, r).compare(new Is(t, r));
var ze = pE;
const mE = ze, gE = (e, t, r) => mE(t, e, r);
var EE = gE;
const yE = ze, vE = (e, t) => yE(e, t, !0);
var wE = vE;
const Ps = Ne, _E = (e, t, r) => {
  const n = new Ps(e, r), i = new Ps(t, r);
  return n.compare(i) || n.compareBuild(i);
};
var Zo = _E;
const AE = Zo, TE = (e, t) => e.sort((r, n) => AE(r, n, t));
var SE = TE;
const CE = Zo, bE = (e, t) => e.sort((r, n) => CE(n, r, t));
var $E = bE;
const RE = ze, OE = (e, t, r) => RE(e, t, r) > 0;
var li = OE;
const IE = ze, PE = (e, t, r) => IE(e, t, r) < 0;
var ea = PE;
const NE = ze, DE = (e, t, r) => NE(e, t, r) === 0;
var Iu = DE;
const FE = ze, xE = (e, t, r) => FE(e, t, r) !== 0;
var Pu = xE;
const LE = ze, UE = (e, t, r) => LE(e, t, r) >= 0;
var ta = UE;
const kE = ze, ME = (e, t, r) => kE(e, t, r) <= 0;
var ra = ME;
const BE = Iu, jE = Pu, HE = li, qE = ta, GE = ea, VE = ra, WE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return BE(e, r, n);
    case "!=":
      return jE(e, r, n);
    case ">":
      return HE(e, r, n);
    case ">=":
      return qE(e, r, n);
    case "<":
      return GE(e, r, n);
    case "<=":
      return VE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Nu = WE;
const YE = Ne, zE = pr, { safeRe: $n, t: Rn } = rn, XE = (e, t) => {
  if (e instanceof YE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? $n[Rn.COERCEFULL] : $n[Rn.COERCE]);
  else {
    const l = t.includePrerelease ? $n[Rn.COERCERTLFULL] : $n[Rn.COERCERTL];
    let h;
    for (; (h = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || h.index + h[0].length !== r.index + r[0].length) && (r = h), l.lastIndex = h.index + h[1].length + h[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], i = r[3] || "0", o = r[4] || "0", a = t.includePrerelease && r[5] ? `-${r[5]}` : "", s = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return zE(`${n}.${i}.${o}${a}${s}`, t);
};
var KE = XE;
class JE {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const i = this.map.keys().next().value;
        this.delete(i);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var QE = JE, ji, Ns;
function Xe() {
  if (Ns) return ji;
  Ns = 1;
  const e = /\s+/g;
  class t {
    constructor(R, P) {
      if (P = i(P), R instanceof t)
        return R.loose === !!P.loose && R.includePrerelease === !!P.includePrerelease ? R : new t(R.raw, P);
      if (R instanceof o)
        return this.raw = R.value, this.set = [[R]], this.formatted = void 0, this;
      if (this.options = P, this.loose = !!P.loose, this.includePrerelease = !!P.includePrerelease, this.raw = R.trim().replace(e, " "), this.set = this.raw.split("||").map(($) => this.parseRange($.trim())).filter(($) => $.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const $ = this.set[0];
        if (this.set = this.set.filter((N) => !E(N[0])), this.set.length === 0)
          this.set = [$];
        else if (this.set.length > 1) {
          for (const N of this.set)
            if (N.length === 1 && A(N[0])) {
              this.set = [N];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let R = 0; R < this.set.length; R++) {
          R > 0 && (this.formatted += "||");
          const P = this.set[R];
          for (let $ = 0; $ < P.length; $++)
            $ > 0 && (this.formatted += " "), this.formatted += P[$].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(R) {
      const $ = ((this.options.includePrerelease && m) | (this.options.loose && v)) + ":" + R, N = n.get($);
      if (N)
        return N;
      const I = this.options.loose, k = I ? l[h.HYPHENRANGELOOSE] : l[h.HYPHENRANGE];
      R = R.replace(k, X(this.options.includePrerelease)), a("hyphen replace", R), R = R.replace(l[h.COMPARATORTRIM], c), a("comparator trim", R), R = R.replace(l[h.TILDETRIM], f), a("tilde trim", R), R = R.replace(l[h.CARETTRIM], g), a("caret trim", R);
      let V = R.split(" ").map((M) => C(M, this.options)).join(" ").split(/\s+/).map((M) => H(M, this.options));
      I && (V = V.filter((M) => (a("loose invalid filter", M, this.options), !!M.match(l[h.COMPARATORLOOSE])))), a("range list", V);
      const F = /* @__PURE__ */ new Map(), K = V.map((M) => new o(M, this.options));
      for (const M of K) {
        if (E(M))
          return [M];
        F.set(M.value, M);
      }
      F.size > 1 && F.has("") && F.delete("");
      const ue = [...F.values()];
      return n.set($, ue), ue;
    }
    intersects(R, P) {
      if (!(R instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some(($) => T($, P) && R.set.some((N) => T(N, P) && $.every((I) => N.every((k) => I.intersects(k, P)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(R) {
      if (!R)
        return !1;
      if (typeof R == "string")
        try {
          R = new s(R, this.options);
        } catch {
          return !1;
        }
      for (let P = 0; P < this.set.length; P++)
        if (te(this.set[P], R, this.options))
          return !0;
      return !1;
    }
  }
  ji = t;
  const r = QE, n = new r(), i = Qo, o = ci(), a = si, s = Ne, {
    safeRe: l,
    t: h,
    comparatorTrimReplace: c,
    tildeTrimReplace: f,
    caretTrimReplace: g
  } = rn, { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: v } = ai, E = (O) => O.value === "<0.0.0-0", A = (O) => O.value === "", T = (O, R) => {
    let P = !0;
    const $ = O.slice();
    let N = $.pop();
    for (; P && $.length; )
      P = $.every((I) => N.intersects(I, R)), N = $.pop();
    return P;
  }, C = (O, R) => (O = O.replace(l[h.BUILD], ""), a("comp", O, R), O = Z(O, R), a("caret", O), O = B(O, R), a("tildes", O), O = ae(O, R), a("xrange", O), O = y(O, R), a("stars", O), O), D = (O) => !O || O.toLowerCase() === "x" || O === "*", B = (O, R) => O.trim().split(/\s+/).map((P) => G(P, R)).join(" "), G = (O, R) => {
    const P = R.loose ? l[h.TILDELOOSE] : l[h.TILDE];
    return O.replace(P, ($, N, I, k, V) => {
      a("tilde", O, $, N, I, k, V);
      let F;
      return D(N) ? F = "" : D(I) ? F = `>=${N}.0.0 <${+N + 1}.0.0-0` : D(k) ? F = `>=${N}.${I}.0 <${N}.${+I + 1}.0-0` : V ? (a("replaceTilde pr", V), F = `>=${N}.${I}.${k}-${V} <${N}.${+I + 1}.0-0`) : F = `>=${N}.${I}.${k} <${N}.${+I + 1}.0-0`, a("tilde return", F), F;
    });
  }, Z = (O, R) => O.trim().split(/\s+/).map((P) => ee(P, R)).join(" "), ee = (O, R) => {
    a("caret", O, R);
    const P = R.loose ? l[h.CARETLOOSE] : l[h.CARET], $ = R.includePrerelease ? "-0" : "";
    return O.replace(P, (N, I, k, V, F) => {
      a("caret", O, N, I, k, V, F);
      let K;
      return D(I) ? K = "" : D(k) ? K = `>=${I}.0.0${$} <${+I + 1}.0.0-0` : D(V) ? I === "0" ? K = `>=${I}.${k}.0${$} <${I}.${+k + 1}.0-0` : K = `>=${I}.${k}.0${$} <${+I + 1}.0.0-0` : F ? (a("replaceCaret pr", F), I === "0" ? k === "0" ? K = `>=${I}.${k}.${V}-${F} <${I}.${k}.${+V + 1}-0` : K = `>=${I}.${k}.${V}-${F} <${I}.${+k + 1}.0-0` : K = `>=${I}.${k}.${V}-${F} <${+I + 1}.0.0-0`) : (a("no pr"), I === "0" ? k === "0" ? K = `>=${I}.${k}.${V}${$} <${I}.${k}.${+V + 1}-0` : K = `>=${I}.${k}.${V}${$} <${I}.${+k + 1}.0-0` : K = `>=${I}.${k}.${V} <${+I + 1}.0.0-0`), a("caret return", K), K;
    });
  }, ae = (O, R) => (a("replaceXRanges", O, R), O.split(/\s+/).map((P) => U(P, R)).join(" ")), U = (O, R) => {
    O = O.trim();
    const P = R.loose ? l[h.XRANGELOOSE] : l[h.XRANGE];
    return O.replace(P, ($, N, I, k, V, F) => {
      a("xRange", O, $, N, I, k, V, F);
      const K = D(I), ue = K || D(k), M = ue || D(V), we = M;
      return N === "=" && we && (N = ""), F = R.includePrerelease ? "-0" : "", K ? N === ">" || N === "<" ? $ = "<0.0.0-0" : $ = "*" : N && we ? (ue && (k = 0), V = 0, N === ">" ? (N = ">=", ue ? (I = +I + 1, k = 0, V = 0) : (k = +k + 1, V = 0)) : N === "<=" && (N = "<", ue ? I = +I + 1 : k = +k + 1), N === "<" && (F = "-0"), $ = `${N + I}.${k}.${V}${F}`) : ue ? $ = `>=${I}.0.0${F} <${+I + 1}.0.0-0` : M && ($ = `>=${I}.${k}.0${F} <${I}.${+k + 1}.0-0`), a("xRange return", $), $;
    });
  }, y = (O, R) => (a("replaceStars", O, R), O.trim().replace(l[h.STAR], "")), H = (O, R) => (a("replaceGTE0", O, R), O.trim().replace(l[R.includePrerelease ? h.GTE0PRE : h.GTE0], "")), X = (O) => (R, P, $, N, I, k, V, F, K, ue, M, we) => (D($) ? P = "" : D(N) ? P = `>=${$}.0.0${O ? "-0" : ""}` : D(I) ? P = `>=${$}.${N}.0${O ? "-0" : ""}` : k ? P = `>=${P}` : P = `>=${P}${O ? "-0" : ""}`, D(K) ? F = "" : D(ue) ? F = `<${+K + 1}.0.0-0` : D(M) ? F = `<${K}.${+ue + 1}.0-0` : we ? F = `<=${K}.${ue}.${M}-${we}` : O ? F = `<${K}.${ue}.${+M + 1}-0` : F = `<=${F}`, `${P} ${F}`.trim()), te = (O, R, P) => {
    for (let $ = 0; $ < O.length; $++)
      if (!O[$].test(R))
        return !1;
    if (R.prerelease.length && !P.includePrerelease) {
      for (let $ = 0; $ < O.length; $++)
        if (a(O[$].semver), O[$].semver !== o.ANY && O[$].semver.prerelease.length > 0) {
          const N = O[$].semver;
          if (N.major === R.major && N.minor === R.minor && N.patch === R.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return ji;
}
var Hi, Ds;
function ci() {
  if (Ds) return Hi;
  Ds = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, f) {
      if (f = r(f), c instanceof t) {
        if (c.loose === !!f.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), a("comparator", c, f), this.options = f, this.loose = !!f.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, a("comp", this);
    }
    parse(c) {
      const f = this.options.loose ? n[i.COMPARATORLOOSE] : n[i.COMPARATOR], g = c.match(f);
      if (!g)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = g[1] !== void 0 ? g[1] : "", this.operator === "=" && (this.operator = ""), g[2] ? this.semver = new s(g[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (a("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new s(c, this.options);
        } catch {
          return !1;
        }
      return o(c, this.operator, this.semver, this.options);
    }
    intersects(c, f) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(c.value, f).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new l(this.value, f).test(c.semver) : (f = r(f), f.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || o(this.semver, "<", c.semver, f) && this.operator.startsWith(">") && c.operator.startsWith("<") || o(this.semver, ">", c.semver, f) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  Hi = t;
  const r = Qo, { safeRe: n, t: i } = rn, o = Nu, a = si, s = Ne, l = Xe();
  return Hi;
}
const ZE = Xe(), ey = (e, t, r) => {
  try {
    t = new ZE(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var ui = ey;
const ty = Xe(), ry = (e, t) => new ty(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var ny = ry;
const iy = Ne, oy = Xe(), ay = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new oy(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || i.compare(a) === -1) && (n = a, i = new iy(n, r));
  }), n;
};
var sy = ay;
const ly = Ne, cy = Xe(), uy = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new cy(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || i.compare(a) === 1) && (n = a, i = new ly(n, r));
  }), n;
};
var fy = uy;
const qi = Ne, dy = Xe(), Fs = li, hy = (e, t) => {
  e = new dy(e, t);
  let r = new qi("0.0.0");
  if (e.test(r) || (r = new qi("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const i = e.set[n];
    let o = null;
    i.forEach((a) => {
      const s = new qi(a.semver.version);
      switch (a.operator) {
        case ">":
          s.prerelease.length === 0 ? s.patch++ : s.prerelease.push(0), s.raw = s.format();
        case "":
        case ">=":
          (!o || Fs(s, o)) && (o = s);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${a.operator}`);
      }
    }), o && (!r || Fs(r, o)) && (r = o);
  }
  return r && e.test(r) ? r : null;
};
var py = hy;
const my = Xe(), gy = (e, t) => {
  try {
    return new my(e, t).range || "*";
  } catch {
    return null;
  }
};
var Ey = gy;
const yy = Ne, Du = ci(), { ANY: vy } = Du, wy = Xe(), _y = ui, xs = li, Ls = ea, Ay = ra, Ty = ta, Sy = (e, t, r, n) => {
  e = new yy(e, n), t = new wy(t, n);
  let i, o, a, s, l;
  switch (r) {
    case ">":
      i = xs, o = Ay, a = Ls, s = ">", l = ">=";
      break;
    case "<":
      i = Ls, o = Ty, a = xs, s = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (_y(e, t, n))
    return !1;
  for (let h = 0; h < t.set.length; ++h) {
    const c = t.set[h];
    let f = null, g = null;
    if (c.forEach((m) => {
      m.semver === vy && (m = new Du(">=0.0.0")), f = f || m, g = g || m, i(m.semver, f.semver, n) ? f = m : a(m.semver, g.semver, n) && (g = m);
    }), f.operator === s || f.operator === l || (!g.operator || g.operator === s) && o(e, g.semver))
      return !1;
    if (g.operator === l && a(e, g.semver))
      return !1;
  }
  return !0;
};
var na = Sy;
const Cy = na, by = (e, t, r) => Cy(e, t, ">", r);
var $y = by;
const Ry = na, Oy = (e, t, r) => Ry(e, t, "<", r);
var Iy = Oy;
const Us = Xe(), Py = (e, t, r) => (e = new Us(e, r), t = new Us(t, r), e.intersects(t, r));
var Ny = Py;
const Dy = ui, Fy = ze;
var xy = (e, t, r) => {
  const n = [];
  let i = null, o = null;
  const a = e.sort((c, f) => Fy(c, f, r));
  for (const c of a)
    Dy(c, t, r) ? (o = c, i || (i = c)) : (o && n.push([i, o]), o = null, i = null);
  i && n.push([i, null]);
  const s = [];
  for (const [c, f] of n)
    c === f ? s.push(c) : !f && c === a[0] ? s.push("*") : f ? c === a[0] ? s.push(`<=${f}`) : s.push(`${c} - ${f}`) : s.push(`>=${c}`);
  const l = s.join(" || "), h = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < h.length ? l : t;
};
const ks = Xe(), ia = ci(), { ANY: Gi } = ia, Cr = ui, oa = ze, Ly = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new ks(e, r), t = new ks(t, r);
  let n = !1;
  e: for (const i of e.set) {
    for (const o of t.set) {
      const a = ky(i, o, r);
      if (n = n || a !== null, a)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, Uy = [new ia(">=0.0.0-0")], Ms = [new ia(">=0.0.0")], ky = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Gi) {
    if (t.length === 1 && t[0].semver === Gi)
      return !0;
    r.includePrerelease ? e = Uy : e = Ms;
  }
  if (t.length === 1 && t[0].semver === Gi) {
    if (r.includePrerelease)
      return !0;
    t = Ms;
  }
  const n = /* @__PURE__ */ new Set();
  let i, o;
  for (const m of e)
    m.operator === ">" || m.operator === ">=" ? i = Bs(i, m, r) : m.operator === "<" || m.operator === "<=" ? o = js(o, m, r) : n.add(m.semver);
  if (n.size > 1)
    return null;
  let a;
  if (i && o) {
    if (a = oa(i.semver, o.semver, r), a > 0)
      return null;
    if (a === 0 && (i.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const m of n) {
    if (i && !Cr(m, String(i), r) || o && !Cr(m, String(o), r))
      return null;
    for (const v of t)
      if (!Cr(m, String(v), r))
        return !1;
    return !0;
  }
  let s, l, h, c, f = o && !r.includePrerelease && o.semver.prerelease.length ? o.semver : !1, g = i && !r.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  f && f.prerelease.length === 1 && o.operator === "<" && f.prerelease[0] === 0 && (f = !1);
  for (const m of t) {
    if (c = c || m.operator === ">" || m.operator === ">=", h = h || m.operator === "<" || m.operator === "<=", i) {
      if (g && m.semver.prerelease && m.semver.prerelease.length && m.semver.major === g.major && m.semver.minor === g.minor && m.semver.patch === g.patch && (g = !1), m.operator === ">" || m.operator === ">=") {
        if (s = Bs(i, m, r), s === m && s !== i)
          return !1;
      } else if (i.operator === ">=" && !Cr(i.semver, String(m), r))
        return !1;
    }
    if (o) {
      if (f && m.semver.prerelease && m.semver.prerelease.length && m.semver.major === f.major && m.semver.minor === f.minor && m.semver.patch === f.patch && (f = !1), m.operator === "<" || m.operator === "<=") {
        if (l = js(o, m, r), l === m && l !== o)
          return !1;
      } else if (o.operator === "<=" && !Cr(o.semver, String(m), r))
        return !1;
    }
    if (!m.operator && (o || i) && a !== 0)
      return !1;
  }
  return !(i && h && !o && a !== 0 || o && c && !i && a !== 0 || g || f);
}, Bs = (e, t, r) => {
  if (!e)
    return t;
  const n = oa(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, js = (e, t, r) => {
  if (!e)
    return t;
  const n = oa(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var My = Ly;
const Vi = rn, Hs = ai, By = Ne, qs = Ou, jy = pr, Hy = z0, qy = J0, Gy = Z0, Vy = tE, Wy = iE, Yy = sE, zy = uE, Xy = hE, Ky = ze, Jy = EE, Qy = wE, Zy = Zo, ev = SE, tv = $E, rv = li, nv = ea, iv = Iu, ov = Pu, av = ta, sv = ra, lv = Nu, cv = KE, uv = ci(), fv = Xe(), dv = ui, hv = ny, pv = sy, mv = fy, gv = py, Ev = Ey, yv = na, vv = $y, wv = Iy, _v = Ny, Av = xy, Tv = My;
var Fu = {
  parse: jy,
  valid: Hy,
  clean: qy,
  inc: Gy,
  diff: Vy,
  major: Wy,
  minor: Yy,
  patch: zy,
  prerelease: Xy,
  compare: Ky,
  rcompare: Jy,
  compareLoose: Qy,
  compareBuild: Zy,
  sort: ev,
  rsort: tv,
  gt: rv,
  lt: nv,
  eq: iv,
  neq: ov,
  gte: av,
  lte: sv,
  cmp: lv,
  coerce: cv,
  Comparator: uv,
  Range: fv,
  satisfies: dv,
  toComparators: hv,
  maxSatisfying: pv,
  minSatisfying: mv,
  minVersion: gv,
  validRange: Ev,
  outside: yv,
  gtr: vv,
  ltr: wv,
  intersects: _v,
  simplifyRange: Av,
  subset: Tv,
  SemVer: By,
  re: Vi.re,
  src: Vi.src,
  tokens: Vi.t,
  SEMVER_SPEC_VERSION: Hs.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Hs.RELEASE_TYPES,
  compareIdentifiers: qs.compareIdentifiers,
  rcompareIdentifiers: qs.rcompareIdentifiers
}, nn = {}, Yn = { exports: {} };
Yn.exports;
(function(e, t) {
  var r = 200, n = "__lodash_hash_undefined__", i = 1, o = 2, a = 9007199254740991, s = "[object Arguments]", l = "[object Array]", h = "[object AsyncFunction]", c = "[object Boolean]", f = "[object Date]", g = "[object Error]", m = "[object Function]", v = "[object GeneratorFunction]", E = "[object Map]", A = "[object Number]", T = "[object Null]", C = "[object Object]", D = "[object Promise]", B = "[object Proxy]", G = "[object RegExp]", Z = "[object Set]", ee = "[object String]", ae = "[object Symbol]", U = "[object Undefined]", y = "[object WeakMap]", H = "[object ArrayBuffer]", X = "[object DataView]", te = "[object Float32Array]", O = "[object Float64Array]", R = "[object Int8Array]", P = "[object Int16Array]", $ = "[object Int32Array]", N = "[object Uint8Array]", I = "[object Uint8ClampedArray]", k = "[object Uint16Array]", V = "[object Uint32Array]", F = /[\\^$.*+?()[\]{}|]/g, K = /^\[object .+?Constructor\]$/, ue = /^(?:0|[1-9]\d*)$/, M = {};
  M[te] = M[O] = M[R] = M[P] = M[$] = M[N] = M[I] = M[k] = M[V] = !0, M[s] = M[l] = M[H] = M[c] = M[X] = M[f] = M[g] = M[m] = M[E] = M[A] = M[C] = M[G] = M[Z] = M[ee] = M[y] = !1;
  var we = typeof $e == "object" && $e && $e.Object === Object && $e, Er = typeof self == "object" && self && self.Object === Object && self, Be = we || Er || Function("return this")(), yr = t && !t.nodeType && t, Vt = yr && !0 && e && !e.nodeType && e, ln = Vt && Vt.exports === yr, d = ln && we.process, u = function() {
    try {
      return d && d.binding && d.binding("util");
    } catch {
    }
  }(), S = u && u.isTypedArray;
  function w(p, _) {
    for (var b = -1, x = p == null ? 0 : p.length, Q = 0, j = []; ++b < x; ) {
      var oe = p[b];
      _(oe, b, p) && (j[Q++] = oe);
    }
    return j;
  }
  function z(p, _) {
    for (var b = -1, x = _.length, Q = p.length; ++b < x; )
      p[Q + b] = _[b];
    return p;
  }
  function re(p, _) {
    for (var b = -1, x = p == null ? 0 : p.length; ++b < x; )
      if (_(p[b], b, p))
        return !0;
    return !1;
  }
  function se(p, _) {
    for (var b = -1, x = Array(p); ++b < p; )
      x[b] = _(b);
    return x;
  }
  function _e(p) {
    return function(_) {
      return p(_);
    };
  }
  function Ae(p, _) {
    return p.has(_);
  }
  function je(p, _) {
    return p == null ? void 0 : p[_];
  }
  function fe(p) {
    var _ = -1, b = Array(p.size);
    return p.forEach(function(x, Q) {
      b[++_] = [Q, x];
    }), b;
  }
  function He(p, _) {
    return function(b) {
      return p(_(b));
    };
  }
  function wi(p) {
    var _ = -1, b = Array(p.size);
    return p.forEach(function(x) {
      b[++_] = x;
    }), b;
  }
  var cn = Array.prototype, vr = Function.prototype, bt = Object.prototype, _i = Be["__core-js_shared__"], ha = vr.toString, Je = bt.hasOwnProperty, pa = function() {
    var p = /[^.]+$/.exec(_i && _i.keys && _i.keys.IE_PROTO || "");
    return p ? "Symbol(src)_1." + p : "";
  }(), ma = bt.toString, Ku = RegExp(
    "^" + ha.call(Je).replace(F, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), ga = ln ? Be.Buffer : void 0, un = Be.Symbol, Ea = Be.Uint8Array, ya = bt.propertyIsEnumerable, Ju = cn.splice, $t = un ? un.toStringTag : void 0, va = Object.getOwnPropertySymbols, Qu = ga ? ga.isBuffer : void 0, Zu = He(Object.keys, Object), Ai = Wt(Be, "DataView"), wr = Wt(Be, "Map"), Ti = Wt(Be, "Promise"), Si = Wt(Be, "Set"), Ci = Wt(Be, "WeakMap"), _r = Wt(Object, "create"), ef = It(Ai), tf = It(wr), rf = It(Ti), nf = It(Si), of = It(Ci), wa = un ? un.prototype : void 0, bi = wa ? wa.valueOf : void 0;
  function Rt(p) {
    var _ = -1, b = p == null ? 0 : p.length;
    for (this.clear(); ++_ < b; ) {
      var x = p[_];
      this.set(x[0], x[1]);
    }
  }
  function af() {
    this.__data__ = _r ? _r(null) : {}, this.size = 0;
  }
  function sf(p) {
    var _ = this.has(p) && delete this.__data__[p];
    return this.size -= _ ? 1 : 0, _;
  }
  function lf(p) {
    var _ = this.__data__;
    if (_r) {
      var b = _[p];
      return b === n ? void 0 : b;
    }
    return Je.call(_, p) ? _[p] : void 0;
  }
  function cf(p) {
    var _ = this.__data__;
    return _r ? _[p] !== void 0 : Je.call(_, p);
  }
  function uf(p, _) {
    var b = this.__data__;
    return this.size += this.has(p) ? 0 : 1, b[p] = _r && _ === void 0 ? n : _, this;
  }
  Rt.prototype.clear = af, Rt.prototype.delete = sf, Rt.prototype.get = lf, Rt.prototype.has = cf, Rt.prototype.set = uf;
  function rt(p) {
    var _ = -1, b = p == null ? 0 : p.length;
    for (this.clear(); ++_ < b; ) {
      var x = p[_];
      this.set(x[0], x[1]);
    }
  }
  function ff() {
    this.__data__ = [], this.size = 0;
  }
  function df(p) {
    var _ = this.__data__, b = dn(_, p);
    if (b < 0)
      return !1;
    var x = _.length - 1;
    return b == x ? _.pop() : Ju.call(_, b, 1), --this.size, !0;
  }
  function hf(p) {
    var _ = this.__data__, b = dn(_, p);
    return b < 0 ? void 0 : _[b][1];
  }
  function pf(p) {
    return dn(this.__data__, p) > -1;
  }
  function mf(p, _) {
    var b = this.__data__, x = dn(b, p);
    return x < 0 ? (++this.size, b.push([p, _])) : b[x][1] = _, this;
  }
  rt.prototype.clear = ff, rt.prototype.delete = df, rt.prototype.get = hf, rt.prototype.has = pf, rt.prototype.set = mf;
  function Ot(p) {
    var _ = -1, b = p == null ? 0 : p.length;
    for (this.clear(); ++_ < b; ) {
      var x = p[_];
      this.set(x[0], x[1]);
    }
  }
  function gf() {
    this.size = 0, this.__data__ = {
      hash: new Rt(),
      map: new (wr || rt)(),
      string: new Rt()
    };
  }
  function Ef(p) {
    var _ = hn(this, p).delete(p);
    return this.size -= _ ? 1 : 0, _;
  }
  function yf(p) {
    return hn(this, p).get(p);
  }
  function vf(p) {
    return hn(this, p).has(p);
  }
  function wf(p, _) {
    var b = hn(this, p), x = b.size;
    return b.set(p, _), this.size += b.size == x ? 0 : 1, this;
  }
  Ot.prototype.clear = gf, Ot.prototype.delete = Ef, Ot.prototype.get = yf, Ot.prototype.has = vf, Ot.prototype.set = wf;
  function fn(p) {
    var _ = -1, b = p == null ? 0 : p.length;
    for (this.__data__ = new Ot(); ++_ < b; )
      this.add(p[_]);
  }
  function _f(p) {
    return this.__data__.set(p, n), this;
  }
  function Af(p) {
    return this.__data__.has(p);
  }
  fn.prototype.add = fn.prototype.push = _f, fn.prototype.has = Af;
  function st(p) {
    var _ = this.__data__ = new rt(p);
    this.size = _.size;
  }
  function Tf() {
    this.__data__ = new rt(), this.size = 0;
  }
  function Sf(p) {
    var _ = this.__data__, b = _.delete(p);
    return this.size = _.size, b;
  }
  function Cf(p) {
    return this.__data__.get(p);
  }
  function bf(p) {
    return this.__data__.has(p);
  }
  function $f(p, _) {
    var b = this.__data__;
    if (b instanceof rt) {
      var x = b.__data__;
      if (!wr || x.length < r - 1)
        return x.push([p, _]), this.size = ++b.size, this;
      b = this.__data__ = new Ot(x);
    }
    return b.set(p, _), this.size = b.size, this;
  }
  st.prototype.clear = Tf, st.prototype.delete = Sf, st.prototype.get = Cf, st.prototype.has = bf, st.prototype.set = $f;
  function Rf(p, _) {
    var b = pn(p), x = !b && qf(p), Q = !b && !x && $i(p), j = !b && !x && !Q && Oa(p), oe = b || x || Q || j, pe = oe ? se(p.length, String) : [], ge = pe.length;
    for (var ne in p)
      Je.call(p, ne) && !(oe && // Safari 9 has enumerable `arguments.length` in strict mode.
      (ne == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      Q && (ne == "offset" || ne == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      j && (ne == "buffer" || ne == "byteLength" || ne == "byteOffset") || // Skip index properties.
      kf(ne, ge))) && pe.push(ne);
    return pe;
  }
  function dn(p, _) {
    for (var b = p.length; b--; )
      if (Ca(p[b][0], _))
        return b;
    return -1;
  }
  function Of(p, _, b) {
    var x = _(p);
    return pn(p) ? x : z(x, b(p));
  }
  function Ar(p) {
    return p == null ? p === void 0 ? U : T : $t && $t in Object(p) ? Lf(p) : Hf(p);
  }
  function _a(p) {
    return Tr(p) && Ar(p) == s;
  }
  function Aa(p, _, b, x, Q) {
    return p === _ ? !0 : p == null || _ == null || !Tr(p) && !Tr(_) ? p !== p && _ !== _ : If(p, _, b, x, Aa, Q);
  }
  function If(p, _, b, x, Q, j) {
    var oe = pn(p), pe = pn(_), ge = oe ? l : lt(p), ne = pe ? l : lt(_);
    ge = ge == s ? C : ge, ne = ne == s ? C : ne;
    var xe = ge == C, qe = ne == C, Te = ge == ne;
    if (Te && $i(p)) {
      if (!$i(_))
        return !1;
      oe = !0, xe = !1;
    }
    if (Te && !xe)
      return j || (j = new st()), oe || Oa(p) ? Ta(p, _, b, x, Q, j) : Ff(p, _, ge, b, x, Q, j);
    if (!(b & i)) {
      var Ue = xe && Je.call(p, "__wrapped__"), ke = qe && Je.call(_, "__wrapped__");
      if (Ue || ke) {
        var ct = Ue ? p.value() : p, nt = ke ? _.value() : _;
        return j || (j = new st()), Q(ct, nt, b, x, j);
      }
    }
    return Te ? (j || (j = new st()), xf(p, _, b, x, Q, j)) : !1;
  }
  function Pf(p) {
    if (!Ra(p) || Bf(p))
      return !1;
    var _ = ba(p) ? Ku : K;
    return _.test(It(p));
  }
  function Nf(p) {
    return Tr(p) && $a(p.length) && !!M[Ar(p)];
  }
  function Df(p) {
    if (!jf(p))
      return Zu(p);
    var _ = [];
    for (var b in Object(p))
      Je.call(p, b) && b != "constructor" && _.push(b);
    return _;
  }
  function Ta(p, _, b, x, Q, j) {
    var oe = b & i, pe = p.length, ge = _.length;
    if (pe != ge && !(oe && ge > pe))
      return !1;
    var ne = j.get(p);
    if (ne && j.get(_))
      return ne == _;
    var xe = -1, qe = !0, Te = b & o ? new fn() : void 0;
    for (j.set(p, _), j.set(_, p); ++xe < pe; ) {
      var Ue = p[xe], ke = _[xe];
      if (x)
        var ct = oe ? x(ke, Ue, xe, _, p, j) : x(Ue, ke, xe, p, _, j);
      if (ct !== void 0) {
        if (ct)
          continue;
        qe = !1;
        break;
      }
      if (Te) {
        if (!re(_, function(nt, Pt) {
          if (!Ae(Te, Pt) && (Ue === nt || Q(Ue, nt, b, x, j)))
            return Te.push(Pt);
        })) {
          qe = !1;
          break;
        }
      } else if (!(Ue === ke || Q(Ue, ke, b, x, j))) {
        qe = !1;
        break;
      }
    }
    return j.delete(p), j.delete(_), qe;
  }
  function Ff(p, _, b, x, Q, j, oe) {
    switch (b) {
      case X:
        if (p.byteLength != _.byteLength || p.byteOffset != _.byteOffset)
          return !1;
        p = p.buffer, _ = _.buffer;
      case H:
        return !(p.byteLength != _.byteLength || !j(new Ea(p), new Ea(_)));
      case c:
      case f:
      case A:
        return Ca(+p, +_);
      case g:
        return p.name == _.name && p.message == _.message;
      case G:
      case ee:
        return p == _ + "";
      case E:
        var pe = fe;
      case Z:
        var ge = x & i;
        if (pe || (pe = wi), p.size != _.size && !ge)
          return !1;
        var ne = oe.get(p);
        if (ne)
          return ne == _;
        x |= o, oe.set(p, _);
        var xe = Ta(pe(p), pe(_), x, Q, j, oe);
        return oe.delete(p), xe;
      case ae:
        if (bi)
          return bi.call(p) == bi.call(_);
    }
    return !1;
  }
  function xf(p, _, b, x, Q, j) {
    var oe = b & i, pe = Sa(p), ge = pe.length, ne = Sa(_), xe = ne.length;
    if (ge != xe && !oe)
      return !1;
    for (var qe = ge; qe--; ) {
      var Te = pe[qe];
      if (!(oe ? Te in _ : Je.call(_, Te)))
        return !1;
    }
    var Ue = j.get(p);
    if (Ue && j.get(_))
      return Ue == _;
    var ke = !0;
    j.set(p, _), j.set(_, p);
    for (var ct = oe; ++qe < ge; ) {
      Te = pe[qe];
      var nt = p[Te], Pt = _[Te];
      if (x)
        var Ia = oe ? x(Pt, nt, Te, _, p, j) : x(nt, Pt, Te, p, _, j);
      if (!(Ia === void 0 ? nt === Pt || Q(nt, Pt, b, x, j) : Ia)) {
        ke = !1;
        break;
      }
      ct || (ct = Te == "constructor");
    }
    if (ke && !ct) {
      var mn = p.constructor, gn = _.constructor;
      mn != gn && "constructor" in p && "constructor" in _ && !(typeof mn == "function" && mn instanceof mn && typeof gn == "function" && gn instanceof gn) && (ke = !1);
    }
    return j.delete(p), j.delete(_), ke;
  }
  function Sa(p) {
    return Of(p, Wf, Uf);
  }
  function hn(p, _) {
    var b = p.__data__;
    return Mf(_) ? b[typeof _ == "string" ? "string" : "hash"] : b.map;
  }
  function Wt(p, _) {
    var b = je(p, _);
    return Pf(b) ? b : void 0;
  }
  function Lf(p) {
    var _ = Je.call(p, $t), b = p[$t];
    try {
      p[$t] = void 0;
      var x = !0;
    } catch {
    }
    var Q = ma.call(p);
    return x && (_ ? p[$t] = b : delete p[$t]), Q;
  }
  var Uf = va ? function(p) {
    return p == null ? [] : (p = Object(p), w(va(p), function(_) {
      return ya.call(p, _);
    }));
  } : Yf, lt = Ar;
  (Ai && lt(new Ai(new ArrayBuffer(1))) != X || wr && lt(new wr()) != E || Ti && lt(Ti.resolve()) != D || Si && lt(new Si()) != Z || Ci && lt(new Ci()) != y) && (lt = function(p) {
    var _ = Ar(p), b = _ == C ? p.constructor : void 0, x = b ? It(b) : "";
    if (x)
      switch (x) {
        case ef:
          return X;
        case tf:
          return E;
        case rf:
          return D;
        case nf:
          return Z;
        case of:
          return y;
      }
    return _;
  });
  function kf(p, _) {
    return _ = _ ?? a, !!_ && (typeof p == "number" || ue.test(p)) && p > -1 && p % 1 == 0 && p < _;
  }
  function Mf(p) {
    var _ = typeof p;
    return _ == "string" || _ == "number" || _ == "symbol" || _ == "boolean" ? p !== "__proto__" : p === null;
  }
  function Bf(p) {
    return !!pa && pa in p;
  }
  function jf(p) {
    var _ = p && p.constructor, b = typeof _ == "function" && _.prototype || bt;
    return p === b;
  }
  function Hf(p) {
    return ma.call(p);
  }
  function It(p) {
    if (p != null) {
      try {
        return ha.call(p);
      } catch {
      }
      try {
        return p + "";
      } catch {
      }
    }
    return "";
  }
  function Ca(p, _) {
    return p === _ || p !== p && _ !== _;
  }
  var qf = _a(/* @__PURE__ */ function() {
    return arguments;
  }()) ? _a : function(p) {
    return Tr(p) && Je.call(p, "callee") && !ya.call(p, "callee");
  }, pn = Array.isArray;
  function Gf(p) {
    return p != null && $a(p.length) && !ba(p);
  }
  var $i = Qu || zf;
  function Vf(p, _) {
    return Aa(p, _);
  }
  function ba(p) {
    if (!Ra(p))
      return !1;
    var _ = Ar(p);
    return _ == m || _ == v || _ == h || _ == B;
  }
  function $a(p) {
    return typeof p == "number" && p > -1 && p % 1 == 0 && p <= a;
  }
  function Ra(p) {
    var _ = typeof p;
    return p != null && (_ == "object" || _ == "function");
  }
  function Tr(p) {
    return p != null && typeof p == "object";
  }
  var Oa = S ? _e(S) : Nf;
  function Wf(p) {
    return Gf(p) ? Rf(p) : Df(p);
  }
  function Yf() {
    return [];
  }
  function zf() {
    return !1;
  }
  e.exports = Vf;
})(Yn, Yn.exports);
var Sv = Yn.exports;
Object.defineProperty(nn, "__esModule", { value: !0 });
nn.DownloadedUpdateHelper = void 0;
nn.createTempUpdateFile = Ov;
const Cv = Xr, bv = We, Gs = Sv, Nt = St, Nr = Y;
class $v {
  constructor(t) {
    this.cacheDir = t, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
  }
  get downloadedFileInfo() {
    return this._downloadedFileInfo;
  }
  get file() {
    return this._file;
  }
  get packageFile() {
    return this._packageFile;
  }
  get cacheDirForPendingUpdate() {
    return Nr.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(t, r, n, i) {
    if (this.versionInfo != null && this.file === t && this.fileInfo != null)
      return Gs(this.versionInfo, r) && Gs(this.fileInfo.info, n.info) && await (0, Nt.pathExists)(t) ? t : null;
    const o = await this.getValidCachedUpdateFile(n, i);
    return o === null ? null : (i.info(`Update has already been downloaded to ${t}).`), this._file = o, o);
  }
  async setDownloadedFile(t, r, n, i, o, a) {
    this._file = t, this._packageFile = r, this.versionInfo = n, this.fileInfo = i, this._downloadedFileInfo = {
      fileName: o,
      sha512: i.info.sha512,
      isAdminRightsRequired: i.info.isAdminRightsRequired === !0
    }, a && await (0, Nt.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
  }
  async clear() {
    this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, Nt.emptyDir)(this.cacheDirForPendingUpdate);
    } catch {
    }
  }
  /**
   * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
   * @param fileInfo
   * @param logger
   */
  async getValidCachedUpdateFile(t, r) {
    const n = this.getUpdateInfoFile();
    if (!await (0, Nt.pathExists)(n))
      return null;
    let o;
    try {
      o = await (0, Nt.readJson)(n);
    } catch (h) {
      let c = "No cached update info available";
      return h.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), c += ` (error on read: ${h.message})`), r.info(c), null;
    }
    if (!((o == null ? void 0 : o.fileName) !== null))
      return r.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
    if (t.info.sha512 !== o.sha512)
      return r.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${o.sha512}, expected: ${t.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
    const s = Nr.join(this.cacheDirForPendingUpdate, o.fileName);
    if (!await (0, Nt.pathExists)(s))
      return r.info("Cached update file doesn't exist"), null;
    const l = await Rv(s);
    return t.info.sha512 !== l ? (r.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${l}, expected: ${t.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = o, s);
  }
  getUpdateInfoFile() {
    return Nr.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
nn.DownloadedUpdateHelper = $v;
function Rv(e, t = "sha512", r = "base64", n) {
  return new Promise((i, o) => {
    const a = (0, Cv.createHash)(t);
    a.on("error", o).setEncoding(r), (0, bv.createReadStream)(e, {
      ...n,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", o).on("end", () => {
      a.end(), i(a.read());
    }).pipe(a, { end: !1 });
  });
}
async function Ov(e, t, r) {
  let n = 0, i = Nr.join(t, e);
  for (let o = 0; o < 3; o++)
    try {
      return await (0, Nt.unlink)(i), i;
    } catch (a) {
      if (a.code === "ENOENT")
        return i;
      r.warn(`Error on remove temp update file: ${a}`), i = Nr.join(t, `${n++}-${e}`);
    }
  return i;
}
var fi = {}, aa = {};
Object.defineProperty(aa, "__esModule", { value: !0 });
aa.getAppCacheDir = Pv;
const Wi = Y, Iv = Kn;
function Pv() {
  const e = (0, Iv.homedir)();
  let t;
  return process.platform === "win32" ? t = process.env.LOCALAPPDATA || Wi.join(e, "AppData", "Local") : process.platform === "darwin" ? t = Wi.join(e, "Library", "Caches") : t = process.env.XDG_CACHE_HOME || Wi.join(e, ".cache"), t;
}
Object.defineProperty(fi, "__esModule", { value: !0 });
fi.ElectronAppAdapter = void 0;
const Vs = Y, Nv = aa;
class Dv {
  constructor(t = kt.app) {
    this.app = t;
  }
  whenReady() {
    return this.app.whenReady();
  }
  get version() {
    return this.app.getVersion();
  }
  get name() {
    return this.app.getName();
  }
  get isPackaged() {
    return this.app.isPackaged === !0;
  }
  get appUpdateConfigPath() {
    return this.isPackaged ? Vs.join(process.resourcesPath, "app-update.yml") : Vs.join(this.app.getAppPath(), "dev-app-update.yml");
  }
  get userDataPath() {
    return this.app.getPath("userData");
  }
  get baseCachePath() {
    return (0, Nv.getAppCacheDir)();
  }
  quit() {
    this.app.quit();
  }
  relaunch() {
    this.app.relaunch();
  }
  onQuit(t) {
    this.app.once("quit", (r, n) => t(n));
  }
}
fi.ElectronAppAdapter = Dv;
var xu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = r;
  const t = he;
  e.NET_SESSION_NAME = "electron-updater";
  function r() {
    return kt.session.fromPartition(e.NET_SESSION_NAME, {
      cache: !1
    });
  }
  class n extends t.HttpExecutor {
    constructor(o) {
      super(), this.proxyLoginCallback = o, this.cachedSession = null;
    }
    async download(o, a, s) {
      return await s.cancellationToken.createPromise((l, h, c) => {
        const f = {
          headers: s.headers || void 0,
          redirect: "manual"
        };
        (0, t.configureRequestUrl)(o, f), (0, t.configureRequestOptions)(f), this.doDownload(f, {
          destination: a,
          options: s,
          onCancel: c,
          callback: (g) => {
            g == null ? l(a) : h(g);
          },
          responseHandler: null
        }, 0);
      });
    }
    createRequest(o, a) {
      o.headers && o.headers.Host && (o.host = o.headers.Host, delete o.headers.Host), this.cachedSession == null && (this.cachedSession = r());
      const s = kt.net.request({
        ...o,
        session: this.cachedSession
      });
      return s.on("response", a), this.proxyLoginCallback != null && s.on("login", this.proxyLoginCallback), s;
    }
    addRedirectHandlers(o, a, s, l, h) {
      o.on("redirect", (c, f, g) => {
        o.abort(), l > this.maxRedirects ? s(this.createMaxRedirectError()) : h(t.HttpExecutor.prepareRedirectUrlOptions(g, a));
      });
    }
  }
  e.ElectronHttpExecutor = n;
})(xu);
var on = {}, Ke = {};
Object.defineProperty(Ke, "__esModule", { value: !0 });
Ke.newBaseUrl = Fv;
Ke.newUrlFromBase = xv;
Ke.getChannelFilename = Lv;
const Lu = Tt;
function Fv(e) {
  const t = new Lu.URL(e);
  return t.pathname.endsWith("/") || (t.pathname += "/"), t;
}
function xv(e, t, r = !1) {
  const n = new Lu.URL(e, t), i = t.search;
  return i != null && i.length !== 0 ? n.search = i : r && (n.search = `noCache=${Date.now().toString(32)}`), n;
}
function Lv(e) {
  return `${e}.yml`;
}
var ce = {}, Uv = "[object Symbol]", Uu = /[\\^$.*+?()[\]{}|]/g, kv = RegExp(Uu.source), Mv = typeof $e == "object" && $e && $e.Object === Object && $e, Bv = typeof self == "object" && self && self.Object === Object && self, jv = Mv || Bv || Function("return this")(), Hv = Object.prototype, qv = Hv.toString, Ws = jv.Symbol, Ys = Ws ? Ws.prototype : void 0, zs = Ys ? Ys.toString : void 0;
function Gv(e) {
  if (typeof e == "string")
    return e;
  if (Wv(e))
    return zs ? zs.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function Vv(e) {
  return !!e && typeof e == "object";
}
function Wv(e) {
  return typeof e == "symbol" || Vv(e) && qv.call(e) == Uv;
}
function Yv(e) {
  return e == null ? "" : Gv(e);
}
function zv(e) {
  return e = Yv(e), e && kv.test(e) ? e.replace(Uu, "\\$&") : e;
}
var ku = zv;
Object.defineProperty(ce, "__esModule", { value: !0 });
ce.Provider = void 0;
ce.findFile = Zv;
ce.parseUpdateInfo = ew;
ce.getFileList = Mu;
ce.resolveFiles = tw;
const wt = he, Xv = ve, Kv = Tt, zn = Ke, Jv = ku;
class Qv {
  constructor(t) {
    this.runtimeOptions = t, this.requestHeaders = null, this.executor = t.executor;
  }
  // By default, the blockmap file is in the same directory as the main file
  // But some providers may have a different blockmap file, so we need to override this method
  getBlockMapFiles(t, r, n, i = null) {
    const o = (0, zn.newUrlFromBase)(`${t.pathname}.blockmap`, t);
    return [(0, zn.newUrlFromBase)(`${t.pathname.replace(new RegExp(Jv(n), "g"), r)}.blockmap`, i ? new Kv.URL(i) : t), o];
  }
  get isUseMultipleRangeRequest() {
    return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
  }
  getChannelFilePrefix() {
    if (this.runtimeOptions.platform === "linux") {
      const t = process.env.TEST_UPDATER_ARCH || process.arch;
      return "-linux" + (t === "x64" ? "" : `-${t}`);
    } else
      return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
  }
  // due to historical reasons for windows we use channel name without platform specifier
  getDefaultChannelName() {
    return this.getCustomChannelName("latest");
  }
  getCustomChannelName(t) {
    return `${t}${this.getChannelFilePrefix()}`;
  }
  get fileExtraDownloadHeaders() {
    return null;
  }
  setRequestHeaders(t) {
    this.requestHeaders = t;
  }
  /**
   * Method to perform API request only to resolve update info, but not to download update.
   */
  httpRequest(t, r, n) {
    return this.executor.request(this.createRequestOptions(t, r), n);
  }
  createRequestOptions(t, r) {
    const n = {};
    return this.requestHeaders == null ? r != null && (n.headers = r) : n.headers = r == null ? this.requestHeaders : { ...this.requestHeaders, ...r }, (0, wt.configureRequestUrl)(t, n), n;
  }
}
ce.Provider = Qv;
function Zv(e, t, r) {
  var n;
  if (e.length === 0)
    throw (0, wt.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
  const i = e.filter((a) => a.url.pathname.toLowerCase().endsWith(`.${t.toLowerCase()}`)), o = (n = i.find((a) => [a.url.pathname, a.info.url].some((s) => s.includes(process.arch)))) !== null && n !== void 0 ? n : i.shift();
  return o || (r == null ? e[0] : e.find((a) => !r.some((s) => a.url.pathname.toLowerCase().endsWith(`.${s.toLowerCase()}`))));
}
function ew(e, t, r) {
  if (e == null)
    throw (0, wt.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  let n;
  try {
    n = (0, Xv.load)(e);
  } catch (i) {
    throw (0, wt.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): ${i.stack || i.message}, rawData: ${e}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  return n;
}
function Mu(e) {
  const t = e.files;
  if (t != null && t.length > 0)
    return t;
  if (e.path != null)
    return [
      {
        url: e.path,
        sha2: e.sha2,
        sha512: e.sha512
      }
    ];
  throw (0, wt.newError)(`No files provided: ${(0, wt.safeStringifyJson)(e)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
}
function tw(e, t, r = (n) => n) {
  const i = Mu(e).map((s) => {
    if (s.sha2 == null && s.sha512 == null)
      throw (0, wt.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, wt.safeStringifyJson)(s)}`, "ERR_UPDATER_NO_CHECKSUM");
    return {
      url: (0, zn.newUrlFromBase)(r(s.url), t),
      info: s
    };
  }), o = e.packages, a = o == null ? null : o[process.arch] || o.ia32;
  return a != null && (i[0].packageInfo = {
    ...a,
    path: (0, zn.newUrlFromBase)(r(a.path), t).href
  }), i;
}
Object.defineProperty(on, "__esModule", { value: !0 });
on.GenericProvider = void 0;
const Xs = he, Yi = Ke, zi = ce;
class rw extends zi.Provider {
  constructor(t, r, n) {
    super(n), this.configuration = t, this.updater = r, this.baseUrl = (0, Yi.newBaseUrl)(this.configuration.url);
  }
  get channel() {
    const t = this.updater.channel || this.configuration.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = (0, Yi.getChannelFilename)(this.channel), r = (0, Yi.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
    for (let n = 0; ; n++)
      try {
        return (0, zi.parseUpdateInfo)(await this.httpRequest(r), t, r);
      } catch (i) {
        if (i instanceof Xs.HttpError && i.statusCode === 404)
          throw (0, Xs.newError)(`Cannot find channel "${t}" update info: ${i.stack || i.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        if (i.code === "ECONNREFUSED" && n < 3) {
          await new Promise((o, a) => {
            try {
              setTimeout(o, 1e3 * n);
            } catch (s) {
              a(s);
            }
          });
          continue;
        }
        throw i;
      }
  }
  resolveFiles(t) {
    return (0, zi.resolveFiles)(t, this.baseUrl);
  }
}
on.GenericProvider = rw;
var di = {}, hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
hi.BitbucketProvider = void 0;
const Ks = he, Xi = Ke, Ki = ce;
class nw extends Ki.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r;
    const { owner: i, slug: o } = t;
    this.baseUrl = (0, Xi.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${i}/${o}/downloads`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "latest";
  }
  async getLatestVersion() {
    const t = new Ks.CancellationToken(), r = (0, Xi.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, Xi.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, void 0, t);
      return (0, Ki.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Ks.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, Ki.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { owner: t, slug: r } = this.configuration;
    return `Bitbucket (owner: ${t}, slug: ${r}, channel: ${this.channel})`;
  }
}
hi.BitbucketProvider = nw;
var _t = {};
Object.defineProperty(_t, "__esModule", { value: !0 });
_t.GitHubProvider = _t.BaseGitHubProvider = void 0;
_t.computeReleaseNotes = ju;
const it = he, Ze = Fu, iw = Tt, ir = Ke, So = ce, Ji = /\/tag\/(v?[^/]+)$/;
class Bu extends So.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      /* because GitHib uses S3 */
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.baseUrl = (0, ir.newBaseUrl)((0, it.githubUrl)(t, r));
    const i = r === "github.com" ? "api.github.com" : r;
    this.baseApiUrl = (0, ir.newBaseUrl)((0, it.githubUrl)(t, i));
  }
  computeGithubBasePath(t) {
    const r = this.options.host;
    return r && !["github.com", "api.github.com"].includes(r) ? `/api/v3${t}` : t;
  }
}
_t.BaseGitHubProvider = Bu;
class ow extends Bu {
  constructor(t, r, n) {
    super(t, "github.com", n), this.options = t, this.updater = r;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    var t, r, n, i, o;
    const a = new it.CancellationToken(), s = await this.httpRequest((0, ir.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
      accept: "application/xml, application/atom+xml, text/xml, */*"
    }, a), l = (0, it.parseXml)(s);
    let h = l.element("entry", !1, "No published versions on GitHub"), c = null;
    try {
      if (this.updater.allowPrerelease) {
        const A = ((t = this.updater) === null || t === void 0 ? void 0 : t.channel) || ((r = Ze.prerelease(this.updater.currentVersion)) === null || r === void 0 ? void 0 : r[0]) || null;
        if (A === null)
          c = Ji.exec(h.element("link").attribute("href"))[1];
        else
          for (const T of l.getElements("entry")) {
            const C = Ji.exec(T.element("link").attribute("href"));
            if (C === null)
              continue;
            const D = C[1];
            if (!Ze.valid(D))
              continue;
            const B = ((n = Ze.prerelease(D)) === null || n === void 0 ? void 0 : n[0]) || null, G = !A || ["alpha", "beta"].includes(A), Z = B !== null && !["alpha", "beta"].includes(String(B));
            if (G && !Z && !(A === "beta" && B === "alpha")) {
              c = D, h = T;
              break;
            }
            if (B && B === A) {
              c = D, h = T;
              break;
            }
          }
      } else {
        c = await this.getLatestTagName(a);
        for (const A of l.getElements("entry")) {
          const T = Ji.exec(A.element("link").attribute("href"));
          if (T != null && T[1] === c) {
            h = A;
            break;
          }
        }
      }
    } catch (A) {
      throw (0, it.newError)(`Cannot parse releases feed: ${A.stack || A.message},
XML:
${s}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
    }
    if (c == null)
      throw (0, it.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let f, g = "", m = "";
    const v = async (A) => {
      g = (0, ir.getChannelFilename)(A), m = (0, ir.newUrlFromBase)(this.getBaseDownloadPath(String(c), g), this.baseUrl);
      const T = this.createRequestOptions(m);
      try {
        return await this.executor.request(T, a);
      } catch (C) {
        throw C instanceof it.HttpError && C.statusCode === 404 ? (0, it.newError)(`Cannot find ${g} in the latest release artifacts (${m}): ${C.stack || C.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : C;
      }
    };
    try {
      let A = this.channel;
      this.updater.allowPrerelease && (!((i = Ze.prerelease(c)) === null || i === void 0) && i[0]) && (A = this.getCustomChannelName(String((o = Ze.prerelease(c)) === null || o === void 0 ? void 0 : o[0]))), f = await v(A);
    } catch (A) {
      if (this.updater.allowPrerelease)
        f = await v(this.getDefaultChannelName());
      else
        throw A;
    }
    const E = (0, So.parseUpdateInfo)(f, g, m);
    return E.releaseName == null && (E.releaseName = h.elementValueOrEmpty("title")), E.releaseNotes == null && (E.releaseNotes = ju(this.updater.currentVersion, this.updater.fullChangelog, l, h)), {
      tag: c,
      ...E
    };
  }
  async getLatestTagName(t) {
    const r = this.options, n = r.host == null || r.host === "github.com" ? (0, ir.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new iw.URL(`${this.computeGithubBasePath(`/repos/${r.owner}/${r.repo}/releases`)}/latest`, this.baseApiUrl);
    try {
      const i = await this.httpRequest(n, { Accept: "application/json" }, t);
      return i == null ? null : JSON.parse(i).tag_name;
    } catch (i) {
      throw (0, it.newError)(`Unable to find latest version on GitHub (${n}), please ensure a production release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return `/${this.options.owner}/${this.options.repo}/releases`;
  }
  resolveFiles(t) {
    return (0, So.resolveFiles)(t, this.baseUrl, (r) => this.getBaseDownloadPath(t.tag, r.replace(/ /g, "-")));
  }
  getBaseDownloadPath(t, r) {
    return `${this.basePath}/download/${t}/${r}`;
  }
}
_t.GitHubProvider = ow;
function Js(e) {
  const t = e.elementValueOrEmpty("content");
  return t === "No content." ? "" : t;
}
function ju(e, t, r, n) {
  if (!t)
    return Js(n);
  const i = /\/tag\/v?([^/]+)$/;
  let o;
  try {
    o = i.exec(n.element("link").attribute("href"))[1], o = Ze.valid(o) ? o : void 0;
  } catch {
  }
  if (o == null)
    return null;
  const a = [];
  for (const s of r.getElements("entry")) {
    let l;
    try {
      const f = i.exec(s.element("link").attribute("href"));
      if (!f)
        continue;
      l = f[1];
    } catch {
      continue;
    }
    if (!Ze.valid(l))
      continue;
    const h = Ze.gt(l, e.raw), c = Ze.lte(l, o);
    h && c && a.push({
      version: l,
      note: Js(s)
    });
  }
  return a.sort((s, l) => Ze.rcompare(s.version, l.version));
}
var pi = {};
Object.defineProperty(pi, "__esModule", { value: !0 });
pi.GitLabProvider = void 0;
const Ee = he, Qi = Tt, aw = ku, On = Ke, Zi = ce;
class sw extends Zi.Provider {
  /**
   * Normalizes filenames by replacing spaces and underscores with dashes.
   *
   * This is a workaround to handle filename formatting differences between tools:
   * - electron-builder formats filenames like "test file.txt" as "test-file.txt"
   * - GitLab may provide asset URLs using underscores, such as "test_file.txt"
   *
   * Because of this mismatch, we can't reliably extract the correct filename from
   * the asset path without normalization. This function ensures consistent matching
   * across different filename formats by converting all spaces and underscores to dashes.
   *
   * @param filename The filename to normalize
   * @returns The normalized filename with spaces and underscores replaced by dashes
   */
  normalizeFilename(t) {
    return t.replace(/ |_/g, "-");
  }
  constructor(t, r, n) {
    super({
      ...n,
      // GitLab might not support multiple range requests efficiently
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.updater = r, this.cachedLatestVersion = null;
    const o = t.host || "gitlab.com";
    this.baseApiUrl = (0, On.newBaseUrl)(`https://${o}/api/v4`);
  }
  createRequestOptions(t, r) {
    const n = super.createRequestOptions(t, r);
    return n.redirect = "manual", n;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = new Ee.CancellationToken(), r = (0, On.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl), n = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) };
    let i;
    try {
      i = await this.httpRequest(r, n, t);
    } catch (m) {
      throw (0, Ee.newError)(`Unable to find latest release on GitLab (${r}): ${m.stack || m.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    if (!i)
      throw (0, Ee.newError)("No published releases on GitLab", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let o;
    try {
      o = JSON.parse(i);
    } catch (m) {
      throw (0, Ee.newError)(`Unable to parse latest release response from GitLab (${r}): response was not valid JSON: ${m.stack || m.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    if (o.upcoming_release)
      throw (0, Ee.newError)("Latest GitLab release is scheduled but not yet published", "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    const a = o.tag_name;
    let s = null, l = "", h = null;
    const c = async (m) => {
      l = (0, On.getChannelFilename)(m);
      const v = o.assets.links.find((T) => T.name === l);
      if (!v)
        throw (0, Ee.newError)(`Cannot find ${l} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      h = new Qi.URL(v.direct_asset_url);
      const E = this.setAuthHeaderForToken(this.options.token || null), A = Object.keys(E).length ? E : void 0;
      try {
        const T = await this.httpRequest(h, A, t);
        if (!T)
          throw (0, Ee.newError)(`Empty response from ${h}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        return T;
      } catch (T) {
        throw T instanceof Ee.HttpError && T.statusCode === 404 ? (0, Ee.newError)(`Cannot find ${l} in the latest release artifacts (${h}): ${T.stack || T.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : T;
      }
    };
    try {
      s = await c(this.channel);
    } catch (m) {
      if (this.channel !== this.getDefaultChannelName())
        s = await c(this.getDefaultChannelName());
      else
        throw m;
    }
    if (!s)
      throw (0, Ee.newError)(`Unable to parse channel data from ${l}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    const f = (0, Zi.parseUpdateInfo)(s, l, h);
    f.releaseName == null && (f.releaseName = o.name), f.releaseNotes == null && (f.releaseNotes = o.description || null);
    const g = {
      tag: a,
      assets: this.convertAssetsToMap(o.assets),
      ...f
    };
    return this.cachedLatestVersion = g, g;
  }
  /**
   * Utility function to convert GitlabReleaseAsset to Map<string, string>
   * Maps asset names to their download URLs
   */
  convertAssetsToMap(t) {
    const r = /* @__PURE__ */ new Map();
    for (const n of t.links)
      r.set(this.normalizeFilename(n.name), n.direct_asset_url);
    return r;
  }
  /**
   * Find blockmap file URL in assets map for a specific filename
   */
  findBlockMapInAssets(t, r) {
    const n = [`${r}.blockmap`, `${this.normalizeFilename(r)}.blockmap`];
    for (const i of n) {
      const o = t.get(i);
      if (o)
        return new Qi.URL(o);
    }
    return null;
  }
  async fetchReleaseInfoByVersion(t) {
    const r = new Ee.CancellationToken(), n = [`v${t}`, t];
    for (const i of n) {
      const o = (0, On.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(i)}`, this.baseApiUrl);
      try {
        const a = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, s = await this.httpRequest(o, a, r);
        if (s)
          return JSON.parse(s);
      } catch (a) {
        if (a instanceof Ee.HttpError && a.statusCode === 404)
          continue;
        throw (0, Ee.newError)(`Unable to find release ${i} on GitLab (${o}): ${a.stack || a.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
      }
    }
    throw (0, Ee.newError)(`Unable to find release with version ${t} (tried: ${n.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
  }
  setAuthHeaderForToken(t) {
    const r = {};
    return t != null && (t.startsWith("Bearer") ? r.authorization = t : r["PRIVATE-TOKEN"] = t), r;
  }
  /**
   * Get version info for blockmap files, using cache when possible
   */
  async getVersionInfoForBlockMap(t) {
    if (this.cachedLatestVersion && this.cachedLatestVersion.version === t)
      return this.cachedLatestVersion.assets;
    const r = await this.fetchReleaseInfoByVersion(t);
    return r && r.assets ? this.convertAssetsToMap(r.assets) : null;
  }
  /**
   * Find blockmap URLs from version assets
   */
  async findBlockMapUrlsFromAssets(t, r, n) {
    let i = null, o = null;
    const a = await this.getVersionInfoForBlockMap(r);
    a && (i = this.findBlockMapInAssets(a, n));
    const s = await this.getVersionInfoForBlockMap(t);
    if (s) {
      const l = n.replace(new RegExp(aw(r), "g"), t);
      o = this.findBlockMapInAssets(s, l);
    }
    return [o, i];
  }
  async getBlockMapFiles(t, r, n, i = null) {
    if (this.options.uploadTarget === "project_upload") {
      const o = t.pathname.split("/").pop() || "", [a, s] = await this.findBlockMapUrlsFromAssets(r, n, o);
      if (!s)
        throw (0, Ee.newError)(`Cannot find blockmap file for ${n} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      if (!a)
        throw (0, Ee.newError)(`Cannot find blockmap file for ${r} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      return [a, s];
    } else
      return super.getBlockMapFiles(t, r, n, i);
  }
  resolveFiles(t) {
    return (0, Zi.getFileList)(t).map((r) => {
      const i = [
        r.url,
        // Original filename
        this.normalizeFilename(r.url)
        // Normalized filename (spaces/underscores → dashes)
      ].find((a) => t.assets.has(a)), o = i ? t.assets.get(i) : void 0;
      if (!o)
        throw (0, Ee.newError)(`Cannot find asset "${r.url}" in GitLab release assets. Available assets: ${Array.from(t.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new Qi.URL(o),
        info: r
      };
    });
  }
  toString() {
    return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
  }
}
pi.GitLabProvider = sw;
var mi = {};
Object.defineProperty(mi, "__esModule", { value: !0 });
mi.KeygenProvider = void 0;
const Qs = he, eo = Ke, to = ce;
class lw extends to.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r, this.defaultHostname = "api.keygen.sh";
    const i = this.configuration.host || this.defaultHostname;
    this.baseUrl = (0, eo.newBaseUrl)(`https://${i}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "stable";
  }
  async getLatestVersion() {
    const t = new Qs.CancellationToken(), r = (0, eo.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, eo.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, {
        Accept: "application/vnd.api+json",
        "Keygen-Version": "1.1"
      }, t);
      return (0, to.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Qs.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, to.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { account: t, product: r, platform: n } = this.configuration;
    return `Keygen (account: ${t}, product: ${r}, platform: ${n}, channel: ${this.channel})`;
  }
}
mi.KeygenProvider = lw;
var gi = {};
Object.defineProperty(gi, "__esModule", { value: !0 });
gi.PrivateGitHubProvider = void 0;
const Xt = he, cw = ve, uw = Y, Zs = Tt, el = Ke, fw = _t, dw = ce;
class hw extends fw.BaseGitHubProvider {
  constructor(t, r, n, i) {
    super(t, "api.github.com", i), this.updater = r, this.token = n;
  }
  createRequestOptions(t, r) {
    const n = super.createRequestOptions(t, r);
    return n.redirect = "manual", n;
  }
  async getLatestVersion() {
    const t = new Xt.CancellationToken(), r = (0, el.getChannelFilename)(this.getDefaultChannelName()), n = await this.getLatestVersionInfo(t), i = n.assets.find((s) => s.name === r);
    if (i == null)
      throw (0, Xt.newError)(`Cannot find ${r} in the release ${n.html_url || n.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
    const o = new Zs.URL(i.url);
    let a;
    try {
      a = (0, cw.load)(await this.httpRequest(o, this.configureHeaders("application/octet-stream"), t));
    } catch (s) {
      throw s instanceof Xt.HttpError && s.statusCode === 404 ? (0, Xt.newError)(`Cannot find ${r} in the latest release artifacts (${o}): ${s.stack || s.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : s;
    }
    return a.assets = n.assets, a;
  }
  get fileExtraDownloadHeaders() {
    return this.configureHeaders("application/octet-stream");
  }
  configureHeaders(t) {
    return {
      accept: t,
      authorization: `token ${this.token}`
    };
  }
  async getLatestVersionInfo(t) {
    const r = this.updater.allowPrerelease;
    let n = this.basePath;
    r || (n = `${n}/latest`);
    const i = (0, el.newUrlFromBase)(n, this.baseUrl);
    try {
      const o = JSON.parse(await this.httpRequest(i, this.configureHeaders("application/vnd.github.v3+json"), t));
      if (r) {
        const a = o.filter((s) => !s.draft);
        return a.find((s) => s.prerelease) || a[0];
      } else
        return o;
    } catch (o) {
      throw (0, Xt.newError)(`Unable to find latest version on GitHub (${i}), please ensure a production release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
  }
  resolveFiles(t) {
    return (0, dw.getFileList)(t).map((r) => {
      const n = uw.posix.basename(r.url).replace(/ /g, "-"), i = t.assets.find((o) => o != null && o.name === n);
      if (i == null)
        throw (0, Xt.newError)(`Cannot find asset "${n}" in: ${JSON.stringify(t.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new Zs.URL(i.url),
        info: r
      };
    });
  }
}
gi.PrivateGitHubProvider = hw;
Object.defineProperty(di, "__esModule", { value: !0 });
di.isUrlProbablySupportMultiRangeRequests = Hu;
di.createClient = vw;
const In = he, pw = hi, tl = on, mw = _t, gw = pi, Ew = mi, yw = gi;
function Hu(e) {
  return !e.includes("s3.amazonaws.com");
}
function vw(e, t, r) {
  if (typeof e == "string")
    throw (0, In.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
  const n = e.provider;
  switch (n) {
    case "github": {
      const i = e, o = (i.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || i.token;
      return o == null ? new mw.GitHubProvider(i, t, r) : new yw.PrivateGitHubProvider(i, t, o, r);
    }
    case "bitbucket":
      return new pw.BitbucketProvider(e, t, r);
    case "gitlab":
      return new gw.GitLabProvider(e, t, r);
    case "keygen":
      return new Ew.KeygenProvider(e, t, r);
    case "s3":
    case "spaces":
      return new tl.GenericProvider({
        provider: "generic",
        url: (0, In.getS3LikeProviderBaseUrl)(e),
        channel: e.channel || null
      }, t, {
        ...r,
        // https://github.com/minio/minio/issues/5285#issuecomment-350428955
        isUseMultipleRangeRequest: !1
      });
    case "generic": {
      const i = e;
      return new tl.GenericProvider(i, t, {
        ...r,
        isUseMultipleRangeRequest: i.useMultipleRangeRequest !== !1 && Hu(i.url)
      });
    }
    case "custom": {
      const i = e, o = i.updateProvider;
      if (!o)
        throw (0, In.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
      return new o(i, t, r);
    }
    default:
      throw (0, In.newError)(`Unsupported provider: ${n}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
  }
}
var Ei = {}, an = {}, mr = {}, Gt = {};
Object.defineProperty(Gt, "__esModule", { value: !0 });
Gt.OperationKind = void 0;
Gt.computeOperations = ww;
var xt;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(xt || (Gt.OperationKind = xt = {}));
function ww(e, t, r) {
  const n = nl(e.files), i = nl(t.files);
  let o = null;
  const a = t.files[0], s = [], l = a.name, h = n.get(l);
  if (h == null)
    throw new Error(`no file ${l} in old blockmap`);
  const c = i.get(l);
  let f = 0;
  const { checksumToOffset: g, checksumToOldSize: m } = Aw(n.get(l), h.offset, r);
  let v = a.offset;
  for (let E = 0; E < c.checksums.length; v += c.sizes[E], E++) {
    const A = c.sizes[E], T = c.checksums[E];
    let C = g.get(T);
    C != null && m.get(T) !== A && (r.warn(`Checksum ("${T}") matches, but size differs (old: ${m.get(T)}, new: ${A})`), C = void 0), C === void 0 ? (f++, o != null && o.kind === xt.DOWNLOAD && o.end === v ? o.end += A : (o = {
      kind: xt.DOWNLOAD,
      start: v,
      end: v + A
      // oldBlocks: null,
    }, rl(o, s, T, E))) : o != null && o.kind === xt.COPY && o.end === C ? o.end += A : (o = {
      kind: xt.COPY,
      start: C,
      end: C + A
      // oldBlocks: [checksum]
    }, rl(o, s, T, E));
  }
  return f > 0 && r.info(`File${a.name === "file" ? "" : " " + a.name} has ${f} changed blocks`), s;
}
const _w = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
function rl(e, t, r, n) {
  if (_w && t.length !== 0) {
    const i = t[t.length - 1];
    if (i.kind === e.kind && e.start < i.end && e.start > i.start) {
      const o = [i.start, i.end, e.start, e.end].reduce((a, s) => a < s ? a : s);
      throw new Error(`operation (block index: ${n}, checksum: ${r}, kind: ${xt[e.kind]}) overlaps previous operation (checksum: ${r}):
abs: ${i.start} until ${i.end} and ${e.start} until ${e.end}
rel: ${i.start - o} until ${i.end - o} and ${e.start - o} until ${e.end - o}`);
    }
  }
  t.push(e);
}
function Aw(e, t, r) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  let o = t;
  for (let a = 0; a < e.checksums.length; a++) {
    const s = e.checksums[a], l = e.sizes[a], h = i.get(s);
    if (h === void 0)
      n.set(s, o), i.set(s, l);
    else if (r.debug != null) {
      const c = h === l ? "(same size)" : `(size: ${h}, this size: ${l})`;
      r.debug(`${s} duplicated in blockmap ${c}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
    }
    o += l;
  }
  return { checksumToOffset: n, checksumToOldSize: i };
}
function nl(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e)
    t.set(r.name, r);
  return t;
}
Object.defineProperty(mr, "__esModule", { value: !0 });
mr.DataSplitter = void 0;
mr.copyData = qu;
const Pn = he, Tw = We, Sw = zr, Cw = Gt, il = Buffer.from(`\r
\r
`);
var dt;
(function(e) {
  e[e.INIT = 0] = "INIT", e[e.HEADER = 1] = "HEADER", e[e.BODY = 2] = "BODY";
})(dt || (dt = {}));
function qu(e, t, r, n, i) {
  const o = (0, Tw.createReadStream)("", {
    fd: r,
    autoClose: !1,
    start: e.start,
    // end is inclusive
    end: e.end - 1
  });
  o.on("error", n), o.once("end", i), o.pipe(t, {
    end: !1
  });
}
class bw extends Sw.Writable {
  constructor(t, r, n, i, o, a, s, l) {
    super(), this.out = t, this.options = r, this.partIndexToTaskIndex = n, this.partIndexToLength = o, this.finishHandler = a, this.grandTotalBytes = s, this.onProgress = l, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = dt.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = i.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
  }
  get isFinished() {
    return this.partIndex === this.partIndexToLength.length;
  }
  // noinspection JSUnusedGlobalSymbols
  _write(t, r, n) {
    if (this.isFinished) {
      console.error(`Trailing ignored data: ${t.length} bytes`);
      return;
    }
    this.handleData(t).then(() => {
      if (this.onProgress) {
        const i = Date.now();
        (i >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (i - this.start) / 1e3 && (this.nextUpdate = i + 1e3, this.onProgress({
          total: this.grandTotalBytes,
          delta: this.delta,
          transferred: this.transferred,
          percent: this.transferred / this.grandTotalBytes * 100,
          bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
        }), this.delta = 0);
      }
      n();
    }).catch(n);
  }
  async handleData(t) {
    let r = 0;
    if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
      throw (0, Pn.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
    if (this.ignoreByteCount > 0) {
      const n = Math.min(this.ignoreByteCount, t.length);
      this.ignoreByteCount -= n, r = n;
    } else if (this.remainingPartDataCount > 0) {
      const n = Math.min(this.remainingPartDataCount, t.length);
      this.remainingPartDataCount -= n, await this.processPartData(t, 0, n), r = n;
    }
    if (r !== t.length) {
      if (this.readState === dt.HEADER) {
        const n = this.searchHeaderListEnd(t, r);
        if (n === -1)
          return;
        r = n, this.readState = dt.BODY, this.headerListBuffer = null;
      }
      for (; ; ) {
        if (this.readState === dt.BODY)
          this.readState = dt.INIT;
        else {
          this.partIndex++;
          let a = this.partIndexToTaskIndex.get(this.partIndex);
          if (a == null)
            if (this.isFinished)
              a = this.options.end;
            else
              throw (0, Pn.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
          const s = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
          if (s < a)
            await this.copyExistingData(s, a);
          else if (s > a)
            throw (0, Pn.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
          if (this.isFinished) {
            this.onPartEnd(), this.finishHandler();
            return;
          }
          if (r = this.searchHeaderListEnd(t, r), r === -1) {
            this.readState = dt.HEADER;
            return;
          }
        }
        const n = this.partIndexToLength[this.partIndex], i = r + n, o = Math.min(i, t.length);
        if (await this.processPartStarted(t, r, o), this.remainingPartDataCount = n - (o - r), this.remainingPartDataCount > 0)
          return;
        if (r = i + this.boundaryLength, r >= t.length) {
          this.ignoreByteCount = this.boundaryLength - (t.length - i);
          return;
        }
      }
    }
  }
  copyExistingData(t, r) {
    return new Promise((n, i) => {
      const o = () => {
        if (t === r) {
          n();
          return;
        }
        const a = this.options.tasks[t];
        if (a.kind !== Cw.OperationKind.COPY) {
          i(new Error("Task kind must be COPY"));
          return;
        }
        qu(a, this.out, this.options.oldFileFd, i, () => {
          t++, o();
        });
      };
      o();
    });
  }
  searchHeaderListEnd(t, r) {
    const n = t.indexOf(il, r);
    if (n !== -1)
      return n + il.length;
    const i = r === 0 ? t : t.slice(r);
    return this.headerListBuffer == null ? this.headerListBuffer = i : this.headerListBuffer = Buffer.concat([this.headerListBuffer, i]), -1;
  }
  onPartEnd() {
    const t = this.partIndexToLength[this.partIndex - 1];
    if (this.actualPartLength !== t)
      throw (0, Pn.newError)(`Expected length: ${t} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
    this.actualPartLength = 0;
  }
  processPartStarted(t, r, n) {
    return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(t, r, n);
  }
  processPartData(t, r, n) {
    this.actualPartLength += n - r, this.transferred += n - r, this.delta += n - r;
    const i = this.out;
    return i.write(r === 0 && t.length === n ? t : t.slice(r, n)) ? Promise.resolve() : new Promise((o, a) => {
      i.on("error", a), i.once("drain", () => {
        i.removeListener("error", a), o();
      });
    });
  }
}
mr.DataSplitter = bw;
var yi = {};
Object.defineProperty(yi, "__esModule", { value: !0 });
yi.executeTasksUsingMultipleRangeRequests = $w;
yi.checkIsRangesSupported = bo;
const Co = he, ol = mr, al = Gt;
function $w(e, t, r, n, i) {
  const o = (a) => {
    if (a >= t.length) {
      e.fileMetadataBuffer != null && r.write(e.fileMetadataBuffer), r.end();
      return;
    }
    const s = a + 1e3;
    Rw(e, {
      tasks: t,
      start: a,
      end: Math.min(t.length, s),
      oldFileFd: n
    }, r, () => o(s), i);
  };
  return o;
}
function Rw(e, t, r, n, i) {
  let o = "bytes=", a = 0, s = 0;
  const l = /* @__PURE__ */ new Map(), h = [];
  for (let g = t.start; g < t.end; g++) {
    const m = t.tasks[g];
    m.kind === al.OperationKind.DOWNLOAD && (o += `${m.start}-${m.end - 1}, `, l.set(a, g), a++, h.push(m.end - m.start), s += m.end - m.start);
  }
  if (a <= 1) {
    const g = (m) => {
      if (m >= t.end) {
        n();
        return;
      }
      const v = t.tasks[m++];
      if (v.kind === al.OperationKind.COPY)
        (0, ol.copyData)(v, r, t.oldFileFd, i, () => g(m));
      else {
        const E = e.createRequestOptions();
        E.headers.Range = `bytes=${v.start}-${v.end - 1}`;
        const A = e.httpExecutor.createRequest(E, (T) => {
          T.on("error", i), bo(T, i) && (T.pipe(r, {
            end: !1
          }), T.once("end", () => g(m)));
        });
        e.httpExecutor.addErrorAndTimeoutHandlers(A, i), A.end();
      }
    };
    g(t.start);
    return;
  }
  const c = e.createRequestOptions();
  c.headers.Range = o.substring(0, o.length - 2);
  const f = e.httpExecutor.createRequest(c, (g) => {
    if (!bo(g, i))
      return;
    const m = (0, Co.safeGetHeader)(g, "content-type"), v = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(m);
    if (v == null) {
      i(new Error(`Content-Type "multipart/byteranges" is expected, but got "${m}"`));
      return;
    }
    const E = new ol.DataSplitter(r, t, l, v[1] || v[2], h, n, s, e.options.onProgress);
    E.on("error", i), g.pipe(E), g.on("end", () => {
      setTimeout(() => {
        f.abort(), i(new Error("Response ends without calling any handlers"));
      }, 1e4);
    });
  });
  e.httpExecutor.addErrorAndTimeoutHandlers(f, i), f.end();
}
function bo(e, t) {
  if (e.statusCode >= 400)
    return t((0, Co.createHttpError)(e)), !1;
  if (e.statusCode !== 206) {
    const r = (0, Co.safeGetHeader)(e, "accept-ranges");
    if (r == null || r === "none")
      return t(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)), !1;
  }
  return !0;
}
var vi = {};
Object.defineProperty(vi, "__esModule", { value: !0 });
vi.ProgressDifferentialDownloadCallbackTransform = void 0;
const Ow = zr;
var or;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(or || (or = {}));
class Iw extends Ow.Transform {
  constructor(t, r, n) {
    super(), this.progressDifferentialDownloadInfo = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = or.COPY, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    if (this.operationType == or.COPY) {
      n(null, t);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), n(null, t);
  }
  beginFileCopy() {
    this.operationType = or.COPY;
  }
  beginRangeDownload() {
    this.operationType = or.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
  }
  endRangeDownload() {
    this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    });
  }
  // Called when we are 100% done with the connection/download
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, this.transferred = 0, t(null);
  }
}
vi.ProgressDifferentialDownloadCallbackTransform = Iw;
Object.defineProperty(an, "__esModule", { value: !0 });
an.DifferentialDownloader = void 0;
const br = he, ro = St, Pw = We, Nw = mr, Dw = Tt, Nn = Gt, sl = yi, Fw = vi;
class xw {
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(t, r, n) {
    this.blockAwareFileInfo = t, this.httpExecutor = r, this.options = n, this.fileMetadataBuffer = null, this.logger = n.logger;
  }
  createRequestOptions() {
    const t = {
      headers: {
        ...this.options.requestHeaders,
        accept: "*/*"
      }
    };
    return (0, br.configureRequestUrl)(this.options.newUrl, t), (0, br.configureRequestOptions)(t), t;
  }
  doDownload(t, r) {
    if (t.version !== r.version)
      throw new Error(`version is different (${t.version} - ${r.version}), full download is required`);
    const n = this.logger, i = (0, Nn.computeOperations)(t, r, n);
    n.debug != null && n.debug(JSON.stringify(i, null, 2));
    let o = 0, a = 0;
    for (const l of i) {
      const h = l.end - l.start;
      l.kind === Nn.OperationKind.DOWNLOAD ? o += h : a += h;
    }
    const s = this.blockAwareFileInfo.size;
    if (o + a + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== s)
      throw new Error(`Internal error, size mismatch: downloadSize: ${o}, copySize: ${a}, newSize: ${s}`);
    return n.info(`Full: ${ll(s)}, To download: ${ll(o)} (${Math.round(o / (s / 100))}%)`), this.downloadFile(i);
  }
  downloadFile(t) {
    const r = [], n = () => Promise.all(r.map((i) => (0, ro.close)(i.descriptor).catch((o) => {
      this.logger.error(`cannot close file "${i.path}": ${o}`);
    })));
    return this.doDownloadFile(t, r).then(n).catch((i) => n().catch((o) => {
      try {
        this.logger.error(`cannot close files: ${o}`);
      } catch (a) {
        try {
          console.error(a);
        } catch {
        }
      }
      throw i;
    }).then(() => {
      throw i;
    }));
  }
  async doDownloadFile(t, r) {
    const n = await (0, ro.open)(this.options.oldFile, "r");
    r.push({ descriptor: n, path: this.options.oldFile });
    const i = await (0, ro.open)(this.options.newFile, "w");
    r.push({ descriptor: i, path: this.options.newFile });
    const o = (0, Pw.createWriteStream)(this.options.newFile, { fd: i });
    await new Promise((a, s) => {
      const l = [];
      let h;
      if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
        const T = [];
        let C = 0;
        for (const B of t)
          B.kind === Nn.OperationKind.DOWNLOAD && (T.push(B.end - B.start), C += B.end - B.start);
        const D = {
          expectedByteCounts: T,
          grandTotal: C
        };
        h = new Fw.ProgressDifferentialDownloadCallbackTransform(D, this.options.cancellationToken, this.options.onProgress), l.push(h);
      }
      const c = new br.DigestTransform(this.blockAwareFileInfo.sha512);
      c.isValidateOnEnd = !1, l.push(c), o.on("finish", () => {
        o.close(() => {
          r.splice(1, 1);
          try {
            c.validate();
          } catch (T) {
            s(T);
            return;
          }
          a(void 0);
        });
      }), l.push(o);
      let f = null;
      for (const T of l)
        T.on("error", s), f == null ? f = T : f = f.pipe(T);
      const g = l[0];
      let m;
      if (this.options.isUseMultipleRangeRequest) {
        m = (0, sl.executeTasksUsingMultipleRangeRequests)(this, t, g, n, s), m(0);
        return;
      }
      let v = 0, E = null;
      this.logger.info(`Differential download: ${this.options.newUrl}`);
      const A = this.createRequestOptions();
      A.redirect = "manual", m = (T) => {
        var C, D;
        if (T >= t.length) {
          this.fileMetadataBuffer != null && g.write(this.fileMetadataBuffer), g.end();
          return;
        }
        const B = t[T++];
        if (B.kind === Nn.OperationKind.COPY) {
          h && h.beginFileCopy(), (0, Nw.copyData)(B, g, n, s, () => m(T));
          return;
        }
        const G = `bytes=${B.start}-${B.end - 1}`;
        A.headers.range = G, (D = (C = this.logger) === null || C === void 0 ? void 0 : C.debug) === null || D === void 0 || D.call(C, `download range: ${G}`), h && h.beginRangeDownload();
        const Z = this.httpExecutor.createRequest(A, (ee) => {
          ee.on("error", s), ee.on("aborted", () => {
            s(new Error("response has been aborted by the server"));
          }), ee.statusCode >= 400 && s((0, br.createHttpError)(ee)), ee.pipe(g, {
            end: !1
          }), ee.once("end", () => {
            h && h.endRangeDownload(), ++v === 100 ? (v = 0, setTimeout(() => m(T), 1e3)) : m(T);
          });
        });
        Z.on("redirect", (ee, ae, U) => {
          this.logger.info(`Redirect to ${Lw(U)}`), E = U, (0, br.configureRequestUrl)(new Dw.URL(E), A), Z.followRedirect();
        }), this.httpExecutor.addErrorAndTimeoutHandlers(Z, s), Z.end();
      }, m(0);
    });
  }
  async readRemoteBytes(t, r) {
    const n = Buffer.allocUnsafe(r + 1 - t), i = this.createRequestOptions();
    i.headers.range = `bytes=${t}-${r}`;
    let o = 0;
    if (await this.request(i, (a) => {
      a.copy(n, o), o += a.length;
    }), o !== n.length)
      throw new Error(`Received data length ${o} is not equal to expected ${n.length}`);
    return n;
  }
  request(t, r) {
    return new Promise((n, i) => {
      const o = this.httpExecutor.createRequest(t, (a) => {
        (0, sl.checkIsRangesSupported)(a, i) && (a.on("error", i), a.on("aborted", () => {
          i(new Error("response has been aborted by the server"));
        }), a.on("data", r), a.on("end", () => n()));
      });
      this.httpExecutor.addErrorAndTimeoutHandlers(o, i), o.end();
    });
  }
}
an.DifferentialDownloader = xw;
function ll(e, t = " KB") {
  return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
}
function Lw(e) {
  const t = e.indexOf("?");
  return t < 0 ? e : e.substring(0, t);
}
Object.defineProperty(Ei, "__esModule", { value: !0 });
Ei.GenericDifferentialDownloader = void 0;
const Uw = an;
class kw extends Uw.DifferentialDownloader {
  download(t, r) {
    return this.doDownload(t, r);
  }
}
Ei.GenericDifferentialDownloader = kw;
var Ct = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = n;
  const t = he;
  Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
  class r {
    constructor(o) {
      this.emitter = o;
    }
    /**
     * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
     */
    login(o) {
      n(this.emitter, "login", o);
    }
    progress(o) {
      n(this.emitter, e.DOWNLOAD_PROGRESS, o);
    }
    updateDownloaded(o) {
      n(this.emitter, e.UPDATE_DOWNLOADED, o);
    }
    updateCancelled(o) {
      n(this.emitter, "update-cancelled", o);
    }
  }
  e.UpdaterSignal = r;
  function n(i, o, a) {
    i.on(o, a);
  }
})(Ct);
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.NoOpLogger = Et.AppUpdater = void 0;
const be = he, Mw = Xr, Bw = Kn, jw = Rl, Ge = St, Hw = ve, no = oi, Me = Y, Dt = Fu, cl = nn, qw = fi, ul = xu, Gw = on, io = di, oo = Il, Vw = Ei, Kt = Ct;
class sa extends jw.EventEmitter {
  /**
   * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
   */
  get channel() {
    return this._channel;
  }
  /**
   * Set the update channel. Overrides `channel` in the update configuration.
   *
   * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
   */
  set channel(t) {
    if (this._channel != null) {
      if (typeof t != "string")
        throw (0, be.newError)(`Channel must be a string, but got: ${t}`, "ERR_UPDATER_INVALID_CHANNEL");
      if (t.length === 0)
        throw (0, be.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
    }
    this._channel = t, this.allowDowngrade = !0;
  }
  /**
   *  Shortcut for explicitly adding auth tokens to request headers
   */
  addAuthHeader(t) {
    this.requestHeaders = Object.assign({}, this.requestHeaders, {
      authorization: t
    });
  }
  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  get netSession() {
    return (0, ul.getNetSession)();
  }
  /**
   * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
   * Set it to `null` if you would like to disable a logging feature.
   */
  get logger() {
    return this._logger;
  }
  set logger(t) {
    this._logger = t ?? new Gu();
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * test only
   * @private
   */
  set updateConfigPath(t) {
    this.clientPromise = null, this._appUpdateConfigPath = t, this.configOnDisk = new no.Lazy(() => this.loadUpdateConfig());
  }
  /**
   * Allows developer to override default logic for determining if an update is supported.
   * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
   */
  get isUpdateSupported() {
    return this._isUpdateSupported;
  }
  set isUpdateSupported(t) {
    t && (this._isUpdateSupported = t);
  }
  /**
   * Allows developer to override default logic for determining if the user is below the rollout threshold.
   * The default logic compares the staging percentage with numerical representation of user ID.
   * An override can define custom logic, or bypass it if needed.
   */
  get isUserWithinRollout() {
    return this._isUserWithinRollout;
  }
  set isUserWithinRollout(t) {
    t && (this._isUserWithinRollout = t);
  }
  constructor(t, r) {
    super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new Kt.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (o) => this.checkIfUpdateSupported(o), this._isUserWithinRollout = (o) => this.isStagingMatch(o), this.clientPromise = null, this.stagingUserIdPromise = new no.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new no.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (o) => {
      this._logger.error(`Error: ${o.stack || o.message}`);
    }), r == null ? (this.app = new qw.ElectronAppAdapter(), this.httpExecutor = new ul.ElectronHttpExecutor((o, a) => this.emit("login", o, a))) : (this.app = r, this.httpExecutor = null);
    const n = this.app.version, i = (0, Dt.parse)(n);
    if (i == null)
      throw (0, be.newError)(`App version is not a valid semver version: "${n}"`, "ERR_UPDATER_INVALID_VERSION");
    this.currentVersion = i, this.allowPrerelease = Ww(i), t != null && (this.setFeedURL(t), typeof t != "string" && t.requestHeaders && (this.requestHeaders = t.requestHeaders));
  }
  //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  getFeedURL() {
    return "Deprecated. Do not use it.";
  }
  /**
   * Configure update provider. If value is `string`, [GenericServerOptions](https://www.electron.build/publish#genericserveroptions) will be set with value as `url`.
   * @param options If you want to override configuration in the `app-update.yml`.
   */
  setFeedURL(t) {
    const r = this.createProviderRuntimeOptions();
    let n;
    typeof t == "string" ? n = new Gw.GenericProvider({ provider: "generic", url: t }, this, {
      ...r,
      isUseMultipleRangeRequest: (0, io.isUrlProbablySupportMultiRangeRequests)(t)
    }) : n = (0, io.createClient)(t, this, r), this.clientPromise = Promise.resolve(n);
  }
  /**
   * Asks the server whether there is an update.
   * @returns null if the updater is disabled, otherwise info about the latest version
   */
  checkForUpdates() {
    if (!this.isUpdaterActive())
      return Promise.resolve(null);
    let t = this.checkForUpdatesPromise;
    if (t != null)
      return this._logger.info("Checking for update (already in progress)"), t;
    const r = () => this.checkForUpdatesPromise = null;
    return this._logger.info("Checking for update"), t = this.doCheckForUpdates().then((n) => (r(), n)).catch((n) => {
      throw r(), this.emit("error", n, `Cannot check for updates: ${(n.stack || n).toString()}`), n;
    }), this.checkForUpdatesPromise = t, t;
  }
  isUpdaterActive() {
    return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
  }
  // noinspection JSUnusedGlobalSymbols
  checkForUpdatesAndNotify(t) {
    return this.checkForUpdates().then((r) => r != null && r.downloadPromise ? (r.downloadPromise.then(() => {
      const n = sa.formatDownloadNotification(r.updateInfo.version, this.app.name, t);
      new kt.Notification(n).show();
    }), r) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), r));
  }
  static formatDownloadNotification(t, r, n) {
    return n == null && (n = {
      title: "A new update is ready to install",
      body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
    }), n = {
      title: n.title.replace("{appName}", r).replace("{version}", t),
      body: n.body.replace("{appName}", r).replace("{version}", t)
    }, n;
  }
  async isStagingMatch(t) {
    const r = t.stagingPercentage;
    let n = r;
    if (n == null)
      return !0;
    if (n = parseInt(n, 10), isNaN(n))
      return this._logger.warn(`Staging percentage is NaN: ${r}`), !0;
    n = n / 100;
    const i = await this.stagingUserIdPromise.value, a = be.UUID.parse(i).readUInt32BE(12) / 4294967295;
    return this._logger.info(`Staging percentage: ${n}, percentage: ${a}, user id: ${i}`), a < n;
  }
  computeFinalHeaders(t) {
    return this.requestHeaders != null && Object.assign(t, this.requestHeaders), t;
  }
  async isUpdateAvailable(t) {
    const r = (0, Dt.parse)(t.version);
    if (r == null)
      throw (0, be.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${t.version}"`, "ERR_UPDATER_INVALID_VERSION");
    const n = this.currentVersion;
    if ((0, Dt.eq)(r, n) || !await Promise.resolve(this.isUpdateSupported(t)) || !await Promise.resolve(this.isUserWithinRollout(t)))
      return !1;
    const o = (0, Dt.gt)(r, n), a = (0, Dt.lt)(r, n);
    return o ? !0 : this.allowDowngrade && a;
  }
  checkIfUpdateSupported(t) {
    const r = t == null ? void 0 : t.minimumSystemVersion, n = (0, Bw.release)();
    if (r)
      try {
        if ((0, Dt.lt)(n, r))
          return this._logger.info(`Current OS version ${n} is less than the minimum OS version required ${r} for version ${n}`), !1;
      } catch (i) {
        this._logger.warn(`Failed to compare current OS version(${n}) with minimum OS version(${r}): ${(i.message || i).toString()}`);
      }
    return !0;
  }
  async getUpdateInfoAndProvider() {
    await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((n) => (0, io.createClient)(n, this, this.createProviderRuntimeOptions())));
    const t = await this.clientPromise, r = await this.stagingUserIdPromise.value;
    return t.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": r })), {
      info: await t.getLatestVersion(),
      provider: t
    };
  }
  createProviderRuntimeOptions() {
    return {
      isUseMultipleRangeRequest: !0,
      platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
      executor: this.httpExecutor
    };
  }
  async doCheckForUpdates() {
    this.emit("checking-for-update");
    const t = await this.getUpdateInfoAndProvider(), r = t.info;
    if (!await this.isUpdateAvailable(r))
      return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${r.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", r), {
        isUpdateAvailable: !1,
        versionInfo: r,
        updateInfo: r
      };
    this.updateInfoAndProvider = t, this.onUpdateAvailable(r);
    const n = new be.CancellationToken();
    return {
      isUpdateAvailable: !0,
      versionInfo: r,
      updateInfo: r,
      cancellationToken: n,
      downloadPromise: this.autoDownload ? this.downloadUpdate(n) : null
    };
  }
  onUpdateAvailable(t) {
    this._logger.info(`Found version ${t.version} (url: ${(0, be.asArray)(t.files).map((r) => r.url).join(", ")})`), this.emit("update-available", t);
  }
  /**
   * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
   * @returns {Promise<Array<string>>} Paths to downloaded files.
   */
  downloadUpdate(t = new be.CancellationToken()) {
    const r = this.updateInfoAndProvider;
    if (r == null) {
      const i = new Error("Please check update first");
      return this.dispatchError(i), Promise.reject(i);
    }
    if (this.downloadPromise != null)
      return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
    this._logger.info(`Downloading update from ${(0, be.asArray)(r.info.files).map((i) => i.url).join(", ")}`);
    const n = (i) => {
      if (!(i instanceof be.CancellationError))
        try {
          this.dispatchError(i);
        } catch (o) {
          this._logger.warn(`Cannot dispatch error event: ${o.stack || o}`);
        }
      return i;
    };
    return this.downloadPromise = this.doDownloadUpdate({
      updateInfoAndProvider: r,
      requestHeaders: this.computeRequestHeaders(r.provider),
      cancellationToken: t,
      disableWebInstaller: this.disableWebInstaller,
      disableDifferentialDownload: this.disableDifferentialDownload
    }).catch((i) => {
      throw n(i);
    }).finally(() => {
      this.downloadPromise = null;
    }), this.downloadPromise;
  }
  dispatchError(t) {
    this.emit("error", t, (t.stack || t).toString());
  }
  dispatchUpdateDownloaded(t) {
    this.emit(Kt.UPDATE_DOWNLOADED, t);
  }
  async loadUpdateConfig() {
    return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, Hw.load)(await (0, Ge.readFile)(this._appUpdateConfigPath, "utf-8"));
  }
  computeRequestHeaders(t) {
    const r = t.fileExtraDownloadHeaders;
    if (r != null) {
      const n = this.requestHeaders;
      return n == null ? r : {
        ...r,
        ...n
      };
    }
    return this.computeFinalHeaders({ accept: "*/*" });
  }
  async getOrCreateStagingUserId() {
    const t = Me.join(this.app.userDataPath, ".updaterId");
    try {
      const n = await (0, Ge.readFile)(t, "utf-8");
      if (be.UUID.check(n))
        return n;
      this._logger.warn(`Staging user id file exists, but content was invalid: ${n}`);
    } catch (n) {
      n.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${n}`);
    }
    const r = be.UUID.v5((0, Mw.randomBytes)(4096), be.UUID.OID);
    this._logger.info(`Generated new staging user ID: ${r}`);
    try {
      await (0, Ge.outputFile)(t, r);
    } catch (n) {
      this._logger.warn(`Couldn't write out staging user ID: ${n}`);
    }
    return r;
  }
  /** @internal */
  get isAddNoCacheQuery() {
    const t = this.requestHeaders;
    if (t == null)
      return !0;
    for (const r of Object.keys(t)) {
      const n = r.toLowerCase();
      if (n === "authorization" || n === "private-token")
        return !1;
    }
    return !0;
  }
  async getOrCreateDownloadHelper() {
    let t = this.downloadedUpdateHelper;
    if (t == null) {
      const r = (await this.configOnDisk.value).updaterCacheDirName, n = this._logger;
      r == null && n.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
      const i = Me.join(this.app.baseCachePath, r || this.app.name);
      n.debug != null && n.debug(`updater cache dir: ${i}`), t = new cl.DownloadedUpdateHelper(i), this.downloadedUpdateHelper = t;
    }
    return t;
  }
  async executeDownload(t) {
    const r = t.fileInfo, n = {
      headers: t.downloadUpdateOptions.requestHeaders,
      cancellationToken: t.downloadUpdateOptions.cancellationToken,
      sha2: r.info.sha2,
      sha512: r.info.sha512
    };
    this.listenerCount(Kt.DOWNLOAD_PROGRESS) > 0 && (n.onProgress = (C) => this.emit(Kt.DOWNLOAD_PROGRESS, C));
    const i = t.downloadUpdateOptions.updateInfoAndProvider.info, o = i.version, a = r.packageInfo;
    function s() {
      const C = decodeURIComponent(t.fileInfo.url.pathname);
      return C.toLowerCase().endsWith(`.${t.fileExtension.toLowerCase()}`) ? Me.basename(C) : Me.basename(t.fileInfo.info.url);
    }
    const l = await this.getOrCreateDownloadHelper(), h = l.cacheDirForPendingUpdate;
    await (0, Ge.mkdir)(h, { recursive: !0 });
    const c = s();
    let f = Me.join(h, c);
    const g = a == null ? null : Me.join(h, `package-${o}${Me.extname(a.path) || ".7z"}`), m = async (C) => {
      await l.setDownloadedFile(f, g, i, r, c, C), await t.done({
        ...i,
        downloadedFile: f
      });
      const D = Me.join(h, "current.blockmap");
      return await (0, Ge.pathExists)(D) && await (0, Ge.copyFile)(D, Me.join(l.cacheDir, "current.blockmap")), g == null ? [f] : [f, g];
    }, v = this._logger, E = await l.validateDownloadedPath(f, i, r, v);
    if (E != null)
      return f = E, await m(!1);
    const A = async () => (await l.clear().catch(() => {
    }), await (0, Ge.unlink)(f).catch(() => {
    })), T = await (0, cl.createTempUpdateFile)(`temp-${c}`, h, v);
    try {
      await t.task(T, n, g, A), await (0, be.retry)(() => (0, Ge.rename)(T, f), {
        retries: 60,
        interval: 500,
        shouldRetry: (C) => C instanceof Error && /^EBUSY:/.test(C.message) ? !0 : (v.warn(`Cannot rename temp file to final file: ${C.message || C.stack}`), !1)
      });
    } catch (C) {
      throw await A(), C instanceof be.CancellationError && (v.info("cancelled"), this.emit("update-cancelled", i)), C;
    }
    return v.info(`New version ${o} has been downloaded to ${f}`), await m(!0);
  }
  async differentialDownloadInstaller(t, r, n, i, o) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
        return !0;
      const a = r.updateInfoAndProvider.provider, s = await a.getBlockMapFiles(t.url, this.app.version, r.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
      this._logger.info(`Download block maps (old: "${s[0]}", new: ${s[1]})`);
      const l = async (v) => {
        const E = await this.httpExecutor.downloadToBuffer(v, {
          headers: r.requestHeaders,
          cancellationToken: r.cancellationToken
        });
        if (E == null || E.length === 0)
          throw new Error(`Blockmap "${v.href}" is empty`);
        try {
          return JSON.parse((0, oo.gunzipSync)(E).toString());
        } catch (A) {
          throw new Error(`Cannot parse blockmap "${v.href}", error: ${A}`);
        }
      }, h = {
        newUrl: t.url,
        oldFile: Me.join(this.downloadedUpdateHelper.cacheDir, o),
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: a.isUseMultipleRangeRequest,
        requestHeaders: r.requestHeaders,
        cancellationToken: r.cancellationToken
      };
      this.listenerCount(Kt.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (v) => this.emit(Kt.DOWNLOAD_PROGRESS, v));
      const c = async (v, E) => {
        const A = Me.join(E, "current.blockmap");
        await (0, Ge.outputFile)(A, (0, oo.gzipSync)(JSON.stringify(v)));
      }, f = async (v) => {
        const E = Me.join(v, "current.blockmap");
        try {
          if (await (0, Ge.pathExists)(E))
            return JSON.parse((0, oo.gunzipSync)(await (0, Ge.readFile)(E)).toString());
        } catch (A) {
          this._logger.warn(`Cannot parse blockmap "${E}", error: ${A}`);
        }
        return null;
      }, g = await l(s[1]);
      await c(g, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
      let m = await f(this.downloadedUpdateHelper.cacheDir);
      return m == null && (m = await l(s[0])), await new Vw.GenericDifferentialDownloader(t.info, this.httpExecutor, h).download(m, g), !1;
    } catch (a) {
      if (this._logger.error(`Cannot download differentially, fallback to full download: ${a.stack || a}`), this._testOnlyOptions != null)
        throw a;
      return !0;
    }
  }
}
Et.AppUpdater = sa;
function Ww(e) {
  const t = (0, Dt.prerelease)(e);
  return t != null && t.length > 0;
}
class Gu {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(t) {
  }
}
Et.NoOpLogger = Gu;
Object.defineProperty(Ht, "__esModule", { value: !0 });
Ht.BaseUpdater = void 0;
const fl = Xn, ao = Y, Yw = Et;
class zw extends Yw.AppUpdater {
  constructor(t, r) {
    super(t, r), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
  }
  quitAndInstall(t = !1, r = !1) {
    this._logger.info("Install on explicit quitAndInstall"), this.install(t, t ? r : this.autoRunAppAfterInstall) ? setImmediate(() => {
      kt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
    }) : this.quitAndInstallCalled = !1;
  }
  executeDownload(t) {
    return super.executeDownload({
      ...t,
      done: (r) => (this.dispatchUpdateDownloaded(r), this.addQuitHandler(), Promise.resolve())
    });
  }
  get installerPath() {
    return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
  }
  // must be sync (because quit even handler is not async)
  install(t = !1, r = !1) {
    if (this.quitAndInstallCalled)
      return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
    const n = this.downloadedUpdateHelper, i = this.installerPath, o = n == null ? null : n.downloadedFileInfo;
    if (i == null || o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    this.quitAndInstallCalled = !0;
    try {
      return this._logger.info(`Install: isSilent: ${t}, isForceRunAfter: ${r}`), this.doInstall({
        isSilent: t,
        isForceRunAfter: r,
        isAdminRightsRequired: o.isAdminRightsRequired
      });
    } catch (a) {
      return this.dispatchError(a), !1;
    }
  }
  addQuitHandler() {
    this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((t) => {
      if (this.quitAndInstallCalled) {
        this._logger.info("Update installer has already been triggered. Quitting application.");
        return;
      }
      if (!this.autoInstallOnAppQuit) {
        this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
        return;
      }
      if (t !== 0) {
        this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${t}`);
        return;
      }
      this._logger.info("Auto install update on quit"), this.install(!0, !1);
    }));
  }
  /**
   * Strips relative-path entries from a PATH string.
   * Prevents PATH-poisoning where a writable directory earlier in PATH shadows
   * a trusted package manager binary.
   */
  sanitizeEnvPath(t) {
    return t.split(ao.delimiter).filter((r) => ao.isAbsolute(r)).join(ao.delimiter);
  }
  spawnSyncLog(t, r = [], n = {}) {
    var i;
    this._logger.info(`Executing: ${t} with args: ${r}`);
    const o = { ...process.env, ...n }, a = (0, fl.spawnSync)(t, r, {
      env: { ...o, PATH: this.sanitizeEnvPath((i = o.PATH) !== null && i !== void 0 ? i : "") },
      encoding: "utf-8",
      shell: !0
    }), { error: s, status: l, stdout: h, stderr: c } = a;
    if (s != null)
      throw this._logger.error(c), s;
    if (l != null && l !== 0)
      throw this._logger.error(c), new Error(`Command ${t} exited with code ${l}`);
    return h.trim();
  }
  /**
   * This handles both node 8 and node 10 way of emitting error when spawning a process
   *   - node 8: Throws the error
   *   - node 10: Emit the error(Need to listen with on)
   */
  // https://github.com/electron-userland/electron-builder/issues/1129
  // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
  async spawnLog(t, r = [], n = void 0, i = "ignore") {
    return this._logger.info(`Executing: ${t} with args: ${r}`), new Promise((o, a) => {
      try {
        const s = { stdio: i, env: n, detached: !0 }, l = (0, fl.spawn)(t, r, s);
        l.on("error", (h) => {
          a(h);
        }), l.unref(), l.pid !== void 0 && o(!0);
      } catch (s) {
        a(s);
      }
    });
  }
}
Ht.BaseUpdater = zw;
var Hr = {}, sn = {};
Object.defineProperty(sn, "__esModule", { value: !0 });
sn.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
const Jt = St, Xw = an, Kw = Il;
class Jw extends Xw.DifferentialDownloader {
  async download() {
    const t = this.blockAwareFileInfo, r = t.size, n = r - (t.blockMapSize + 4);
    this.fileMetadataBuffer = await this.readRemoteBytes(n, r - 1);
    const i = Vu(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
    await this.doDownload(await Qw(this.options.oldFile), i);
  }
}
sn.FileWithEmbeddedBlockMapDifferentialDownloader = Jw;
function Vu(e) {
  return JSON.parse((0, Kw.inflateRawSync)(e).toString());
}
async function Qw(e) {
  const t = await (0, Jt.open)(e, "r");
  try {
    const r = (await (0, Jt.fstat)(t)).size, n = Buffer.allocUnsafe(4);
    await (0, Jt.read)(t, n, 0, n.length, r - n.length);
    const i = Buffer.allocUnsafe(n.readUInt32BE(0));
    return await (0, Jt.read)(t, i, 0, i.length, r - n.length - i.length), await (0, Jt.close)(t), Vu(i);
  } catch (r) {
    throw await (0, Jt.close)(t), r;
  }
}
Object.defineProperty(Hr, "__esModule", { value: !0 });
Hr.AppImageUpdater = void 0;
const so = he, dl = Xn, Zw = St, e_ = We, Qt = Y, t_ = Ht, r_ = sn, n_ = ce, hl = Ct;
class i_ extends t_.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  isUpdaterActive() {
    return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, n_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "AppImage",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        const a = process.env.APPIMAGE;
        if (a == null)
          throw (0, so.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
        (t.disableDifferentialDownload || await this.downloadDifferential(n, a, i, r, t)) && await this.httpExecutor.download(n.url, i, o), await (0, Zw.chmod)(i, 493);
      }
    });
  }
  async downloadDifferential(t, r, n, i, o) {
    try {
      const a = {
        newUrl: t.url,
        oldFile: r,
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        requestHeaders: o.requestHeaders,
        cancellationToken: o.cancellationToken
      };
      return this.listenerCount(hl.DOWNLOAD_PROGRESS) > 0 && (a.onProgress = (s) => this.emit(hl.DOWNLOAD_PROGRESS, s)), await new r_.FileWithEmbeddedBlockMapDifferentialDownloader(t.info, this.httpExecutor, a).download(), !1;
    } catch (a) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${a.stack || a}`), process.platform === "linux";
    }
  }
  doInstall(t) {
    const r = process.env.APPIMAGE;
    if (r == null)
      throw (0, so.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    if (!Qt.isAbsolute(r) || r.includes("\0"))
      throw (0, so.newError)(`APPIMAGE env is not a valid absolute path: "${r}"`, "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    (0, e_.unlinkSync)(r);
    let n;
    const i = Qt.basename(r), o = this.installerPath;
    if (o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    Qt.basename(o) === i || !/\d+\.\d+\.\d+/.test(i) ? n = r : n = Qt.join(Qt.dirname(r), Qt.basename(o)), (0, dl.execFileSync)("mv", ["-f", o, n]), n !== r && this.emit("appimage-filename-updated", n);
    const a = {
      ...process.env,
      APPIMAGE_SILENT_INSTALL: "true"
    };
    return t.isForceRunAfter ? this.spawnLog(n, [], a) : (a.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, dl.execFileSync)(n, [], { env: a })), !0;
  }
}
Hr.AppImageUpdater = i_;
var qr = {}, gr = {};
Object.defineProperty(gr, "__esModule", { value: !0 });
gr.LinuxUpdater = void 0;
const o_ = Ht, a_ = /^[a-zA-Z0-9_-]+$/;
class s_ extends o_.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /**
   * Returns true if the current process is running as root.
   */
  isRunningAsRoot() {
    var t;
    return ((t = process.getuid) === null || t === void 0 ? void 0 : t.call(process)) === 0;
  }
  /**
   * Sanitizes the installer path for use with shell:true spawn calls.
   * Backslash-escapes metacharacters that have special meaning in POSIX shell.
   * Note: paths containing single-quotes (') are not supported.
   */
  get installerPath() {
    const t = super.installerPath;
    return t == null ? null : t.replace(/\\/g, "\\\\").replace(/([`$!" ;|&()<>])/g, "\\$1").replace(/[\n\r]/g, "");
  }
  runCommandWithSudoIfNeeded(t) {
    if (this.isRunningAsRoot())
      return this._logger.info("Running as root, no need to use sudo"), this.spawnSyncLog(t[0], t.slice(1));
    const { name: r } = this.app, i = `"${r.replace(/["`$\\!\n\r;|&<>(){}*?[\]#~]/g, "")} would like to update"`, o = this.sudoWithArgs(i);
    this._logger.info(`Running as non-root user, using sudo to install: ${o}`);
    let a = '"';
    return (/pkexec/i.test(o[0]) || o[0] === "sudo") && (a = ""), this.spawnSyncLog(o[0], [...o.length > 1 ? o.slice(1) : [], `${a}/bin/bash`, "-c", `'${t.join(" ")}'${a}`]);
  }
  sudoWithArgs(t) {
    const r = this.determineSudoCommand(), n = [r];
    return /kdesudo/i.test(r) ? (n.push("--comment", t), n.push("-c")) : /gksudo/i.test(r) ? n.push("--message", t) : /pkexec/i.test(r) && n.push("--disable-internal-agent"), n;
  }
  hasCommand(t) {
    try {
      return this.spawnSyncLog("command", ["-v", t]), !0;
    } catch {
      return !1;
    }
  }
  determineSudoCommand() {
    const t = ["gksudo", "kdesudo", "pkexec", "beesu"];
    for (const r of t)
      if (this.hasCommand(r))
        return r;
    return "sudo";
  }
  /**
   * Detects the package manager to use based on the available commands.
   * Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
   * If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
   * Otherwise, it checks for the presence of the specified package manager commands in the order provided.
   * @param pms - An array of package manager commands to check for, in priority order.
   * @returns The detected package manager command or "unknown" if none are found.
   */
  detectPackageManager(t) {
    var r;
    let n = t;
    const i = (r = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || r === void 0 ? void 0 : r.trim();
    i && (a_.test(i) ? n = [i] : this._logger.warn(`ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER "${i}" contains unsafe characters. Ignoring override.`));
    for (const s of n)
      if (this.hasCommand(s))
        return s;
    const o = i ? `ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER override "${i}", ` : "", a = t[0];
    return this._logger.warn(`No package manager found in the list: ${o}${t.join(", ")}. Utilizing default: ${a}`), a;
  }
}
gr.LinuxUpdater = s_;
Object.defineProperty(qr, "__esModule", { value: !0 });
qr.DebUpdater = void 0;
const l_ = ce, pl = Ct, c_ = gr;
class la extends c_.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, l_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
    return this.executeDownload({
      fileExtension: "deb",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(pl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(pl.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
      return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
    const n = ["dpkg", "apt"], i = this.detectPackageManager(n);
    try {
      la.installWithCommandRunner(i, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n, i) {
    var o;
    if (t === "dpkg")
      try {
        n(["dpkg", "-i", r]);
      } catch (a) {
        i.warn((o = a.message) !== null && o !== void 0 ? o : a), i.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), n(["apt-get", "install", "-f", "-y"]);
      }
    else if (t === "apt")
      i.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), n([
        "apt",
        "install",
        "-y",
        "--allow-unauthenticated",
        // needed for unsigned .debs
        "--allow-downgrades",
        // allow lower version installs
        "--allow-change-held-packages",
        r
      ]);
    else
      throw new Error(`Package manager ${t} not supported`);
  }
}
qr.DebUpdater = la;
var Gr = {};
Object.defineProperty(Gr, "__esModule", { value: !0 });
Gr.PacmanUpdater = void 0;
const ml = Ct, u_ = ce, f_ = gr;
class ca extends f_.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, u_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
    return this.executeDownload({
      fileExtension: "pacman",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(ml.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(ml.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    try {
      ca.installWithCommandRunner(r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (n) {
      return this.dispatchError(n), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n) {
    var i;
    try {
      r(["pacman", "-U", "--noconfirm", t]);
    } catch (o) {
      n.warn((i = o.message) !== null && i !== void 0 ? i : o), n.warn("pacman installation failed, attempting to update package database and retry");
      try {
        r(["pacman", "-Sy", "--noconfirm"]), r(["pacman", "-U", "--noconfirm", t]);
      } catch (a) {
        throw n.error("Retry after pacman -Sy failed"), a;
      }
    }
  }
}
Gr.PacmanUpdater = ca;
var Vr = {};
Object.defineProperty(Vr, "__esModule", { value: !0 });
Vr.RpmUpdater = void 0;
const gl = Ct, d_ = ce, h_ = gr;
class ua extends h_.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, d_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "rpm",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(gl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(gl.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const n = ["zypper", "dnf", "yum", "rpm"], i = this.detectPackageManager(n);
    try {
      ua.installWithCommandRunner(i, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n, i) {
    if (t === "zypper")
      return n(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", r]);
    if (t === "dnf")
      return n(["dnf", "install", "--nogpgcheck", "-y", r]);
    if (t === "yum")
      return n(["yum", "install", "--nogpgcheck", "-y", r]);
    if (t === "rpm")
      return i.warn("Installing with rpm only (no dependency resolution)."), n(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", r]);
    throw new Error(`Package manager ${t} not supported`);
  }
}
Vr.RpmUpdater = ua;
var Wr = {};
Object.defineProperty(Wr, "__esModule", { value: !0 });
Wr.MacUpdater = void 0;
const El = he, lo = St, p_ = We, yl = Y, m_ = Jf, g_ = Et, E_ = ce, vl = Xn, wl = Xr;
class fa extends g_.AppUpdater {
  constructor(t, r) {
    super(t, r), this.nativeUpdater = kt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (n) => {
      this._logger.warn(n), this.emit("error", n);
    }), this.nativeUpdater.on("update-downloaded", () => {
      this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
    });
  }
  /** Filters update files to the appropriate architecture.
   * On arm64 Macs (including Rosetta), arm64 files are preferred when available.
   * On x64 Macs, arm64 files are excluded. */
  static filterFilesForArch(t, r) {
    const n = (i) => {
      var o;
      return i.url.pathname.includes("arm64") || ((o = i.info.url) === null || o === void 0 ? void 0 : o.includes("arm64"));
    };
    return r && t.some(n) ? t.filter((i) => r === n(i)) : t.filter((i) => !n(i));
  }
  debug(t) {
    this._logger.debug != null && this._logger.debug(t);
  }
  closeServerIfExists() {
    this.server && (this.debug("Closing proxy server"), this.server.close((t) => {
      t && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
    }));
  }
  async doDownloadUpdate(t) {
    let r = t.updateInfoAndProvider.provider.resolveFiles(t.updateInfoAndProvider.info);
    const n = this._logger, i = "sysctl.proc_translated";
    let o = !1;
    try {
      this.debug("Checking for macOS Rosetta environment"), o = (0, vl.execFileSync)("sysctl", [i], { encoding: "utf8" }).includes(`${i}: 1`), n.info(`Checked for macOS Rosetta environment (isRosetta=${o})`);
    } catch (c) {
      n.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${c}`);
    }
    let a = !1;
    try {
      this.debug("Checking for arm64 in uname");
      const f = (0, vl.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
      n.info(`Checked 'uname -a': arm64=${f}`), a = a || f;
    } catch (c) {
      n.warn(`uname shell command to check for arm64 failed: ${c}`);
    }
    a = a || process.arch === "arm64" || o, r = fa.filterFilesForArch(r, a);
    const s = (0, E_.findFile)(r, "zip", ["pkg", "dmg"]);
    if (s == null)
      throw (0, El.newError)(`ZIP file not provided: ${(0, El.safeStringifyJson)(r)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    const l = t.updateInfoAndProvider.provider, h = "update.zip";
    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: s,
      downloadUpdateOptions: t,
      task: async (c, f) => {
        const g = yl.join(this.downloadedUpdateHelper.cacheDir, h), m = () => (0, lo.pathExistsSync)(g) ? !t.disableDifferentialDownload : (n.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
        let v = !0;
        m() && (v = await this.differentialDownloadInstaller(s, t, c, l, h)), v && await this.httpExecutor.download(s.url, c, f);
      },
      done: async (c) => {
        if (!t.disableDifferentialDownload)
          try {
            const f = yl.join(this.downloadedUpdateHelper.cacheDir, h);
            await (0, lo.copyFile)(c.downloadedFile, f);
          } catch (f) {
            this._logger.warn(`Unable to copy file for caching for future differential downloads: ${f.message}`);
          }
        return this.updateDownloaded(s, c);
      }
    });
  }
  async updateDownloaded(t, r) {
    var n;
    const i = r.downloadedFile, o = (n = t.info.size) !== null && n !== void 0 ? n : (await (0, lo.stat)(i)).size, a = this._logger, s = `fileToProxy=${t.url.href}`;
    this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${s})`), this.server = (0, m_.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${s})`), this.server.on("close", () => {
      a.info(`Proxy server for native Squirrel.Mac is closed (${s})`);
    });
    const l = (h) => {
      const c = h.address();
      return typeof c == "string" ? c : `http://127.0.0.1:${c == null ? void 0 : c.port}`;
    };
    return await new Promise((h, c) => {
      const f = (0, wl.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), g = Buffer.from(`autoupdater:${f}`, "ascii"), m = `/${(0, wl.randomBytes)(64).toString("hex")}.zip`;
      this.server.on("request", (v, E) => {
        const A = v.url;
        if (a.info(`${A} requested`), A === "/") {
          if (!v.headers.authorization || v.headers.authorization.indexOf("Basic ") === -1) {
            E.statusCode = 401, E.statusMessage = "Invalid Authentication Credentials", E.end(), a.warn("No authenthication info");
            return;
          }
          const D = v.headers.authorization.split(" ")[1], B = Buffer.from(D, "base64").toString("ascii"), [G, Z] = B.split(":");
          if (G !== "autoupdater" || Z !== f) {
            E.statusCode = 401, E.statusMessage = "Invalid Authentication Credentials", E.end(), a.warn("Invalid authenthication credentials");
            return;
          }
          const ee = Buffer.from(`{ "url": "${l(this.server)}${m}" }`);
          E.writeHead(200, { "Content-Type": "application/json", "Content-Length": ee.length }), E.end(ee);
          return;
        }
        if (!A.startsWith(m)) {
          a.warn(`${A} requested, but not supported`), E.writeHead(404), E.end();
          return;
        }
        a.info(`${m} requested by Squirrel.Mac, pipe ${i}`);
        let T = !1;
        E.on("finish", () => {
          T || (this.nativeUpdater.removeListener("error", c), h([]));
        });
        const C = (0, p_.createReadStream)(i);
        C.on("error", (D) => {
          try {
            E.end();
          } catch (B) {
            a.warn(`cannot end response: ${B}`);
          }
          T = !0, this.nativeUpdater.removeListener("error", c), c(new Error(`Cannot pipe "${i}": ${D}`));
        }), E.writeHead(200, {
          "Content-Type": "application/zip",
          "Content-Length": o
        }), C.pipe(E);
      }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${s})`), this.server.listen(0, "127.0.0.1", () => {
        this.debug(`Proxy server for native Squirrel.Mac is listening (address=${l(this.server)}, ${s})`), this.nativeUpdater.setFeedURL({
          url: l(this.server),
          headers: {
            "Cache-Control": "no-cache",
            Authorization: `Basic ${g.toString("base64")}`
          }
        }), this.dispatchUpdateDownloaded(r), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", c), this.nativeUpdater.checkForUpdates()) : h([]);
      });
    });
  }
  handleUpdateDownloaded() {
    this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
  }
  quitAndInstall() {
    this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
  }
}
Wr.MacUpdater = fa;
var Yr = {}, da = {};
Object.defineProperty(da, "__esModule", { value: !0 });
da.verifySignature = v_;
const _l = he, Wu = Xn, y_ = Kn, Al = Y;
function Yu(e, t) {
  return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", e], {
    shell: !0,
    timeout: t
  }];
}
function v_(e, t, r) {
  return new Promise((n, i) => {
    const o = t.replace(/'/g, "''");
    r.info(`Verifying signature ${o}`), (0, Wu.execFile)(...Yu(`"Get-AuthenticodeSignature -LiteralPath '${o}' | ConvertTo-Json -Compress"`, 20 * 1e3), (a, s, l) => {
      var h;
      try {
        if (a != null || l) {
          co(r, a, l, i), n(null);
          return;
        }
        const c = w_(s);
        if (c.Status === 0) {
          try {
            const v = Al.normalize(c.Path), E = Al.normalize(t);
            if (r.info(`LiteralPath: ${v}. Update Path: ${E}`), v !== E) {
              co(r, new Error(`LiteralPath of ${v} is different than ${E}`), l, i), n(null);
              return;
            }
          } catch (v) {
            r.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(h = v.message) !== null && h !== void 0 ? h : v.stack}`);
          }
          const g = (0, _l.parseDn)(c.SignerCertificate.Subject);
          let m = !1;
          for (const v of e) {
            const E = (0, _l.parseDn)(v);
            if (E.size ? m = Array.from(E.keys()).every((T) => E.get(T) === g.get(T)) : v === g.get("CN") && (r.warn(`Signature validated using only CN ${v}. Please add your full Distinguished Name (DN) to publisherNames configuration`), m = !0), m) {
              n(null);
              return;
            }
          }
        }
        const f = `publisherNames: ${e.join(" | ")}, raw info: ` + JSON.stringify(c, (g, m) => g === "RawData" ? void 0 : m, 2);
        r.warn(`Sign verification failed, installer signed with incorrect certificate: ${f}`), n(f);
      } catch (c) {
        co(r, c, null, i), n(null);
        return;
      }
    });
  });
}
function w_(e) {
  const t = JSON.parse(e);
  delete t.PrivateKey, delete t.IsOSBinary, delete t.SignatureType;
  const r = t.SignerCertificate;
  return r != null && (delete r.Archived, delete r.Extensions, delete r.Handle, delete r.HasPrivateKey, delete r.SubjectName), t;
}
function co(e, t, r, n) {
  if (__()) {
    e.warn(`Cannot execute Get-AuthenticodeSignature: ${t || r}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  try {
    (0, Wu.execFileSync)(...Yu("ConvertTo-Json test", 10 * 1e3));
  } catch (i) {
    e.warn(`Cannot execute ConvertTo-Json: ${i.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  t != null && n(t), r && n(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${r}. Failing signature validation due to unknown stderr.`));
}
function __() {
  const e = y_.release();
  return e.startsWith("6.") && !e.startsWith("6.3");
}
Object.defineProperty(Yr, "__esModule", { value: !0 });
Yr.NsisUpdater = void 0;
const Dn = he, Tl = Y, A_ = Ht, T_ = sn, Sl = Ct, S_ = ce, C_ = St, b_ = da, Cl = Tt;
class $_ extends A_.BaseUpdater {
  constructor(t, r) {
    super(t, r), this._verifyUpdateCodeSignature = (n, i) => (0, b_.verifySignature)(n, i, this._logger);
  }
  /**
   * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
   * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
   */
  get verifyUpdateCodeSignature() {
    return this._verifyUpdateCodeSignature;
  }
  set verifyUpdateCodeSignature(t) {
    t && (this._verifyUpdateCodeSignature = t);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, S_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "exe");
    return this.executeDownload({
      fileExtension: "exe",
      downloadUpdateOptions: t,
      fileInfo: n,
      task: async (i, o, a, s) => {
        const l = n.packageInfo, h = l != null && a != null;
        if (h && t.disableWebInstaller)
          throw (0, Dn.newError)(`Unable to download new version ${t.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
        !h && !t.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (h || t.disableDifferentialDownload || await this.differentialDownloadInstaller(n, t, i, r, Dn.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(n.url, i, o);
        const c = await this.verifySignature(i);
        if (c != null)
          throw await s(), (0, Dn.newError)(`New version ${t.updateInfoAndProvider.info.version} is not signed by the application owner: ${c}`, "ERR_UPDATER_INVALID_SIGNATURE");
        if (h && await this.differentialDownloadWebPackage(t, l, a, r))
          try {
            await this.httpExecutor.download(new Cl.URL(l.path), a, {
              headers: t.requestHeaders,
              cancellationToken: t.cancellationToken,
              sha512: l.sha512
            });
          } catch (f) {
            try {
              await (0, C_.unlink)(a);
            } catch {
            }
            throw f;
          }
      }
    });
  }
  // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
  // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
  // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
  async verifySignature(t) {
    let r;
    try {
      if (r = (await this.configOnDisk.value).publisherName, r == null)
        return null;
    } catch (n) {
      if (n.code === "ENOENT")
        return null;
      throw n;
    }
    return await this._verifyUpdateCodeSignature(Array.isArray(r) ? r : [r], t);
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const n = ["--updated"];
    t.isSilent && n.push("/S"), t.isForceRunAfter && n.push("--force-run"), this.installDirectory && n.push(`/D=${this.installDirectory}`);
    const i = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
    i != null && n.push(`--package-file=${i}`);
    const o = () => {
      this.spawnLog(Tl.join(process.resourcesPath, "elevate.exe"), [r].concat(n)).catch((a) => this.dispatchError(a));
    };
    return t.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), o(), !0) : (this.spawnLog(r, n).catch((a) => {
      const s = a.code;
      this._logger.info(`Cannot run installer: error code: ${s}, error message: "${a.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), s === "UNKNOWN" || s === "EACCES" ? o() : s === "ENOENT" ? kt.shell.openPath(r).catch((l) => this.dispatchError(l)) : this.dispatchError(a);
    }), !0);
  }
  async differentialDownloadWebPackage(t, r, n, i) {
    if (r.blockMapSize == null)
      return !0;
    try {
      const o = {
        newUrl: new Cl.URL(r.path),
        oldFile: Tl.join(this.downloadedUpdateHelper.cacheDir, Dn.CURRENT_APP_PACKAGE_FILE_NAME),
        logger: this._logger,
        newFile: n,
        requestHeaders: this.requestHeaders,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        cancellationToken: t.cancellationToken
      };
      this.listenerCount(Sl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(Sl.DOWNLOAD_PROGRESS, a)), await new T_.FileWithEmbeddedBlockMapDifferentialDownloader(r, this.httpExecutor, o).download();
    } catch (o) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${o.stack || o}`), process.platform === "win32";
    }
    return !1;
  }
}
Yr.NsisUpdater = $_;
(function(e) {
  var t = $e && $e.__createBinding || (Object.create ? function(A, T, C, D) {
    D === void 0 && (D = C);
    var B = Object.getOwnPropertyDescriptor(T, C);
    (!B || ("get" in B ? !T.__esModule : B.writable || B.configurable)) && (B = { enumerable: !0, get: function() {
      return T[C];
    } }), Object.defineProperty(A, D, B);
  } : function(A, T, C, D) {
    D === void 0 && (D = C), A[D] = T[C];
  }), r = $e && $e.__exportStar || function(A, T) {
    for (var C in A) C !== "default" && !Object.prototype.hasOwnProperty.call(T, C) && t(T, A, C);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
  const n = St, i = Y;
  var o = Ht;
  Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
    return o.BaseUpdater;
  } });
  var a = Et;
  Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
    return a.AppUpdater;
  } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
    return a.NoOpLogger;
  } });
  var s = ce;
  Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
    return s.Provider;
  } });
  var l = Hr;
  Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
    return l.AppImageUpdater;
  } });
  var h = qr;
  Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
    return h.DebUpdater;
  } });
  var c = Gr;
  Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
    return c.PacmanUpdater;
  } });
  var f = Vr;
  Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
    return f.RpmUpdater;
  } });
  var g = Wr;
  Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
    return g.MacUpdater;
  } });
  var m = Yr;
  Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
    return m.NsisUpdater;
  } }), r(Ct, e);
  let v;
  function E() {
    if (process.platform === "win32")
      v = new Yr.NsisUpdater();
    else if (process.platform === "darwin")
      v = new Wr.MacUpdater();
    else {
      v = new Hr.AppImageUpdater();
      try {
        const A = i.join(process.resourcesPath, "package-type");
        if (!(0, n.existsSync)(A))
          return v;
        switch ((0, n.readFileSync)(A).toString().trim()) {
          case "deb":
            v = new qr.DebUpdater();
            break;
          case "rpm":
            v = new Vr.RpmUpdater();
            break;
          case "pacman":
            v = new Gr.PacmanUpdater();
            break;
          default:
            break;
        }
      } catch (A) {
        console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", A.message);
      }
    }
    return v;
  }
  Object.defineProperty(e, "autoUpdater", {
    enumerable: !0,
    get: () => v || E()
  });
})(Le);
Le.autoUpdater.autoDownload = !1;
Le.autoUpdater.autoInstallOnAppQuit = !0;
Le.autoUpdater.logger = console;
function R_() {
  Le.autoUpdater.on("checking-for-update", () => {
    q == null || q.webContents.send("update-checking");
  }), Le.autoUpdater.on("update-available", (e) => {
    q == null || q.webContents.send("update-available", {
      version: e.version,
      releaseDate: e.releaseDate,
      releaseNotes: e.releaseNotes
    });
  }), Le.autoUpdater.on("update-not-available", (e) => {
    q == null || q.webContents.send("update-not-available", {
      version: e.version
    });
  }), Le.autoUpdater.on("error", (e) => {
    q == null || q.webContents.send("update-error", e == null ? "unknown" : (e.message || e).toString());
  }), Le.autoUpdater.on("download-progress", (e) => {
    q == null || q.webContents.send("update-download-progress", {
      percent: e.percent,
      bytesPerSecond: e.bytesPerSecond,
      total: e.total,
      transferred: e.transferred
    });
  }), Le.autoUpdater.on("update-downloaded", (e) => {
    q == null || q.webContents.send("update-downloaded", {
      version: e.version
    });
  });
}
const zu = Y.dirname(Xf(import.meta.url)), $o = Y.join(ot.getPath("userData"), "settings.json");
function O_() {
  try {
    if (We.existsSync($o)) {
      const e = We.readFileSync($o, "utf-8");
      return JSON.parse(e);
    }
  } catch (e) {
    console.error("Failed to read settings:", e);
  }
  return {
    serverURL: "http://localhost:8000",
    camera: { width: "1280", height: "1024" },
    printers: { job: "", credit: "", custom: "" },
    isDark: !0
  };
}
function I_(e) {
  try {
    return We.writeFileSync($o, JSON.stringify(e, null, 2), "utf-8"), !0;
  } catch (t) {
    return console.error("Failed to write settings:", t), !1;
  }
}
process.env.APP_ROOT = Y.join(zu, "..");
const Ro = process.env.VITE_DEV_SERVER_URL, Xu = Y.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Ro ? Y.join(process.env.APP_ROOT, "public") : Xu;
let q = null;
function bl() {
  q = new Oo({
    icon: Y.join(process.env.VITE_PUBLIC, "256x256.png"),
    width: 1280,
    height: 800,
    webPreferences: {
      preload: Y.join(zu, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), q.webContents.on("did-finish-load", () => {
    q == null || q.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), q.on("app-command", (e, t) => {
    t === "browser-backward" ? q == null || q.webContents.send("app-navigate-back") : t === "browser-forward" && (q == null || q.webContents.send("app-navigate-forward"));
  }), Ro ? (q.loadURL(Ro), q.webContents.openDevTools()) : (q.loadFile(Y.join(Xu, "index.html")), q.removeMenu());
}
At.handle("get-settings", () => O_());
At.handle("save-settings", (e, t) => I_(t));
At.handle("get-printers", async (e) => {
  try {
    const t = e.sender;
    if (t) {
      console.log("[IPC get-printers] Invoking wc.getPrintersAsync()...");
      const r = await t.getPrintersAsync();
      console.log("[IPC get-printers] Result details:", r);
      const n = r.map((i) => i.name);
      return console.log("[IPC get-printers] Mapped printer names:", n), n;
    }
  } catch (t) {
    console.error("[IPC get-printers] Error occurred:", t);
  }
  return [];
});
At.handle("print-document", async (e, { printerName: t, htmlContent: r }) => {
  try {
    console.log(`[IPC print-document] Initializing print for printer: "${t}"`);
    let n = new Oo({
      show: !1,
      webPreferences: {
        nodeIntegration: !1,
        contextIsolation: !0
      }
    });
    await n.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(r)}`);
    const i = {
      silent: !0,
      printBackground: !0,
      margins: { marginType: "none" }
    };
    return t && (i.deviceName = t), new Promise((o) => {
      n.webContents.print(i, (a, s) => {
        n.destroy(), n = null, a ? (console.log(`[IPC print-document] Printed successfully on "${t || "Default Printer"}"`), o({ success: !0 })) : (console.error(`[IPC print-document] Print failed. Error type: ${s}`), o({ success: !1, error: s || "Unknown printing error" }));
      });
    });
  } catch (n) {
    return console.error("[IPC print-document] Error during printing:", n), { success: !1, error: n.message };
  }
});
At.handle("get-app-version", () => ot.getVersion());
At.handle("check-for-update", async () => {
  try {
    return { success: !0, result: await Le.autoUpdater.checkForUpdates() };
  } catch (e) {
    return console.error("Error checking for updates:", e), { success: !1, error: e.message };
  }
});
At.handle("download-update", async () => {
  try {
    return { success: !0, result: await Le.autoUpdater.downloadUpdate() };
  } catch (e) {
    return console.error("Error downloading update:", e), { success: !1, error: e.message };
  }
});
At.handle("install-update", () => (Le.autoUpdater.quitAndInstall(), { success: !0 }));
const P_ = ot.requestSingleInstanceLock();
P_ ? (ot.on("second-instance", (e, t, r) => {
  q && (q.isMinimized() && q.restore(), q.focus());
}), ot.on("window-all-closed", () => {
  process.platform !== "darwin" && (ot.quit(), q = null);
}), ot.on("activate", () => {
  Oo.getAllWindows().length === 0 && bl();
}), ot.whenReady().then(() => {
  R_(), bl();
})) : ot.quit();
export {
  Xu as RENDERER_DIST,
  Ro as VITE_DEV_SERVER_URL
};
