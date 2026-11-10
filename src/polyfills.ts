// Universal Runtime Shims for Chrome 49–89, older Android WebViews, iOS Safari, and Samsung Internet
(function () {
  if (typeof window === 'undefined') return;

  // 1. globalThis (added in Chrome 71)
  if (typeof (window as any).globalThis === 'undefined') {
    (window as any).globalThis = window;
  }

  // 2. queueMicrotask (added in Chrome 71 - required by React 19 scheduler/client)
  if (typeof window.queueMicrotask !== 'function') {
    window.queueMicrotask = function (callback: VoidFunction) {
      if (typeof Promise !== 'undefined') {
        Promise.resolve()
          .then(callback)
          .catch(function (err) {
            setTimeout(function () {
              throw err;
            }, 0);
          });
      } else {
        setTimeout(callback, 0);
      }
    };
  }

  // 3. Promise.allSettled (added in Chrome 76 - used by AppContext initial data sync)
  if (typeof Promise !== 'undefined' && typeof Promise.allSettled !== 'function') {
    Promise.allSettled = function (promises: Iterable< any >): Promise< any > {
      const arr = Array.prototype.slice.call(promises);
      return Promise.all(
        arr.map(function (p: any) {
          return Promise.resolve(p).then(
            function (value) {
              return { status: 'fulfilled' as const, value: value };
            },
            function (reason) {
              return { status: 'rejected' as const, reason: reason };
            }
          );
        })
      );
    };
  }

  // 4. Promise.prototype.finally (added in Chrome 63)
  if (typeof Promise !== 'undefined' && typeof Promise.prototype.finally !== 'function') {
    Promise.prototype.finally = function (onFinally?: (() => any) | null) {
      const P = this.constructor as PromiseConstructor;
      return this.then(
        function (value) {
          return P.resolve(typeof onFinally === 'function' ? onFinally() : undefined).then(function () {
            return value;
          });
        },
        function (reason) {
          return P.resolve(typeof onFinally === 'function' ? onFinally() : undefined).then(function () {
            throw reason;
          });
        }
      );
    };
  }

  // 5. AbortController & AbortSignal (added in Chrome 66 - used by API fetch timeouts)
  if (typeof (window as any).AbortController === 'undefined') {
    const DummyAbortController = function (this: any) {
      this.signal = {
        aborted: false,
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return true;
        },
        onabort: null,
      };
      this.abort = function () {
        this.signal.aborted = true;
        if (typeof this.signal.onabort === 'function') {
          try {
            this.signal.onabort();
          } catch {}
        }
      };
    };
    (window as any).AbortController = DummyAbortController;
  }

  // 6. ResizeObserver & IntersectionObserver (added in Chrome 64 / 51)
  if (typeof (window as any).ResizeObserver === 'undefined') {
    (window as any).ResizeObserver = function () {
      this.observe = function () {};
      this.unobserve = function () {};
      this.disconnect = function () {};
    };
  }
  if (typeof (window as any).IntersectionObserver === 'undefined') {
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = function (el: any) {
        if (typeof cb === 'function') {
          try {
            cb([{ isIntersecting: true, target: el, intersectionRatio: 1 }], this);
          } catch {}
        }
      };
      this.unobserve = function () {};
      this.disconnect = function () {};
    };
  }

  // 7. Object.entries / Object.values / Object.fromEntries
  if (typeof Object.entries !== 'function') {
    (Object as any).entries = function (obj: any) {
      const keys = Object.keys(obj || {});
      return keys.map(function (k) {
        return [k, obj[k]];
      });
    };
  }
  if (typeof Object.values !== 'function') {
    (Object as any).values = function (obj: any) {
      const keys = Object.keys(obj || {});
      return keys.map(function (k) {
        return obj[k];
      });
    };
  }
  if (typeof Object.fromEntries !== 'function') {
    (Object as any).fromEntries = function (entries: any) {
      const out: Record<string, any> = {};
      if (!entries) return out;
      const arr = Array.from ? Array.from(entries) : Array.prototype.slice.call(entries);
      for (let i = 0; i < arr.length; i++) {
        const pair = arr[i];
        if (pair && pair.length >= 2) {
          out[pair[0]] = pair[1];
        }
      }
      return out;
    };
  }

  // 8. Array.prototype.flat / flatMap / String.prototype.replaceAll
  if (typeof Array.prototype.flat !== 'function') {
    (Array.prototype as any).flat = function (this: any[], depth?: number) {
      const d = depth === undefined ? 1 : Number(depth);
      const flatten = function (arr: any[], cur: number): any[] {
        return arr.reduce(function (acc: any[], item: any) {
          return acc.concat(Array.isArray(item) && cur > 0 ? flatten(item, cur - 1) : item);
        }, []);
      };
      return d > 0 ? flatten(this, d) : this.slice();
    };
  }
  if (typeof Array.prototype.flatMap !== 'function') {
    (Array.prototype as any).flatMap = function (this: any[], callback: any, thisArg?: any) {
      return this.map(callback, thisArg).flat(1);
    };
  }
  if (typeof (String.prototype as any).replaceAll !== 'function') {
    (String.prototype as any).replaceAll = function (this: string, search: string | RegExp, replacement: string) {
      if (search instanceof RegExp) {
        return this.replace(search, replacement);
      }
      return this.split(String(search)).join(replacement);
    };
  }

  // 9. Safe window.scrollTo / window.scroll / Element.prototype.scrollTo wrapper
  // CRITICAL: Chrome 32–108 removed 'instant' from ScrollBehavior enum and throws:
  // "TypeError: Failed to execute 'scrollTo' on 'Window': The provided value 'instant' is not a valid enum value of type ScrollBehavior."
  const origWindowScrollTo = window.scrollTo as any;
  if (typeof origWindowScrollTo === 'function') {
    const safeWindowScrollTo = function (this: any, arg1?: any, arg2?: any) {
      try {
        if (arg1 && typeof arg1 === 'object') {
          const top = typeof arg1.top === 'number' ? arg1.top : window.pageYOffset || 0;
          const left = typeof arg1.left === 'number' ? arg1.left : window.pageXOffset || 0;
          if (arg1.behavior === 'instant' || !arg1.behavior) {
            return origWindowScrollTo.call(window, left, top);
          }
          try {
            return origWindowScrollTo.call(window, arg1);
          } catch {
            return origWindowScrollTo.call(window, left, top);
          }
        }
        return origWindowScrollTo.call(window, arg1 || 0, arg2 || 0);
      } catch {
        try {
          origWindowScrollTo.call(window, 0, 0);
        } catch {}
      }
    };
    window.scrollTo = safeWindowScrollTo as any;
    window.scroll = safeWindowScrollTo as any;
  }

  if (typeof Element !== 'undefined' && Element.prototype) {
    const origElScrollTo = Element.prototype.scrollTo as any;
    if (typeof origElScrollTo === 'function') {
      Element.prototype.scrollTo = function (this: Element, arg1?: any, arg2?: any) {
        try {
          if (arg1 && typeof arg1 === 'object') {
            const top = typeof arg1.top === 'number' ? arg1.top : this.scrollTop || 0;
            const left = typeof arg1.left === 'number' ? arg1.left : this.scrollLeft || 0;
            if (arg1.behavior === 'instant' || !arg1.behavior) {
              this.scrollTop = top;
              this.scrollLeft = left;
              return;
            }
            return origElScrollTo.call(this, arg1);
          }
          return origElScrollTo.call(this, arg1 || 0, arg2 || 0);
        } catch {
          if (arg1 && typeof arg1 === 'object') {
            if (typeof arg1.top === 'number') this.scrollTop = arg1.top;
            if (typeof arg1.left === 'number') this.scrollLeft = arg1.left;
          }
        }
      } as any;
    } else {
      (Element.prototype as any).scrollTo = function (this: Element, arg1?: any, arg2?: any) {
        if (arg1 && typeof arg1 === 'object') {
          if (typeof arg1.top === 'number') this.scrollTop = arg1.top;
          if (typeof arg1.left === 'number') this.scrollLeft = arg1.left;
        } else {
          if (typeof arg1 === 'number') this.scrollLeft = arg1;
          if (typeof arg2 === 'number') this.scrollTop = arg2;
        }
      };
    }

    const origElScrollBy = Element.prototype.scrollBy as any;
    if (typeof origElScrollBy === 'function') {
      Element.prototype.scrollBy = function (this: Element, arg1?: any, arg2?: any) {
        try {
          if (arg1 && typeof arg1 === 'object' && arg1.behavior === 'instant') {
            if (typeof arg1.top === 'number') this.scrollTop += arg1.top;
            if (typeof arg1.left === 'number') this.scrollLeft += arg1.left;
            return;
          }
          return origElScrollBy.call(this, arg1, arg2);
        } catch {
          if (arg1 && typeof arg1 === 'object') {
            if (typeof arg1.top === 'number') this.scrollTop += arg1.top;
            if (typeof arg1.left === 'number') this.scrollLeft += arg1.left;
          }
        }
      } as any;
    }
  }

  // 10. Safe window.matchMedia wrapper (Chrome < 64 MediaQueryList only has addListener/removeListener, not addEventListener)
  const origMatchMedia = window.matchMedia;
  if (typeof origMatchMedia === 'function') {
    window.matchMedia = function (query: string): MediaQueryList {
      const mql = origMatchMedia.call(window, query);
      if (mql && typeof mql.addEventListener !== 'function') {
        (mql as any).addEventListener = function (type: string, listener: any) {
          if (type === 'change' && typeof mql.addListener === 'function') {
            mql.addListener(listener);
          }
        };
      }
      if (mql && typeof mql.removeEventListener !== 'function') {
        (mql as any).removeEventListener = function (type: string, listener: any) {
          if (type === 'change' && typeof mql.removeListener === 'function') {
            mql.removeListener(listener);
          }
        };
      }
      return mql;
    };
  } else {
    (window as any).matchMedia = function (query: string) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return false;
        },
      };
    };
  }
})();
