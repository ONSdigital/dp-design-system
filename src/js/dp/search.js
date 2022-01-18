// WIP
//
// const categories = document.querySelectorAll(".category-filter > input");
// categories.forEach((item) => {
//   item.addEventListener("click", (x) =>
//     console.log(x.target.attributes.categorychildren.value)
//   );
// });

const fetchHtml = async (url) => {
  const response = await fetch(url, {
    method: "get",
    mode: "cors",
    headers: new Headers({
      Accept: "application/json",
    }),
  });
  return (await response) && response.text();
};

const filters = document.querySelectorAll(".child-filter input");
let strParams = window.location.search;

filters.forEach((item) => {
  item.addEventListener("click", async (e) => {
    if (e.target.checked) {
      strParams += `&filter=${e.target.value}`;
    } else {
      strParams = strParams.replace(`${new RegExp(/(\&|\?)filter)/)}=${e.target.value}`, "");
    }

    const responseText = await fetchHtml(`/search${strParams}&page=1`);
    if (responseText) {
      const dom = new DOMParser().parseFromString(responseText, "text/html");

      document
        .querySelector(".search__results")
        .replaceWith(dom.querySelector(".search__results"));

      // WIP
      // document
      //   .querySelector(".search__pagintion")
      //   .replaceWith(dom.querySelector(".search__pagintion"));
    }
  });
});
