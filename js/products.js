import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

// Base endpoint for products
const ENDPOINT = "/products";

// Store all products for filtering
let allProducts = [];

// ---------- Fetch and display all products ----------
export async function fetchProducts() {
  try {
    const products = await apiGet(ENDPOINT);
    allProducts = products;
    displayProducts(allProducts);
    return products;
  } catch (error) {
    alert("Error fetching products: " + error.message);
  }
}

// Render products into a table/list in the HTML
function displayProducts(products) {
  const container = document.getElementById("products-container");
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Price</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  products.forEach(function (product) {
    html += `
      <tr>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>₦${product.price}</td>
        <td>${product.category}</td>
        <td>
          <button onclick="editProduct(${product.id})">Edit</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

// ---------- Filter products by search term and state ----------
function filterProducts() {
  const searchInput = document.getElementById("search-input");
  const stateFilter = document.getElementById("state-filter");

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const stateValue = stateFilter ? stateFilter.value : "";

  const filtered = allProducts.filter(function (product) {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesState = !stateValue || product.state === stateValue;

    return matchesSearch && matchesState;
  });

  displayProducts(filtered);
}

// ---------- Create a new product ----------
export async function createProduct(productData) {
  try {
    const newProduct = await apiPost(ENDPOINT, productData);
    alert("Product created successfully!");
    fetchProducts();
    return newProduct;
  } catch (error) {
    alert("Error creating product: " + error.message);
  }
}

// ---------- Update an existing product ----------
export async function updateProduct(id, productData) {
  try {
    const updated = await apiPut(ENDPOINT + "/" + id, productData);
    alert("Product updated successfully!");
    fetchProducts();
    return updated;
  } catch (error) {
    alert("Error updating product: " + error.message);
  }
}

// ---------- Delete a product ----------
export async function deleteProduct(id) {
  const confirmDelete = confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  try {
    await apiDelete(ENDPOINT + "/" + id);
    alert("Product deleted successfully!");
    fetchProducts();
  } catch (error) {
    alert("Error deleting product: " + error.message);
  }
}

// populate a form for editing 
export async function editProduct(id) {
  try {
    const product = await apiGet(ENDPOINT + "/" + id);

    document.getElementById("product-name").value = product.name || "";
    document.getElementById("product-description").value = product.description || "";
    document.getElementById("product-price").value = product.price || "";
    document.getElementById("product-category").value = product.category || "";

    document.getElementById("product-form").dataset.editId = id;
  } catch (error) {
    alert("Error loading product: " + error.message);
  }
}

// handle form submission (create or update) 
export async function handleProductFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const productData = {
    name: document.getElementById("product-name").value,
    description: document.getElementById("product-description").value,
    price: parseFloat(document.getElementById("product-price").value),
    category: document.getElementById("product-category").value,
  };

  const editId = form.dataset.editId;

  if (editId) {
    await updateProduct(editId, productData);
    delete form.dataset.editId;
  } else {
    await createProduct(productData);
  }

  form.reset();
}

// ---------- Load products when page loads ----------
document.addEventListener("DOMContentLoaded", function () {
  fetchProducts();

  // Attach form submit handler
  const form = document.getElementById("product-form");
  if (form) {
    form.addEventListener("submit", handleProductFormSubmit);
  }

  // Filter button
  const filterBtn = document.getElementById("filter-btn");
  if (filterBtn) {
    filterBtn.addEventListener("click", filterProducts);
  }

  // Search on Enter key
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        filterProducts();
      }
    });
  }
});