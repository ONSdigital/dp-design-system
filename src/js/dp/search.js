const submitFilterForm = () => {
  console.log('T1', frm)
  const frm = document.getElementById("filterForm")
  if (frm) frm.submit()
}

const filters = document.querySelectorAll('.child-filter input')
filters.forEach((item) => {
  item.addEventListener("click", submitFilterForm)
})

export const Search = {
  submitFilterForm,
}
