// Values every page gets, worked out from its `lang` front matter and its URL.
//   t       the text for the page's language (src/_data/en.json or ar.json)
//   enPath  this page's English URL, e.g. /privacy/
//   arPath  this page's Arabic URL,  e.g. /ar/privacy/
// English pages live at /x/ and their Arabic versions at /ar/x/.
export default {
  t: (data) => data[data.lang || "en"],
  enPath: (data) => (data.lang === "ar" ? data.page.url.replace(/^\/ar\//, "/") : data.page.url),
  arPath: (data) => (data.lang === "ar" ? data.page.url : "/ar" + data.page.url),
};
