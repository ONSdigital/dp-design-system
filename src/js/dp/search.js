// WIP
//
// const categories = document.querySelectorAll(".category-filter > input");
// categories.forEach((item) => {
//   item.addEventListener("click", (x) =>
//     console.log(x.target.attributes.categorychildren.value)
//   );
// });

/* Replace HTML of a given element with a new set from the server */
const fetchAndReplaceHtml = (url, selector, newSelector) => {
  return fetch(url, {
    method: "get",
    mode: "cors",
    headers: new Headers({
      Accept: "application/json",
      "access-control-allow-origin": "*",
    }),
  })
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      const parser = new DOMParser();
      const element = parser.parseFromString(html, "text/html");

      document
        .querySelector(selector)
        .replaceWith(element.querySelector(newSelector));
    });
};

/* Get search params and strigify them.  When removing a filter this allows us to
 * search for the entire filter string and remove it.
 *
 * I attemted this with urlSearchParams.delete(), however, as the filter param is
 * repeated multiple times in the search params query string it is difficult to iterate and
 * extract a specific filter param.
 *
 * Also, although it is possible to polyfill urlSearchParams, it is not supported by IE!
 */
const filters = document.querySelectorAll(".child-filter input");
let strParams = window.location.search;
filters.forEach((item) => {
  item.addEventListener("click", async (e) => {
    if (e.target.checked) {
      strParams += `&filter=${e.target.value}`;
    } else {
      strParams = strParams.replace(`&filter=${e.target.value}`, "");
    }

    await fetchAndReplaceHtml(
      `/search${strParams}`,
      ".search__results",
      ".search__results"
    );
  });
});
