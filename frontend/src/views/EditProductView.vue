<script setup>
import { useAuthStore } from "@/store/auth";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { computed } from "vue";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();
const route = useRoute();

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

const productId = ref(route.params.productId);
console.log("sdfsfs " + productId.value);

const product = ref({
  id: "",
  name: "",
  description: "",
  category: "",
  originalPrice: 0,
  pictureUrl: "",
  endDate: new Date(),
  sellerId: 0,
});

const fetchProductDetails = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${productId.value}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching product details");
    }

    const product = await response.json();
    console.log(product.name);
    return product;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};

fetchProductDetails(productId.value)
  .then((data) => {
    product.value = data;
    product.value.endDate = product.value.endDate.slice(0, 10);
  })
  .catch((error) => {
    console.error("Error fetching product details:", error);
  });

const isValidForm = computed(() => {
  return (
    product.value.name &&
    product.value.description &&
    product.value.category &&
    product.value.originalPrice &&
    product.value.pictureUrl &&
    product.value.endDate
  );
});

const isLoading = ref(false);
const buttonFailed = ref(false);

const updateProduct = async (e) => {
  e.preventDefault();
  isLoading.value = true;

  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${product.value.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(product.value),
      },
    );

    if (!response.ok) throw new Error("Failed to update product");

    const updatedProduct = await response.json();
    console.log("Product updated:", updatedProduct);
    buttonFailed.value = false;
  } catch (error) {
    console.error("Error updating product:", error);
    buttonFailed.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <h1 class="text-center">Modifier un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form>
        <div
          v-if="buttonFailed"
          class="alert alert-danger mt-4"
          role="alert"
          data-test-error
        >
          Une erreur est survenue
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
            v-model="product.name"
            type="text"
            class="form-control"
            id="product-name"
            required
            data-test-product-name
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
            v-model="product.description"
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            required
            data-test-product-description
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
            v-model="product.category"
            type="text"
            class="form-control"
            id="product-category"
            required
            data-test-product-category
          />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input
              v-model="product.originalPrice"
              type="number"
              class="form-control"
              id="product-original-price"
              name="originalPrice"
              step="1"
              min="0"
              required
              data-test-product-price
            />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
            v-model="product.pictureUrl"
            type="url"
            class="form-control"
            id="product-picture-url"
            name="pictureUrl"
            required
            data-test-product-picture
          />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input
            v-model="product.endDate"
            type="date"
            class="form-control"
            id="product-end-date"
            name="endDate"
            required
            data-test-product-end-date
          />
        </div>

        <div class="d-grid gap-2">
          <button
            type="submit"
            class="btn btn-primary"
            @click="updateProduct"
            :disabled="!isValidForm || isLoading"
            data-test-submit
          >
            Modifier le produit
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              data-test-spinner
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
