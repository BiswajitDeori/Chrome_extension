document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  document.getElementById('price-tracker-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const productUrl = document.getElementById('product-url').value;
    const desiredPrice = parseFloat(document.getElementById('desired-price').value);

    chrome.storage.sync.get({ products: [] }, function(data) {
      const products = data.products;

      fetchProductData(productUrl)
        .then(productData => {
          products.push({
            url: productUrl,
            desiredPrice: desiredPrice,
            currentPrice: productData.price,
            imageUrl: productData.imageUrl,
            productName: productData.name
          });
          chrome.storage.sync.set({ products: products }, function() {
            alert('Product inserted to wish list!');
            loadProductList();
          });
        })
        .catch(error => {
          console.error('Error fetching product data:', error);
        });
    });
  });

  function fetchProductData(url) {
    return fetch(url)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const name = doc.querySelector('#productTitle')?.textContent.trim();
        const priceElement = doc.querySelector('.a-price-whole');
        const imageElement = doc.querySelector('#imgTagWrapperId img');

        const price = priceElement ? parseFloat(priceElement.innerText.replace(/[^\d.]/g, '')) : null;
        const imageUrl = imageElement ? imageElement.src : 'Image not found';

        return { name, price, imageUrl };
      });
  }

  function loadProductList() {
    chrome.storage.sync.get({ products: [] }, function(data) {
      const productList = document.getElementById('product-list');
      productList.innerHTML = '';

      data.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
          <img src="${product.imageUrl}" alt="${product.productName}">
          <div class="product-details">
            <p><strong><a href="${product.url}" target="_blank">${product.productName}</a></strong></p>
            <p>Desired Price: Rs. ${product.desiredPrice}</p>
          </div>
          <span class="delete-btn" data-url="${product.url}">&times;</span>
        `;
        productList.appendChild(productCard);

        fetchProductData(product.url)
          .then(productData => {
            const price = productData.price;

            const priceParagraph = document.createElement('p');
            if (price !== null) {
              priceParagraph.textContent = `Current Price: Rs. ${price}`;
            } else {
              priceParagraph.textContent = `Current Price: Not Available`;
            }
            productCard.querySelector('.product-details').appendChild(priceParagraph);
          })
          .catch(error => {
            const priceParagraph = document.createElement('p');
            priceParagraph.textContent = `Current Price: Error`;
            productCard.querySelector('.product-details').appendChild(priceParagraph);
            console.error('Error fetching product price:', error);
          });

        productCard.querySelector('.delete-btn').addEventListener('click', function() {
          deleteProduct(product.url);
        });
      });
    });
  }

  function deleteProduct(url) {
    chrome.storage.sync.get({ products: [] }, function(data) {
      const products = data.products.filter(product => product.url !== url);
      chrome.storage.sync.set({ products: products }, function() {
        loadProductList();
      });
    });
  }

  loadProductList();
});
