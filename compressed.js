(function(a, b, c) {
  if (c in b && b[c]) {
      var d, e = a.location, f = /^(a|html)$/i;
      a.addEventListener("click", function(a) {
          d = a.target;
          while (!f.test(d.nodeName))
              d = d.parentNode;
          "href"in d && (chref = d.href).replace(e.href, "").indexOf("#") && (!/^[a-z\+\.\-]+:/i.test(chref) || chref.indexOf(e.protocol + "//" + e.host) === 0) && (a.preventDefault(),
          e.href = d.href)
      }, !1)
  }
}
)(document, window.navigator, "standalone");