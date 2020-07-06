// File loaded on client browser !
const deleteProduct = (btn) => {
  // console.log("clicked!", btn);
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  // console.log(prodId, csrf);
  // JS method to find the closest 'article' element (the ancestor)
  const productElement = btn.closest('article');
  // fetch is a method used to fetch and send data from the browser
  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      productElement.remove(); // function not supported in IE
    })
    .catch((err) => console.log(err));
};
